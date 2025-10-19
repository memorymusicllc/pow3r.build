/**
 * Deployer Agent - CloudFlare Deployment & Verification
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * Deployment, infrastructure, and production verification
 * Deploys to CloudFlare Pages with automatic configuration
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { execSync } from 'child_process';
import { join, dirname } from 'path';

class DeployerAgent {
  constructor() {
    this.deployments = [];
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-iii',
      requiredTests: [
        {
          description: 'Verify that Deployer Agent can deploy to CloudFlare Pages successfully',
          testType: 'e2e-playwright',
          expectedOutcome: 'Deployment completed with production URL verification'
        },
        {
          description: 'Verify that Deployer Agent can test API functionality after deployment',
          testType: 'e2e-playwright',
          expectedOutcome: 'API endpoints tested and verified in production'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['deploymentSuccess', 'apiHealth', 'productionUptime'],
        failureCondition: 'deploymentSuccess < 0.95 for 5m',
        repairPrompt: 'Deployer Agent has failed to maintain deployment success. Analyze deployment failures, check CloudFlare configuration, and repair deployment mechanisms according to Article III requirements.'
      }
    };
  }

  /**
   * Initialize Deployer Agent
   */
  async initialize() {
    try {
      console.log('🚀 Deployer Agent initialized');
      return true;
    } catch (error) {
      console.error('❌ Deployer Agent initialization failed:', error);
      return false;
    }
  }

  /**
   * Deploy to CloudFlare Pages
   * @param {Object} testSuite - Test suite from Tester Agent
   * @returns {Object} Deployment result
   */
  async deployToCloudFlare(testSuite) {
    try {
      console.log('🚀 Deploying to CloudFlare Pages...');

      const deployment = {
        id: `deployment-${Date.now()}`,
        testSuiteId: testSuite.id,
        timestamp: new Date().toISOString(),
        status: 'deploying',
        steps: [],
        productionUrl: null,
        apiTests: [],
        screenshots: [],
        constitutionalCompliance: true
      };

      // Step 1: Build application
      await this.executeDeploymentStep(deployment, 'build', async () => {
        console.log('🔨 Building application...');
        execSync('npm run build', { cwd: join(process.cwd(), '..') });
        return { success: true, message: 'Build completed successfully' };
      });

      // Step 2: Deploy to CloudFlare Pages
      await this.executeDeploymentStep(deployment, 'deploy', async () => {
        console.log('☁️ Deploying to CloudFlare Pages...');
        
        // Use Wrangler to deploy
        const deployResult = execSync('npx wrangler pages deploy dist', { 
          cwd: join(process.cwd(), '..'),
          encoding: 'utf8'
        });
        
        // Extract production URL from deployment output
        const urlMatch = deployResult.match(/https:\/\/[^\s]+\.pages\.dev/);
        const productionUrl = urlMatch ? urlMatch[0] : 'https://thewatchmen.pages.dev';
        
        deployment.productionUrl = productionUrl;
        return { 
          success: true, 
          message: 'Deployment completed successfully',
          productionUrl: productionUrl
        };
      });

      // Step 3: Verify deployment
      await this.executeDeploymentStep(deployment, 'verify', async () => {
        console.log('✅ Verifying deployment...');
        
        // Test production URL accessibility
        const response = await fetch(deployment.productionUrl);
        const isAccessible = response.ok;
        
        if (!isAccessible) {
          throw new Error(`Production URL not accessible: ${deployment.productionUrl}`);
        }
        
        return { 
          success: true, 
          message: 'Deployment verification successful',
          statusCode: response.status
        };
      });

      // Step 4: Test API endpoints
      await this.executeDeploymentStep(deployment, 'api-test', async () => {
        console.log('🔌 Testing API endpoints...');
        
        const apiTests = await this.testAPIEndpoints(deployment.productionUrl);
        deployment.apiTests = apiTests;
        
        const allPassed = apiTests.every(test => test.success);
        if (!allPassed) {
          throw new Error('API tests failed');
        }
        
        return { 
          success: true, 
          message: 'API tests passed successfully',
          testCount: apiTests.length
        };
      });

      // Step 5: Generate production screenshots
      await this.executeDeploymentStep(deployment, 'screenshots', async () => {
        console.log('📸 Generating production screenshots...');
        
        const screenshots = await this.generateProductionScreenshots(deployment.productionUrl);
        deployment.screenshots = screenshots;
        
        return { 
          success: true, 
          message: 'Production screenshots generated',
          screenshotCount: screenshots.length
        };
      });

      // Step 6: Final verification
      await this.executeDeploymentStep(deployment, 'final-verification', async () => {
        console.log('🎯 Final production verification...');
        
        // Comprehensive production test
        const verification = await this.performFinalVerification(deployment);
        
        if (!verification.success) {
          throw new Error('Final verification failed');
        }
        
        return { 
          success: true, 
          message: 'Final verification successful',
          details: verification.details
        };
      });

      deployment.status = 'completed';
      deployment.completedAt = new Date().toISOString();

      await this.saveDeployment(deployment);
      console.log('✅ CloudFlare deployment completed:', deployment.id);
      console.log('🌐 Production URL:', deployment.productionUrl);

      return deployment;

    } catch (error) {
      console.error('❌ CloudFlare deployment failed:', error);
      throw error;
    }
  }

  /**
   * Execute deployment step
   */
  async executeDeploymentStep(deployment, stepName, stepFunction) {
    const step = {
      name: stepName,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      result: null,
      error: null
    };

    try {
      console.log(`🔄 Executing deployment step: ${stepName}`);
      
      step.result = await stepFunction();
      
      step.status = 'completed';
      step.endTime = new Date().toISOString();
      step.duration = new Date(step.endTime) - new Date(step.startTime);
      
      console.log(`✅ Deployment step completed: ${stepName} (${step.duration}ms)`);
      
    } catch (error) {
      console.error(`❌ Deployment step failed: ${stepName}`, error);
      
      step.status = 'failed';
      step.error = error.message;
      step.endTime = new Date().toISOString();
      step.duration = new Date(step.endTime) - new Date(step.startTime);
      
      throw error;
    } finally {
      deployment.steps.push(step);
    }
  }

  /**
   * Test API endpoints
   */
  async testAPIEndpoints(baseUrl) {
    const apiTests = [];

    // Test main API endpoints
    const endpoints = [
      { path: '/api/status', method: 'GET', expectedStatus: 200 },
      { path: '/api/x-files/cases', method: 'GET', expectedStatus: 200 },
      { path: '/api/x-files/create', method: 'POST', expectedStatus: 200 },
      { path: '/api/auth/status', method: 'GET', expectedStatus: 200 }
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint.path}`;
        const options = {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' }
        };

        if (endpoint.method === 'POST') {
          options.body = JSON.stringify({ test: true });
        }

        const response = await fetch(url, options);
        const isSuccess = response.status === endpoint.expectedStatus;

        apiTests.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          expectedStatus: endpoint.expectedStatus,
          actualStatus: response.status,
          success: isSuccess,
          responseTime: Date.now(),
          constitutionalCompliance: true
        });

      } catch (error) {
        apiTests.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          expectedStatus: endpoint.expectedStatus,
          actualStatus: 0,
          success: false,
          error: error.message,
          constitutionalCompliance: false
        });
      }
    }

    return apiTests;
  }

  /**
   * Generate production screenshots
   */
  async generateProductionScreenshots(baseUrl) {
    const screenshots = [];

    try {
      // Create screenshots directory
      const screenshotsDir = join(process.cwd(), '..', 'test-results', 'production-screenshots');
      await mkdir(screenshotsDir, { recursive: true });

      // Generate screenshots using Playwright
      const screenshotScript = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to production URL
  await page.goto('${baseUrl}');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take full page screenshot
  await page.screenshot({ 
    path: '${screenshotsDir}/production-full-page.png',
    fullPage: true 
  });
  
  // Take mobile viewport screenshot
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ 
    path: '${screenshotsDir}/production-mobile-view.png',
    fullPage: true 
  });
  
  // Take desktop viewport screenshot
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ 
    path: '${screenshotsDir}/production-desktop-view.png',
    fullPage: true 
  });
  
  await browser.close();
  console.log('Production screenshots generated successfully');
})().catch(console.error);
`;

      // Write and execute screenshot script
      const scriptPath = join(screenshotsDir, 'generate-screenshots.js');
      await writeFile(scriptPath, screenshotScript);
      
      execSync(`node ${scriptPath}`, { cwd: join(process.cwd(), '..') });

      // Record screenshot files
      screenshots.push(
        {
          name: 'production-full-page.png',
          path: join(screenshotsDir, 'production-full-page.png'),
          type: 'full-page',
          viewport: '1920x1080'
        },
        {
          name: 'production-mobile-view.png',
          path: join(screenshotsDir, 'production-mobile-view.png'),
          type: 'mobile',
          viewport: '375x667'
        },
        {
          name: 'production-desktop-view.png',
          path: join(screenshotsDir, 'production-desktop-view.png'),
          type: 'desktop',
          viewport: '1920x1080'
        }
      );

    } catch (error) {
      console.error('Failed to generate screenshots:', error);
      screenshots.push({
        name: 'screenshot-error',
        path: null,
        type: 'error',
        error: error.message
      });
    }

    return screenshots;
  }

  /**
   * Perform final verification
   */
  async performFinalVerification(deployment) {
    try {
      const verification = {
        success: true,
        details: {
          productionUrl: deployment.productionUrl,
          apiTests: deployment.apiTests.length,
          screenshots: deployment.screenshots.length,
          constitutionalCompliance: true,
          timestamp: new Date().toISOString()
        }
      };

      // Verify production URL is accessible
      const response = await fetch(deployment.productionUrl);
      if (!response.ok) {
        throw new Error(`Production URL not accessible: ${response.status}`);
      }

      // Verify API tests passed
      const failedApiTests = deployment.apiTests.filter(test => !test.success);
      if (failedApiTests.length > 0) {
        throw new Error(`${failedApiTests.length} API tests failed`);
      }

      // Verify screenshots were generated
      const validScreenshots = deployment.screenshots.filter(s => s.path && !s.error);
      if (validScreenshots.length === 0) {
        throw new Error('No valid screenshots generated');
      }

      // Verify constitutional compliance
      const nonCompliantTests = deployment.apiTests.filter(test => !test.constitutionalCompliance);
      if (nonCompliantTests.length > 0) {
        throw new Error(`${nonCompliantTests.length} tests failed constitutional compliance`);
      }

      return verification;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: {
          productionUrl: deployment.productionUrl,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Save deployment record
   */
  async saveDeployment(deployment) {
    try {
      const deploymentPath = join(process.cwd(), 'reports', `deployment-${deployment.id}.json`);
      await writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
      this.deployments.push(deployment);
    } catch (error) {
      console.error('❌ Failed to save deployment:', error);
    }
  }

  /**
   * Get deployment report
   */
  getDeploymentReport() {
    return {
      deployerAgent: 'active',
      totalDeployments: this.deployments.length,
      lastDeployment: this.deployments[this.deployments.length - 1]?.id || 'none',
      status: 'operational'
    };
  }
}

export default DeployerAgent;
