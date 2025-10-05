# Cursor IDE Terminal Hanging Solutions

## Problem Analysis

Cursor IDE terminal hanging during Playwright test execution is a known issue affecting multiple users. Based on research and testing, here are the root causes and solutions:

## Root Causes Identified

### 1. **Terminal Integration Settings**
- Cursor IDE's terminal integration can cause hangs when shell integration is misconfigured
- Large output streams can overwhelm the terminal buffer
- Shell profile configurations (`.zshrc`, `.bashrc`) can interfere with terminal operations

### 2. **Playwright-Specific Issues**
- Playwright version 1.54.2 has known hanging issues in certain scenarios
- Test timeouts and worker configuration can cause deadlocks
- Parallel test execution can overwhelm system resources

### 3. **System Configuration**
- Node.js v20.0.0 compatibility issues with certain Playwright versions
- macOS shell configuration conflicts
- Terminal buffer size limitations

## Comprehensive Solutions

### Solution 1: Optimize Playwright Configuration

```javascript
// playwright.config.js - Optimized Configuration
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // Reduce parallel execution to prevent resource conflicts
  fullyParallel: false,
  workers: 1, // Single worker to prevent hanging
  
  // Optimize timeouts
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  // Reduce output verbosity
  reporter: [
    ['list', { printSteps: false }], // Minimal output
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: process.env.TEST_URL || 'https://dantesprayer.pages.dev',
    
    // Disable resource-intensive features
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off', // Disable video to reduce resource usage
    
    // Add explicit timeouts
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Reduce resource usage
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        }
      },
    },
  ],
});
```

### Solution 2: Terminal Configuration Fixes

#### A. Enable Shell Integration
```json
// Cursor IDE Settings (settings.json)
{
  "terminal.integrated.shellIntegration.enabled": true,
  "terminal.integrated.shellIntegration.decorationsEnabled": true,
  "terminal.integrated.shellIntegration.history": true
}
```

#### B. Optimize Terminal Buffer
```json
// Cursor IDE Settings
{
  "terminal.integrated.scrollback": 1000,
  "terminal.integrated.fastScrollSensitivity": 5,
  "terminal.integrated.mouseWheelScrollSensitivity": 1
}
```

### Solution 3: Shell Profile Optimization

#### For macOS (.zshrc):
```bash
# Remove or comment out problematic configurations
# export PATH="$PATH:/usr/local/bin"
# source ~/.zshrc

# Add explicit terminal settings
export TERM=xterm-256color
export LANG=en_US.UTF-8
```

### Solution 4: Playwright Test Execution Strategy

#### A. Run Tests in Smaller Batches
```bash
# Instead of running all tests at once
npx playwright test --grep "specific-test-name"

# Or run by file
npx playwright test tests/e2e/medical-features.test.ts
```

#### B. Use Headless Mode with Reduced Resources
```bash
# Run with minimal resource usage
npx playwright test --headed=false --workers=1 --timeout=60000
```

### Solution 5: Alternative Execution Methods

#### A. Use Background Process
```bash
# Run tests in background to prevent terminal hanging
nohup npx playwright test > test-output.log 2>&1 &
```

#### B. Use Docker for Isolation
```dockerfile
# Dockerfile for isolated testing
FROM mcr.microsoft.com/playwright:v1.54.2-focal
WORKDIR /app
COPY . .
RUN npm install
CMD ["npx", "playwright", "test"]
```

### Solution 6: Cursor IDE Specific Fixes

#### A. Terminal Settings
```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "args": ["-l"]
    }
  },
  "terminal.integrated.shellIntegration.enabled": true,
  "terminal.integrated.shellIntegration.decorationsEnabled": false
}
```

#### B. Workspace Settings
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/test-results/**": true,
    "**/playwright-report/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/test-results": true
  }
}
```

## Implementation Steps

### Step 1: Update Playwright Configuration
1. Replace current `playwright.config.js` with optimized version
2. Set `workers: 1` and `fullyParallel: false`
3. Disable video recording and tracing
4. Increase timeouts appropriately

### Step 2: Configure Cursor IDE Terminal
1. Open Cursor IDE Settings
2. Search for "terminal integration"
3. Enable shell integration
4. Set appropriate buffer sizes

### Step 3: Optimize Shell Profile
1. Backup current `.zshrc`
2. Remove or comment out custom configurations
3. Add explicit terminal settings
4. Restart Cursor IDE

### Step 4: Test with Minimal Configuration
1. Run single test first: `npx playwright test --grep "should load"`
2. If successful, gradually increase test scope
3. Monitor terminal responsiveness

### Step 5: Implement Monitoring
```bash
# Add to test scripts for monitoring
echo "Starting test at $(date)"
npx playwright test --reporter=list
echo "Test completed at $(date)"
```

## Prevention Strategies

### 1. **Resource Monitoring**
- Monitor CPU and memory usage during test execution
- Set appropriate worker limits based on system resources
- Use `--workers=1` for stability

### 2. **Output Management**
- Redirect large outputs to files
- Use minimal reporters
- Disable verbose logging

### 3. **Incremental Testing**
- Run tests in small batches
- Use test filtering to run specific tests
- Implement test prioritization

### 4. **Alternative Execution**
- Use external terminal (Terminal.app) for long-running tests
- Implement CI/CD pipeline for automated testing
- Use Docker for isolated test environments

## Verification Steps

1. **Test Terminal Responsiveness**
   ```bash
   echo "Terminal test 1"
   sleep 2
   echo "Terminal test 2"
   ```

2. **Test Playwright Execution**
   ```bash
   npx playwright test --grep "should load" --headed=false
   ```

3. **Monitor Resource Usage**
   ```bash
   top -pid $(pgrep -f playwright)
   ```

## Conclusion

The terminal hanging issue in Cursor IDE during Playwright test execution can be resolved through:

1. **Configuration Optimization**: Proper Playwright and terminal settings
2. **Resource Management**: Limiting parallel execution and output
3. **Shell Integration**: Enabling proper terminal integration
4. **Incremental Testing**: Running tests in smaller batches
5. **Alternative Methods**: Using external terminals or CI/CD

By implementing these solutions systematically, you can achieve stable Playwright test execution in Cursor IDE without terminal hanging issues.

---

*Last Updated: January 2025*
*Version: 1.0*
*Based on: Research, Testing, and Community Solutions*
