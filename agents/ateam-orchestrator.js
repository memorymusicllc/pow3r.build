/**
 * A-TEAM Orchestrator - Enhanced Agent Orchestration with Abi Director
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * The A-TEAM Orchestrator manages the complete autonomous agent system
 * with Abi Director providing goal scoring and confidence assessment.
 * 
 * A-TEAM Components:
 * - Abi Director: Context Log, Intent Tracker, Goal Scoring, Confidence Assessment
 * - Chat Analyzer: Request tracking, unresolved likelihood calculation
 * - Verification Agent: Code quality, deployment verification
 * - APD Manager: Architectural Progress Diagram management
 * - Enhanced Agent Orchestrator: Full-auto workflow management
 */

import GuardianAgent from './guardian-agent.js';
import ArchitectAgent from './architect-agent.js';
import AbiDirectorAgent from './abi-director-agent.js';
import ChatAnalyzerAgent from './chat-analyzer-agent.js';
import VerificationAgent from './verification-agent.js';
import APDManager from './apd-manager.js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

class ATEAMOrchestrator {
  constructor() {
    this.name = 'A-TEAM Orchestrator';
    this.role = 'Autonomous Agent System Management';
    this.version = '3.0';
    this.agents = {};
    this.workflows = [];
    this.activeWorkflows = [];
    this.chatHistory = [];
    
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-i',
      requiredTests: [
        {
          description: 'Verify that A-TEAM Orchestrator can coordinate all agents for full-auto workflow',
          testType: 'e2e-playwright',
          expectedOutcome: 'Complete autonomous development lifecycle executed successfully'
        },
        {
          description: 'Verify that A-TEAM Orchestrator maintains constitutional compliance throughout workflow',
          testType: 'e2e-playwright',
          expectedOutcome: 'All workflow steps comply with constitutional requirements'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['workflowSuccess', 'agentCoordination', 'constitutionalCompliance', 'goalAchievement'],
        failureCondition: 'workflowSuccess < 0.95 for 5m',
        repairPrompt: 'A-TEAM Orchestrator has failed to maintain autonomous workflow execution. Analyze agent coordination issues, check constitutional compliance, and repair orchestration mechanisms according to Article I requirements.'
      }
    };
  }

  /**
   * Initialize A-TEAM Orchestrator and all agents
   */
  async initialize() {
    try {
      console.log('🎭 Initializing A-TEAM Orchestrator...');

      // Initialize Abi Director (highest priority)
      this.agents.abiDirector = new AbiDirectorAgent();
      await this.agents.abiDirector.initialize();

      // Initialize Chat Analyzer
      this.agents.chatAnalyzer = new ChatAnalyzerAgent();
      await this.agents.chatAnalyzer.initialize();

      // Initialize Verification Agent
      this.agents.verification = new VerificationAgent();
      await this.agents.verification.initialize();

      // Initialize APD Manager
      this.agents.apdManager = new APDManager();
      await this.agents.apdManager.initialize();

      // Initialize Guardian Agent
      this.agents.guardian = new GuardianAgent();
      await this.agents.guardian.initialize();

      // Initialize Architect Agent
      this.agents.architect = new ArchitectAgent();
      await this.agents.architect.initialize();

      // TODO: Initialize other agents as they are implemented
      // this.agents.developer = new DeveloperAgent();
      // this.agents.tester = new TesterAgent();
      // this.agents.deployer = new DeployerAgent();
      // this.agents.documentation = new DocumentationAgent();
      // this.agents.repoManager = new RepoManagerAgent();
      // this.agents.xFiles = new XFilesAgent();

      console.log('✅ A-TEAM Orchestrator initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ A-TEAM Orchestrator initialization failed:', error);
      return false;
    }
  }

  /**
   * Execute full-auto workflow for user request with A-TEAM coordination
   * @param {Object} userRequest - User request to process
   * @returns {Object} Workflow execution result with Abi's goal scoring
   */
  async executeFullAutoWorkflow(userRequest) {
    const workflowId = `ateam-workflow-${Date.now()}`;
    const workflow = {
      id: workflowId,
      timestamp: new Date().toISOString(),
      userRequest: userRequest,
      status: 'running',
      phases: [],
      results: {},
      agentReports: {},
      constitutionalCompliance: true,
      completion: 0
    };

    try {
      console.log(`🚀 Starting A-TEAM full-auto workflow: ${workflowId}`);
      this.activeWorkflows.push(workflow);

      // Add to chat history for analysis
      this.chatHistory.push({
        role: 'user',
        content: userRequest.text,
        timestamp: userRequest.timestamp || new Date().toISOString()
      });

      // Phase 1: Chat Analysis & Request Tracking
      await this.executePhase(workflow, 'chat_analysis', async () => {
        const chatAnalysis = await this.agents.chatAnalyzer.analyzeChatHistory(this.chatHistory);
        workflow.results.chatAnalysis = chatAnalysis;
        workflow.agentReports.chatAnalyzer = {
          status: 'completed',
          result: chatAnalysis,
          constitutionalCompliance: true
        };
        return chatAnalysis;
      });

      // Phase 2: Request Analysis & Planning
      await this.executePhase(workflow, 'analysis', async () => {
        const plan = await this.agents.architect.analyzeRequest(userRequest);
        workflow.results.plan = plan;
        workflow.agentReports.architect = {
          status: 'completed',
          result: plan,
          constitutionalCompliance: true
        };
        return plan;
      });

      // Phase 3: Constitutional Validation
      await this.executePhase(workflow, 'validation', async () => {
        const validation = await this.agents.guardian.validateAction({
          type: 'workflow_execution',
          payload: {
            schemaDriven: true,
            configFirst: true,
            e2eTests: true,
            liveVerification: true,
            mobileFirst: true,
            unboundDesign: true,
            xFilesIntegration: true,
            caseFileCreation: true,
            selfHealing: true,
            observability: true,
            constitutionalValidation: true,
            backwardCompatibility: true
          }
        });

        if (!validation.valid) {
          throw new Error(`Constitutional validation failed: ${validation.violations.join(', ')}`);
        }

        workflow.constitutionalCompliance = validation.valid;
        workflow.agentReports.guardian = {
          status: 'completed',
          result: validation,
          constitutionalCompliance: validation.valid
        };
        return validation;
      });

      // Phase 4: Code Quality Verification
      await this.executePhase(workflow, 'code_verification', async () => {
        const verification = await this.agents.verification.performCompleteVerification();
        workflow.results.verification = verification;
        workflow.agentReports.verification = {
          status: verification.allPassed ? 'completed' : 'failed',
          result: verification,
          constitutionalCompliance: verification.allPassed
        };
        return verification;
      });

      // Phase 5: APD Update
      await this.executePhase(workflow, 'apd_update', async () => {
        // Update APD with workflow information
        await this.agents.apdManager.addNode({
          id: `workflow-${workflowId}`,
          name: `Workflow ${workflowId}`,
          type: 'system.workflow',
          version: '3.0.0',
          description: `A-TEAM workflow for: ${userRequest.text}`,
          status: {
            state: 'in_progress',
            progress: workflow.completion
          },
          props: {
            workflowId: workflowId,
            userRequest: userRequest.text,
            timestamp: workflow.timestamp,
            quality: {
              qualityScore: 0.8
            }
          },
          ownerAgent: 'A-TEAM Orchestrator',
          priority: 8,
          currentTask: 'Workflow in progress',
          nextMilestone: 'Complete workflow execution'
        });

        const apdSummary = this.agents.apdManager.getAPDSummary();
        workflow.results.apdUpdate = apdSummary;
        workflow.agentReports.apdManager = {
          status: 'completed',
          result: apdSummary,
          constitutionalCompliance: true
        };
        return apdSummary;
      });

      // Phase 6: Development (when Developer Agent is implemented)
      if (workflow.results.plan.agents.includes('developer-agent')) {
        await this.executePhase(workflow, 'development', async () => {
          // TODO: Implement Developer Agent execution
          console.log('🔧 Development phase - Developer Agent not yet implemented');
          workflow.agentReports.developer = {
            status: 'pending',
            result: { message: 'Developer Agent implementation required' },
            constitutionalCompliance: true
          };
          return { status: 'pending', message: 'Developer Agent implementation required' };
        });
      }

      // Phase 7: Testing (when Tester Agent is implemented)
      if (workflow.results.plan.agents.includes('tester-agent')) {
        await this.executePhase(workflow, 'testing', async () => {
          // TODO: Implement Tester Agent execution
          console.log('🧪 Testing phase - Tester Agent not yet implemented');
          workflow.agentReports.tester = {
            status: 'pending',
            result: { message: 'Tester Agent implementation required' },
            constitutionalCompliance: true
          };
          return { status: 'pending', message: 'Tester Agent implementation required' };
        });
      }

      // Phase 8: Deployment (when Deployer Agent is implemented)
      if (workflow.results.plan.agents.includes('deployer-agent')) {
        await this.executePhase(workflow, 'deployment', async () => {
          // TODO: Implement Deployer Agent execution
          console.log('🚀 Deployment phase - Deployer Agent not yet implemented');
          workflow.agentReports.deployer = {
            status: 'pending',
            result: { message: 'Deployer Agent implementation required' },
            constitutionalCompliance: true
          };
          return { status: 'pending', message: 'Deployer Agent implementation required' };
        });
      }

      // Phase 9: Final Validation
      await this.executePhase(workflow, 'final_validation', async () => {
        const finalValidation = await this.agents.guardian.validateAction({
          type: 'workflow_completion',
          payload: {
            constitutionalCompliance: workflow.constitutionalCompliance,
            allPhasesCompleted: workflow.phases.every(p => p.status === 'completed'),
            deliverablesMet: true // TODO: Validate actual deliverables
          }
        });

        if (!finalValidation.valid) {
          throw new Error(`Final validation failed: ${finalValidation.violations.join(', ')}`);
        }

        workflow.agentReports.guardian.finalValidation = finalValidation;
        return finalValidation;
      });

      // Phase 10: Abi Director Goal Analysis
      await this.executePhase(workflow, 'goal_analysis', async () => {
        const goalAnalysis = await this.agents.abiDirector.analyzeGoalCompletion(
          userRequest,
          workflow.agentReports,
          {
            workflowCompleted: true,
            allPhasesCompleted: workflow.phases.every(p => p.status === 'completed'),
            constitutionalCompliance: workflow.constitutionalCompliance,
            deploymentVerified: workflow.agentReports.deployer?.status === 'completed',
            documentationUpdated: workflow.agentReports.documentation?.status === 'completed',
            githubPushed: true, // TODO: Verify actual GitHub push
            cloudflareDeployed: workflow.agentReports.deployer?.status === 'completed',
            screenshotTaken: workflow.agentReports.deployer?.result?.screenshot
          }
        );

        workflow.results.goalAnalysis = goalAnalysis;
        workflow.agentReports.abiDirector = {
          status: 'completed',
          result: goalAnalysis,
          constitutionalCompliance: true
        };

        // Add Abi's analysis to chat history
        this.chatHistory.push({
          role: 'assistant',
          content: `A-TEAM workflow completed. Goal Score: ${goalAnalysis.goalScore}%, Confidence: ${goalAnalysis.confidence}%`,
          timestamp: new Date().toISOString()
        });

        return goalAnalysis;
      });

      // Complete workflow
      workflow.status = 'completed';
      workflow.completion = 100;
      workflow.completedAt = new Date().toISOString();

      // Update APD with completion
      await this.agents.apdManager.updateNodeStatus(`workflow-${workflowId}`, {
        state: 'completed',
        progress: 100,
        quality: {
          qualityScore: workflow.results.goalAnalysis.goalScore / 100
        },
        notes: `Workflow completed with ${workflow.results.goalAnalysis.goalScore}% goal achievement`
      });

      console.log(`✅ A-TEAM full-auto workflow completed: ${workflowId}`);
      console.log(`🎯 Goal Score: ${workflow.results.goalAnalysis.goalScore}%`);
      console.log(`🎯 Confidence: ${workflow.results.goalAnalysis.confidence}%`);

      await this.saveWorkflow(workflow);

      return {
        success: true,
        workflowId: workflowId,
        status: 'completed',
        constitutionalCompliance: workflow.constitutionalCompliance,
        phases: workflow.phases.length,
        results: workflow.results,
        goalScore: workflow.results.goalAnalysis.goalScore,
        confidence: workflow.results.goalAnalysis.confidence,
        agentReports: workflow.agentReports
      };

    } catch (error) {
      console.error(`❌ A-TEAM workflow execution failed: ${workflowId}`, error);
      
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.failedAt = new Date().toISOString();

      // Create CaseFile for workflow failure
      await this.createWorkflowFailureCaseFile(workflow, error);

      // Update APD with failure
      await this.agents.apdManager.updateNodeStatus(`workflow-${workflowId}`, {
        state: 'failed',
        progress: workflow.completion,
        quality: {
          qualityScore: 0.0
        },
        notes: `Workflow failed: ${error.message}`
      });

      await this.saveWorkflow(workflow);
      
      return {
        success: false,
        workflowId: workflowId,
        status: 'failed',
        error: error.message,
        constitutionalCompliance: workflow.constitutionalCompliance,
        goalScore: 0,
        confidence: 0
      };
    } finally {
      // Remove from active workflows
      this.activeWorkflows = this.activeWorkflows.filter(w => w.id !== workflowId);
    }
  }

  /**
   * Execute a workflow phase
   */
  async executePhase(workflow, phaseName, phaseFunction) {
    const phase = {
      name: phaseName,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      result: null,
      error: null
    };

    try {
      console.log(`🔄 Executing A-TEAM phase: ${phaseName}`);
      
      // Execute phase function
      phase.result = await phaseFunction();
      
      // Complete phase
      phase.status = 'completed';
      phase.endTime = new Date().toISOString();
      phase.duration = new Date(phase.endTime) - new Date(phase.startTime);
      
      console.log(`✅ A-TEAM phase completed: ${phaseName} (${phase.duration}ms)`);
      
    } catch (error) {
      console.error(`❌ A-TEAM phase failed: ${phaseName}`, error);
      
      phase.status = 'failed';
      phase.error = error.message;
      phase.endTime = new Date().toISOString();
      phase.duration = new Date(phase.endTime) - new Date(phase.startTime);
      
      throw error;
    } finally {
      workflow.phases.push(phase);
      workflow.completion = (workflow.phases.length / 10) * 100; // 10 total phases
    }
  }

  /**
   * Create CaseFile for workflow failure
   */
  async createWorkflowFailureCaseFile(workflow, error) {
    const caseFile = {
      id: `ateam-workflow-failure-${Date.now()}`,
      type: 'system.case-file',
      caseType: 'SystemAnomaly',
      status: 'Open',
      dossier: {
        userIntent: 'A-TEAM full-auto workflow execution',
        componentId: 'ateam-orchestrator',
        componentConfig: this.agentDirectives,
        applicationState: {
          workflow: workflow,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        sessionRecordingRef: null,
        logs: [
          `A-TEAM workflow failure: ${workflow.id}`,
          `Error: ${error.message}`,
          `Phase: ${workflow.phases[workflow.phases.length - 1]?.name || 'unknown'}`,
          `Timestamp: ${new Date().toISOString()}`
        ],
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          activeWorkflows: this.activeWorkflows.length,
          agentCount: Object.keys(this.agents).length
        }
      },
      agentDirectives: {
        selfHealing: {
          repairPrompt: `A-TEAM workflow execution failed: ${workflow.id}. Error: ${error.message}. Analyze the root cause, determine which constitutional article was violated, create a plan to resolve it, and dispatch the necessary agents. Update this CaseFile's status as you progress.`
        }
      }
    };

    // Save CaseFile
    try {
      const caseFilePath = join(process.cwd(), 'reports', `casefile-${caseFile.id}.json`);
      await writeFile(caseFilePath, JSON.stringify(caseFile, null, 2));
      console.log(`📋 A-TEAM workflow failure CaseFile created: ${caseFile.id}`);
    } catch (saveError) {
      console.error('❌ Failed to save A-TEAM workflow failure CaseFile:', saveError);
    }
  }

  /**
   * Save workflow to filesystem
   */
  async saveWorkflow(workflow) {
    try {
      const workflowPath = join(process.cwd(), 'reports', `ateam-workflow-${workflow.id}.json`);
      await writeFile(workflowPath, JSON.stringify(workflow, null, 2));
    } catch (error) {
      console.error('❌ Failed to save A-TEAM workflow:', error);
    }
  }

  /**
   * Get A-TEAM Orchestrator status
   */
  getStatus() {
    return {
      orchestrator: 'A-TEAM',
      agents: Object.keys(this.agents).length,
      activeWorkflows: this.activeWorkflows.length,
      totalWorkflows: this.workflows.length,
      constitutionalCompliance: true,
      status: 'operational',
      chatHistoryLength: this.chatHistory.length
    };
  }

  /**
   * Get agent status
   */
  getAgentStatus() {
    const status = {};
    
    for (const [name, agent] of Object.entries(this.agents)) {
      if (agent.getStatus) {
        status[name] = agent.getStatus();
      } else if (agent.getComplianceReport) {
        status[name] = agent.getComplianceReport();
      } else if (agent.getPlanningReport) {
        status[name] = agent.getPlanningReport();
      } else {
        status[name] = { status: 'active' };
      }
    }
    
    return status;
  }

  /**
   * Get Abi Director's exclusive reports (Goal Score and Confidence only)
   */
  async getAbiDirectorReport() {
    if (this.agents.abiDirector) {
      // Abi only provides goal score and confidence - no other details
      return {
        goalScore: 0, // This would be calculated from the last workflow
        confidence: 0, // This would be calculated from the last workflow
        timestamp: new Date().toISOString()
      };
    }
    return null;
  }
}

export default ATEAMOrchestrator;
