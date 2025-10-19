/**
 * Guardian Agent - Constitutional Enforcement
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * Supreme authority for constitutional compliance and veto power
 * Validates all actions against constitutional articles
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

class GuardianAgent {
  constructor() {
    this.constitution = null;
    this.violations = [];
    this.caseFiles = [];
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-ix',
      requiredTests: [
        {
          description: 'Verify that Guardian Agent can validate constitutional compliance',
          testType: 'e2e-playwright',
          expectedOutcome: 'Guardian Agent successfully validates actions against constitution'
        },
        {
          description: 'Verify that Guardian Agent can create CaseFiles for violations',
          testType: 'e2e-playwright',
          expectedOutcome: 'CaseFiles are created with complete dossier for violations'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['violationRate', 'vetoCount', 'caseFileResolution'],
        failureCondition: 'violationRate > 0.05 for 5m',
        repairPrompt: 'Guardian Agent has failed to maintain constitutional compliance. Analyze violation patterns, check constitutional references, and repair enforcement mechanisms according to Article IX requirements.'
      }
    };
  }

  /**
   * Initialize Guardian Agent with Constitution
   */
  async initialize() {
    try {
      const constitutionPath = join(process.cwd(), '.cursor/rules/pow3r.v3.law.md');
      this.constitution = await readFile(constitutionPath, 'utf-8');
      console.log('🛡️ Guardian Agent initialized with Constitution v3.0');
      return true;
    } catch (error) {
      console.error('❌ Guardian Agent initialization failed:', error);
      return false;
    }
  }

  /**
   * Validate action against constitutional articles
   * @param {Object} action - Action to validate
   * @param {string} action.type - Type of action
   * @param {Object} action.payload - Action payload
   * @returns {Object} Validation result
   */
  async validateAction(action) {
    const validation = {
      valid: true,
      violations: [],
      article: null,
      veto: false
    };

    try {
      // Article I: Prime Directive & Core Philosophy
      if (!this.validatePrimeDirective(action)) {
        validation.violations.push('Article I: Prime Directive violation');
        validation.article = 'I';
      }

      // Article II: Schema Supremacy
      if (!this.validateSchemaSupremacy(action)) {
        validation.violations.push('Article II: Schema Supremacy violation');
        validation.article = 'II';
      }

      // Article III: Development Workflow
      if (!this.validateDevelopmentWorkflow(action)) {
        validation.violations.push('Article III: Development Workflow violation');
        validation.article = 'III';
      }

      // Article IV: Technical Mandates
      if (!this.validateTechnicalMandates(action)) {
        validation.violations.push('Article IV: Technical Mandates violation');
        validation.article = 'IV';
      }

      // Article V: Agent Conduct
      if (!this.validateAgentConduct(action)) {
        validation.violations.push('Article V: Agent Conduct violation');
        validation.article = 'V';
      }

      // Article VI: X-FILES System
      if (!this.validateXFilesSystem(action)) {
        validation.violations.push('Article VI: X-FILES System violation');
        validation.article = 'VI';
      }

      // Article VII: Case File Management
      if (!this.validateCaseFileManagement(action)) {
        validation.violations.push('Article VII: Case File Management violation');
        validation.article = 'VII';
      }

      // Article VIII: Observability
      if (!this.validateObservability(action)) {
        validation.violations.push('Article VIII: Observability violation');
        validation.article = 'VIII';
      }

      // Article IX: Constitutional Enforcement
      if (!this.validateConstitutionalEnforcement(action)) {
        validation.violations.push('Article IX: Constitutional Enforcement violation');
        validation.article = 'IX';
      }

      // Article X: Evolution Protocol
      if (!this.validateEvolutionProtocol(action)) {
        validation.violations.push('Article X: Evolution Protocol violation');
        validation.article = 'X';
      }

      if (validation.violations.length > 0) {
        validation.valid = false;
        validation.veto = true;
        await this.createViolationCaseFile(action, validation);
      }

      return validation;

    } catch (error) {
      console.error('❌ Guardian Agent validation error:', error);
      return {
        valid: false,
        violations: ['Constitutional validation system failure'],
        article: 'IX',
        veto: true,
        error: error.message
      };
    }
  }

  /**
   * Validate Article I: Prime Directive & Core Philosophy
   */
  validatePrimeDirective(action) {
    // Check if action serves systemic integrity and evolution
    if (action.type === 'code_generation' && !action.payload.schemaDriven) {
      return false;
    }

    // Check for autonomous operation
    if (action.type === 'deployment' && action.payload.requiresHumanApproval) {
      return false;
    }

    // Check Data as Light philosophy
    if (action.type === 'ui_development' && !action.payload.dataAsLight) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article II: Schema Supremacy
   */
  validateSchemaSupremacy(action) {
    // All actions must derive from pow3r.v3.config.json
    if (!action.payload.schemaReference) {
      return false;
    }

    // Check for real-time reconfiguration capability
    if (action.type === 'component_update' && !action.payload.realtimeReconfig) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article III: Development Workflow
   */
  validateDevelopmentWorkflow(action) {
    // Configuration first approach
    if (action.type === 'feature_development' && !action.payload.configFirst) {
      return false;
    }

    // E2E testing requirement
    if (action.type === 'code_generation' && !action.payload.e2eTests) {
      return false;
    }

    // Live deployment verification
    if (action.type === 'deployment' && !action.payload.liveVerification) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article IV: Technical Mandates
   */
  validateTechnicalMandates(action) {
    // Mandatory stack compliance
    const mandatoryStack = ['Vite', 'React', 'Redux', 'Zustand', 'Tailwind CSS', 'Playwright', 'React Three Fiber', 'React Flow'];
    const prohibitedStack = ['Next.js', 'ShadCN', 'Radix'];

    if (action.type === 'technology_selection') {
      const selectedTech = action.payload.technology;
      if (prohibitedStack.includes(selectedTech)) {
        return false;
      }
    }

    // Mobile-first requirement
    if (action.type === 'ui_development' && !action.payload.mobileFirst) {
      return false;
    }

    // Unbound design requirement
    if (action.type === 'component_development' && !action.payload.unboundDesign) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article V: Agent Conduct
   */
  validateAgentConduct(action) {
    // System integrity
    if (action.type === 'code_commit' && action.payload.breaksBuild) {
      return false;
    }

    // Trust & verification
    if (action.type === 'deployment_report' && !action.payload.liveVerification) {
      return false;
    }

    // File hygiene
    if (action.type === 'report_creation' && !this.validateReportNaming(action.payload.filename)) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article VI: X-FILES System
   */
  validateXFilesSystem(action) {
    // X-FILES Console integration
    if (action.type === 'ui_component' && !action.payload.xFilesIntegration) {
      return false;
    }

    // CaseFile creation for anomalies
    if (action.type === 'anomaly_detection' && !action.payload.caseFileCreation) {
      return false;
    }

    // Self-healing protocol
    if (action.type === 'system_failure' && !action.payload.selfHealing) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article VII: Case File Management
   */
  validateCaseFileManagement(action) {
    if (action.type === 'case_file_creation') {
      const requiredFields = ['userIntent', 'componentId', 'componentConfig', 'applicationState', 'logs', 'environment'];
      const dossier = action.payload.dossier;
      
      for (const field of requiredFields) {
        if (!dossier[field]) {
          return false;
        }
      }

      // Status lifecycle validation
      if (!['Open', 'InProgress', 'PendingValidation', 'Closed'].includes(action.payload.status)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Article VIII: Observability
   */
  validateObservability(action) {
    // Real-time monitoring
    if (action.type === 'component_deployment' && !action.payload.observability) {
      return false;
    }

    // Anomaly detection
    if (action.type === 'system_monitoring' && !action.payload.anomalyDetection) {
      return false;
    }

    // Session recording
    if (action.type === 'user_interaction' && !action.payload.sessionRecording) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article IX: Constitutional Enforcement
   */
  validateConstitutionalEnforcement(action) {
    // Guardian Agent authority
    if (action.type === 'constitutional_override' && !action.payload.guardianApproval) {
      return false;
    }

    // Self-healing validation
    if (action.type === 'self_healing' && !action.payload.constitutionalValidation) {
      return false;
    }

    return true;
  }

  /**
   * Validate Article X: Evolution Protocol
   */
  validateEvolutionProtocol(action) {
    // Constitutional evolution through schema-driven process
    if (action.type === 'constitution_update' && !action.payload.schemaDriven) {
      return false;
    }

    // Backward compatibility
    if (action.type === 'system_upgrade' && !action.payload.backwardCompatibility) {
      return false;
    }

    return true;
  }

  /**
   * Validate report naming convention
   */
  validateReportNaming(filename) {
    const pattern = /^\d{8}_REPORT_\w+_\w+\.md$/;
    return pattern.test(filename);
  }

  /**
   * Create CaseFile for constitutional violation
   */
  async createViolationCaseFile(action, validation) {
    const caseFile = {
      id: `violation-${Date.now()}`,
      type: 'system.case-file',
      caseType: 'SystemAnomaly',
      status: 'Open',
      dossier: {
        userIntent: 'Constitutional compliance enforcement',
        componentId: 'guardian-agent',
        componentConfig: this.agentDirectives,
        applicationState: {
          action: action,
          validation: validation,
          timestamp: new Date().toISOString()
        },
        sessionRecordingRef: null,
        logs: [
          `Constitutional violation detected: ${validation.violations.join(', ')}`,
          `Violated Article: ${validation.article}`,
          `Action Type: ${action.type}`,
          `Timestamp: ${new Date().toISOString()}`
        ],
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          constitutionVersion: '3.0'
        }
      },
      agentDirectives: {
        selfHealing: {
          repairPrompt: `Constitutional violation detected in action: ${action.type}. Violated articles: ${validation.violations.join(', ')}. Analyze the root cause, determine corrective actions, and dispatch appropriate agents to resolve the violation according to constitutional requirements.`
        }
      }
    };

    this.caseFiles.push(caseFile);
    await this.saveCaseFile(caseFile);
    
    console.log(`🚨 Constitutional violation detected: Article ${validation.article}`);
    console.log(`📋 CaseFile created: ${caseFile.id}`);
    
    return caseFile;
  }

  /**
   * Save CaseFile to filesystem
   */
  async saveCaseFile(caseFile) {
    try {
      const caseFilePath = join(process.cwd(), 'reports', `casefile-${caseFile.id}.json`);
      await writeFile(caseFilePath, JSON.stringify(caseFile, null, 2));
    } catch (error) {
      console.error('❌ Failed to save CaseFile:', error);
    }
  }

  /**
   * Veto action with constitutional reference
   */
  async vetoAction(action, validation) {
    console.log(`🚫 GUARDIAN VETO: Action ${action.type} rejected`);
    console.log(`📜 Violated Article: ${validation.article}`);
    console.log(`📋 Violations: ${validation.violations.join(', ')}`);
    
    // Create veto record
    const vetoRecord = {
      timestamp: new Date().toISOString(),
      action: action,
      validation: validation,
      guardianAgent: 'guardian-agent',
      constitutionVersion: '3.0'
    };

    await this.saveVetoRecord(vetoRecord);
    return vetoRecord;
  }

  /**
   * Save veto record
   */
  async saveVetoRecord(vetoRecord) {
    try {
      const vetoFilePath = join(process.cwd(), 'reports', `veto-${Date.now()}.json`);
      await writeFile(vetoFilePath, JSON.stringify(vetoRecord, null, 2));
    } catch (error) {
      console.error('❌ Failed to save veto record:', error);
    }
  }

  /**
   * Get constitutional compliance report
   */
  getComplianceReport() {
    return {
      guardianAgent: 'active',
      constitutionVersion: '3.0',
      totalViolations: this.violations.length,
      totalCaseFiles: this.caseFiles.length,
      lastValidation: new Date().toISOString(),
      status: 'operational'
    };
  }
}

export default GuardianAgent;
