/**
 * A-TEAM System - Main Entry Point
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * The A-TEAM System is a fully autonomous ecosystem with multiple highly skilled agents
 * operating under the Project Phoenix Constitution v3.0 to handle the complete development
 * lifecycle automatically.
 * 
 * A-TEAM Components:
 * - Abi Director: Context Log, Intent Tracker, Goal Scoring, Confidence Assessment
 * - Chat Analyzer: Request tracking, unresolved likelihood calculation
 * - Verification Agent: Code quality, deployment verification
 * - APD Manager: Architectural Progress Diagram management
 * - Enhanced Agent Orchestrator: Full-auto workflow management
 * - Guardian Agent: Constitutional enforcement
 * - Architect Agent: System design and planning
 * 
 * Usage:
 * node ateam-system.js "Your request here"
 */

import ATEAMOrchestrator from './ateam-orchestrator.js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

class ATEAMSystem {
  constructor() {
    this.name = 'A-TEAM System';
    this.version = '3.0';
    this.orchestrator = null;
    this.initialized = false;
  }

  /**
   * Initialize the A-TEAM System
   */
  async initialize() {
    try {
      console.log('🚀 Initializing A-TEAM System...');
      console.log('🎯 Project Phoenix Constitution v3.0 (X-FILES Edition)');
      console.log('🤖 Autonomous Multi-Agent System');

      // Initialize A-TEAM Orchestrator
      this.orchestrator = new ATEAMOrchestrator();
      const success = await this.orchestrator.initialize();

      if (success) {
        this.initialized = true;
        console.log('✅ A-TEAM System initialized successfully');
        console.log('🎭 All agents are operational and ready for autonomous operation');
        return true;
      } else {
        throw new Error('Failed to initialize A-TEAM Orchestrator');
      }

    } catch (error) {
      console.error('❌ A-TEAM System initialization failed:', error);
      return false;
    }
  }

  /**
   * Process user request through the A-TEAM system
   * @param {Object} userRequest - User request to process
   */
  async processUserRequest(userRequest) {
    if (!this.initialized) {
      throw new Error('A-TEAM System not initialized. Call initialize() first.');
    }

    try {
      console.log('🎯 Processing user request through A-TEAM system...');
      console.log(`📝 Request: ${userRequest.text}`);

      // Execute full-auto workflow
      const result = await this.orchestrator.executeFullAutoWorkflow(userRequest);

      // Log the result
      await this.logSystemResult(userRequest, result);

      return result;

    } catch (error) {
      console.error('❌ A-TEAM System request processing failed:', error);
      
      // Log the error
      await this.logSystemError(userRequest, error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    if (!this.initialized) {
      return {
        system: 'A-TEAM',
        status: 'not_initialized',
        version: this.version
      };
    }

    return {
      system: 'A-TEAM',
      status: 'operational',
      version: this.version,
      orchestrator: this.orchestrator.getStatus(),
      agents: this.orchestrator.getAgentStatus(),
      constitutionalCompliance: true,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Get constitutional compliance status
   */
  getConstitutionalCompliance() {
    if (!this.initialized) {
      return {
        compliant: false,
        reason: 'System not initialized'
      };
    }

    return {
      compliant: true,
      constitution: 'Project Phoenix Constitution v3.0 (X-FILES Edition)',
      agents: Object.keys(this.orchestrator.agents).length,
      lastValidation: new Date().toISOString()
    };
  }

  /**
   * Get Abi Director's exclusive report (Goal Score and Confidence only)
   */
  async getAbiDirectorReport() {
    if (!this.initialized) {
      return null;
    }

    return await this.orchestrator.getAbiDirectorReport();
  }

  /**
   * Log system result
   */
  async logSystemResult(userRequest, result) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userRequest: userRequest,
        result: result,
        system: 'A-TEAM',
        version: this.version
      };

      const logPath = join(process.cwd(), 'reports', `ateam-result-${Date.now()}.json`);
      await writeFile(logPath, JSON.stringify(logEntry, null, 2));
      
      console.log('📋 A-TEAM system result logged');
    } catch (error) {
      console.error('❌ Failed to log A-TEAM system result:', error);
    }
  }

  /**
   * Log system error
   */
  async logSystemError(userRequest, error) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userRequest: userRequest,
        error: error.message,
        stack: error.stack,
        system: 'A-TEAM',
        version: this.version
      };

      const logPath = join(process.cwd(), 'reports', `ateam-error-${Date.now()}.json`);
      await writeFile(logPath, JSON.stringify(logEntry, null, 2));
      
      console.log('📋 A-TEAM system error logged');
    } catch (logError) {
      console.error('❌ Failed to log A-TEAM system error:', logError);
    }
  }

  /**
   * Shutdown the A-TEAM system
   */
  async shutdown() {
    try {
      console.log('🛑 Shutting down A-TEAM System...');
      
      // Log shutdown
      const shutdownLog = {
        timestamp: new Date().toISOString(),
        system: 'A-TEAM',
        version: this.version,
        status: 'shutdown',
        reason: 'User requested shutdown'
      };

      const logPath = join(process.cwd(), 'reports', `ateam-shutdown-${Date.now()}.json`);
      await writeFile(logPath, JSON.stringify(shutdownLog, null, 2));

      this.initialized = false;
      this.orchestrator = null;
      
      console.log('✅ A-TEAM System shutdown complete');
    } catch (error) {
      console.error('❌ A-TEAM System shutdown failed:', error);
    }
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const userRequestText = args.join(' ');

  if (!userRequestText) {
    console.log('🎯 A-TEAM System - Project Phoenix Constitution v3.0 (X-FILES Edition)');
    console.log('🤖 Autonomous Multi-Agent System');
    console.log('');
    console.log('Usage: node ateam-system.js "Your request here"');
    console.log('');
    console.log('Example: node ateam-system.js "Implement a new feature for user authentication"');
    process.exit(1);
  }

  const ateamSystem = new ATEAMSystem();

  try {
    // Initialize the system
    const initialized = await ateamSystem.initialize();
    
    if (!initialized) {
      console.error('❌ Failed to initialize A-TEAM System');
      process.exit(1);
    }

    // Process user request
    const userRequest = {
      text: userRequestText,
      timestamp: new Date().toISOString(),
      source: 'command_line'
    };

    console.log('🚀 Starting A-TEAM autonomous workflow...');
    const result = await ateamSystem.processUserRequest(userRequest);

    // Display results
    console.log('\n🎯 A-TEAM Workflow Results:');
    console.log('========================');
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Workflow ID: ${result.workflowId || 'N/A'}`);
    console.log(`Constitutional Compliance: ${result.constitutionalCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
    
    if (result.goalScore !== undefined) {
      console.log(`Goal Score: ${result.goalScore}%`);
    }
    
    if (result.confidence !== undefined) {
      console.log(`Confidence: ${result.confidence}%`);
    }

    if (result.error) {
      console.log(`Error: ${result.error}`);
    }

    console.log('\n🎭 A-TEAM System Status:');
    console.log('=======================');
    const status = ateamSystem.getSystemStatus();
    console.log(`System: ${status.system} v${status.version}`);
    console.log(`Status: ${status.status}`);
    console.log(`Agents: ${status.agents ? Object.keys(status.agents).length : 0}`);
    console.log(`Active Workflows: ${status.orchestrator?.activeWorkflows || 0}`);

    // Get Abi Director's exclusive report
    const abiReport = await ateamSystem.getAbiDirectorReport();
    if (abiReport) {
      console.log('\n🎯 Abi Director Report:');
      console.log('======================');
      console.log(`Goal Score: ${abiReport.goalScore}%`);
      console.log(`Confidence: ${abiReport.confidence}%`);
    }

    console.log('\n✅ A-TEAM autonomous workflow completed');
    console.log('🤖 All agents are ready for the next request');

  } catch (error) {
    console.error('❌ A-TEAM System execution failed:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export default ATEAMSystem;

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ A-TEAM System main execution failed:', error);
    process.exit(1);
  });
}


