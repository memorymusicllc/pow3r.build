// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  
  // Reduce parallel execution to prevent resource conflicts (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
  fullyParallel: false,
  workers: 1, // Single worker to prevent hanging
  
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Optimize timeouts (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  // Reduce output verbosity (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
  reporter: [['list', { printSteps: false }]],
  
  use: {
    baseURL: 'https://thewatchmen.pages.dev',
    
    // Disable resource-intensive features (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    
    // Add explicit timeouts (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Reduce resource usage (from CURSOR_IDE_TERMINAL_HANGING_SOLUTIONS.md)
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        }
      },
    },
  ],
});

