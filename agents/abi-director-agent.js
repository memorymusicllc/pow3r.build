/**
 * Abi Director Agent - A-TEAM Director
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * Abi is the Director agent that manages the Context Log, Intent Tracker,
 * and provides goal scoring and confidence assessment for the A-TEAM system.
 * 
 * Abi has exclusive access to:
 * - Context Log.txt (continuous summaries from all Agent Chats)
 * - Intent Tracker.md (Record/Update/Refine for intent of job requests)
 * - APD (Architectural Progress Diagram) management
 * - Goal scoring and confidence assessment
 * 
 * IMPORTANT: Abi does NOT share her reports, recommendations, analysis,
 * or anything with other agents or the user. She only delivers GOAL %
 * and CONFIDENCE % to the agent manager.
 */

import { readFile, writeFile, appendFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

class AbiDirectorAgent {
  constructor() {
    this.name = 'Abi Director';
    this.role = 'Director';
    this.version = '3.0';
    this.contextLogPath = join(process.cwd(), 'Context Log.txt');
    this.intentTrackerPath = join(process.cwd(), 'Intent Tracker.md');
    this.apdPath = join(process.cwd(), 'apd.json');
    this.xIndexPath = join(process.cwd(), 'X-Index.md');
    
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-i',
      requiredTests: [
        {
          description: 'Verify that Abi Director can manage Context Log and Intent Tracker',
          testType: 'e2e-playwright',
          expectedOutcome: 'Context Log and Intent Tracker are properly maintained and updated'
        },
        {
          description: 'Verify that Abi Director provides accurate goal scoring and confidence assessment',
          testType: 'e2e-playwright',
          expectedOutcome: 'Goal scoring and confidence assessment are accurate and reliable'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['goalAccuracy', 'confidenceReliability', 'contextLogIntegrity'],
        failureCondition: 'goalAccuracy < 0.8 for 10m',
        repairPrompt: 'Abi Director has failed to maintain accurate goal scoring. Analyze context log integrity, intent tracking accuracy, and APD synchronization. Repair according to constitutional requirements.'
      }
    };
  }

  /**
   * Initialize Abi Director Agent
   */
  async initialize() {
    try {
      console.log('🎯 Initializing Abi Director Agent...');

      // Initialize Context Log
      await this.initializeContextLog();

      // Initialize Intent Tracker
      await this.initializeIntentTracker();

      // Initialize APD
      await this.initializeAPD();

      // Initialize X-Index
      await this.initializeXIndex();

      console.log('✅ Abi Director Agent initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Abi Director Agent initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Context Log
   */
  async initializeContextLog() {
    if (!existsSync(this.contextLogPath)) {
      const initialLog = `# Context Log - A-TEAM Director Agent
# Continuous summaries from all Agent Chats
# Managed by Abi Director Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Abi Director v${this.version}
- Purpose: Continuous context tracking for autonomous agent system

## Chat History Summaries
`;
      await writeFile(this.contextLogPath, initialLog);
    }
  }

  /**
   * Initialize Intent Tracker
   */
  async initializeIntentTracker() {
    if (!existsSync(this.intentTrackerPath)) {
      const initialTracker = `# Intent Tracker - A-TEAM Director Agent
# Record/Update/Refine for intent of job requests, chats, tasks, project, sprint, and repo
# Managed by Abi Director Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Abi Director v${this.version}
- Purpose: Intent tracking and goal refinement for autonomous agent system

## Repo Status Updates
* Pulled from APD (Architectural Progress Diagram)

## Repo Goal
* From README.md logs

## Repo Success Metrics
* From README.md logs

## Vision
* From README.md logs

## X-Index Status
* X-FILES status (coming later; adding for code comments)

## Intent Tracking
`;
      await writeFile(this.intentTrackerPath, initialTracker);
    }
  }

  /**
   * Initialize APD (Architectural Progress Diagram)
   */
  async initializeAPD() {
    if (!existsSync(this.apdPath)) {
      const initialAPD = {
        version: "3.0",
        lastUpdate: new Date().toISOString(),
        managedBy: "Abi Director Agent",
        purpose: "Architectural Progress Diagram - World Model",
        nodes: [],
        edges: [],
        metadata: {
          constitution: {
            version: "3.0",
            edition: "X-FILES",
            reference: ".cursor/rules/pow3r.v3.law.md"
          },
          xFilesSystem: {
            enabled: true,
            caseFileTypes: ["BugReport", "FeatureRequest", "SystemAnomaly"],
            selfHealing: {
              enabled: true,
              monitoredMetrics: ["errorRate", "avgLatency", "qualityScore"],
              failureCondition: "errorRate > 0.05 for 5m"
            }
          }
        }
      };
      await writeFile(this.apdPath, JSON.stringify(initialAPD, null, 2));
    }
  }

  /**
   * Initialize X-Index
   */
  async initializeXIndex() {
    if (!existsSync(this.xIndexPath)) {
      const initialXIndex = `# X-Index - A-TEAM Director Agent
# X-FILES status and system health tracking
# Managed by Abi Director Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Abi Director v${this.version}
- Purpose: X-FILES system status and health tracking

## X-FILES System Status
- Status: Initializing
- Case Files: 0
- Self-Healing: Enabled
- Anomaly Detection: Active

## System Health Metrics
- Error Rate: 0%
- Avg Latency: N/A
- Quality Score: N/A

## Case File Summary
- Open: 0
- In Progress: 0
- Pending Validation: 0
- Closed: 0

## Self-Healing Status
- Active: Yes
- Monitored Metrics: errorRate, avgLatency, qualityScore
- Failure Condition: errorRate > 0.05 for 5m
`;
      await writeFile(this.xIndexPath, initialXIndex);
    }
  }

  /**
   * Add chat summary to Context Log
   * @param {Object} chatSummary - Summary of agent chat
   */
  async addChatSummary(chatSummary) {
    const timestamp = new Date().toISOString();
    const summaryEntry = `
## ${timestamp}
- Agent: ${chatSummary.agent || 'Unknown'}
- Request: ${chatSummary.request || 'N/A'}
- Summary: ${chatSummary.summary || 'N/A'}
- Status: ${chatSummary.status || 'Unknown'}
- Key Points: ${chatSummary.keyPoints || 'N/A'}
`;

    try {
      await appendFile(this.contextLogPath, summaryEntry);
      console.log(`📝 Context Log updated: ${timestamp}`);
    } catch (error) {
      console.error('❌ Failed to update Context Log:', error);
    }
  }

  /**
   * Update Intent Tracker
   * @param {Object} intentUpdate - Intent update information
   */
  async updateIntentTracker(intentUpdate) {
    const timestamp = new Date().toISOString();
    const intentEntry = `
## ${timestamp}
- Type: ${intentUpdate.type || 'Unknown'}
- Intent: ${intentUpdate.intent || 'N/A'}
- Context: ${intentUpdate.context || 'N/A'}
- Status: ${intentUpdate.status || 'Unknown'}
- Goal Alignment: ${intentUpdate.goalAlignment || 'N/A'}
- Priority: ${intentUpdate.priority || 'Medium'}
`;

    try {
      await appendFile(this.intentTrackerPath, intentEntry);
      console.log(`🎯 Intent Tracker updated: ${timestamp}`);
    } catch (error) {
      console.error('❌ Failed to update Intent Tracker:', error);
    }
  }

  /**
   * Update APD (Architectural Progress Diagram)
   * @param {Object} apdUpdate - APD update information
   */
  async updateAPD(apdUpdate) {
    try {
      const currentAPD = JSON.parse(await readFile(this.apdPath, 'utf8'));
      
      // Update APD with new information
      currentAPD.lastUpdate = new Date().toISOString();
      
      if (apdUpdate.nodes) {
        currentAPD.nodes = apdUpdate.nodes;
      }
      
      if (apdUpdate.edges) {
        currentAPD.edges = apdUpdate.edges;
      }
      
      if (apdUpdate.metadata) {
        currentAPD.metadata = { ...currentAPD.metadata, ...apdUpdate.metadata };
      }

      await writeFile(this.apdPath, JSON.stringify(currentAPD, null, 2));
      console.log(`🏗️ APD updated: ${new Date().toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to update APD:', error);
    }
  }

  /**
   * Analyze user request and provide goal scoring
   * @param {Object} userRequest - Original user request
   * @param {Object} agentReports - Reports from all agents
   * @param {Object} managerReport - Report from agent manager
   * @returns {Object} Goal score and confidence assessment
   */
  async analyzeGoalCompletion(userRequest, agentReports, managerReport) {
    try {
      console.log('🎯 Abi Director analyzing goal completion...');

      // Read current context and intent
      const contextLog = await this.readContextLog();
      const intentTracker = await this.readIntentTracker();
      const apd = await this.readAPD();

      // Analyze the original input
      const originalIntent = this.extractOriginalIntent(userRequest);
      
      // Evaluate agent reports
      const agentAnalysis = this.analyzeAgentReports(agentReports);
      
      // Evaluate manager report
      const managerAnalysis = this.analyzeManagerReport(managerReport);
      
      // Calculate goal score
      const goalScore = this.calculateGoalScore(originalIntent, agentAnalysis, managerAnalysis);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(agentAnalysis, managerAnalysis);
      
      // Update Intent Tracker with analysis
      await this.updateIntentTracker({
        type: 'goal_analysis',
        intent: originalIntent,
        context: 'Goal completion analysis',
        status: 'completed',
        goalAlignment: `${goalScore}%`,
        priority: 'High'
      });

      // Return only goal score and confidence (Abi's exclusive output)
      return {
        goalScore: goalScore,
        confidence: confidence,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Goal analysis failed:', error);
      return {
        goalScore: 0,
        confidence: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract original intent from user request
   */
  extractOriginalIntent(userRequest) {
    return {
      text: userRequest.text || 'N/A',
      context: userRequest.context || 'N/A',
      timestamp: userRequest.timestamp || new Date().toISOString(),
      source: userRequest.source || 'unknown'
    };
  }

  /**
   * Analyze agent reports
   */
  analyzeAgentReports(agentReports) {
    const analysis = {
      totalAgents: Object.keys(agentReports).length,
      completedTasks: 0,
      failedTasks: 0,
      constitutionalCompliance: true,
      qualityScore: 0
    };

    for (const [agentName, report] of Object.entries(agentReports)) {
      if (report.status === 'completed') {
        analysis.completedTasks++;
      } else if (report.status === 'failed') {
        analysis.failedTasks++;
      }
      
      if (report.constitutionalCompliance === false) {
        analysis.constitutionalCompliance = false;
      }
      
      if (report.qualityScore) {
        analysis.qualityScore += report.qualityScore;
      }
    }

    analysis.qualityScore = analysis.qualityScore / analysis.totalAgents;
    return analysis;
  }

  /**
   * Analyze manager report
   */
  analyzeManagerReport(managerReport) {
    return {
      workflowCompleted: managerReport.workflowCompleted || false,
      allPhasesCompleted: managerReport.allPhasesCompleted || false,
      constitutionalCompliance: managerReport.constitutionalCompliance || false,
      deploymentVerified: managerReport.deploymentVerified || false,
      documentationUpdated: managerReport.documentationUpdated || false,
      githubPushed: managerReport.githubPushed || false,
      cloudflareDeployed: managerReport.cloudflareDeployed || false,
      screenshotTaken: managerReport.screenshotTaken || false
    };
  }

  /**
   * Calculate goal score based on analysis
   */
  calculateGoalScore(originalIntent, agentAnalysis, managerAnalysis) {
    let score = 0;
    let maxScore = 100;

    // Agent performance (40% of score)
    const agentScore = (agentAnalysis.completedTasks / agentAnalysis.totalAgents) * 40;
    score += agentScore;

    // Manager compliance (60% of score)
    const complianceItems = [
      managerAnalysis.workflowCompleted,
      managerAnalysis.allPhasesCompleted,
      managerAnalysis.constitutionalCompliance,
      managerAnalysis.deploymentVerified,
      managerAnalysis.documentationUpdated,
      managerAnalysis.githubPushed,
      managerAnalysis.cloudflareDeployed,
      managerAnalysis.screenshotTaken
    ];

    const complianceScore = (complianceItems.filter(Boolean).length / complianceItems.length) * 60;
    score += complianceScore;

    return Math.round(score);
  }

  /**
   * Calculate confidence based on analysis
   */
  calculateConfidence(agentAnalysis, managerAnalysis) {
    let confidence = 0;
    let maxConfidence = 100;

    // Constitutional compliance (30% of confidence)
    if (agentAnalysis.constitutionalCompliance && managerAnalysis.constitutionalCompliance) {
      confidence += 30;
    }

    // Quality score (20% of confidence)
    confidence += (agentAnalysis.qualityScore || 0) * 0.2;

    // Deployment verification (25% of confidence)
    if (managerAnalysis.deploymentVerified && managerAnalysis.cloudflareDeployed) {
      confidence += 25;
    }

    // Documentation and GitHub (25% of confidence)
    if (managerAnalysis.documentationUpdated && managerAnalysis.githubPushed) {
      confidence += 25;
    }

    return Math.round(confidence);
  }

  /**
   * Read Context Log
   */
  async readContextLog() {
    try {
      return await readFile(this.contextLogPath, 'utf8');
    } catch (error) {
      console.error('❌ Failed to read Context Log:', error);
      return '';
    }
  }

  /**
   * Read Intent Tracker
   */
  async readIntentTracker() {
    try {
      return await readFile(this.intentTrackerPath, 'utf8');
    } catch (error) {
      console.error('❌ Failed to read Intent Tracker:', error);
      return '';
    }
  }

  /**
   * Read APD
   */
  async readAPD() {
    try {
      return JSON.parse(await readFile(this.apdPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to read APD:', error);
      return {};
    }
  }

  /**
   * Get Abi Director status
   */
  getStatus() {
    return {
      agent: 'Abi Director',
      role: 'Director',
      version: this.version,
      status: 'active',
      managedFiles: [
        'Context Log.txt',
        'Intent Tracker.md',
        'apd.json',
        'X-Index.md'
      ],
      constitutionalCompliance: true,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default AbiDirectorAgent;

