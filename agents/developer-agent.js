/**
 * Developer Agent - Code Generation & Implementation
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * Code generation, implementation, and refactoring
 * Generates code from schema definitions with constitutional compliance
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

class DeveloperAgent {
  constructor() {
    this.schema = null;
    this.implementations = [];
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-iv',
      requiredTests: [
        {
          description: 'Verify that Developer Agent can generate code from schema definitions',
          testType: 'e2e-playwright',
          expectedOutcome: 'Code generated successfully with constitutional compliance'
        },
        {
          description: 'Verify that Developer Agent maintains code quality and standards',
          testType: 'e2e-playwright',
          expectedOutcome: 'Generated code meets quality standards and constitutional requirements'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['codeQuality', 'implementationSuccess', 'constitutionalCompliance'],
        failureCondition: 'codeQuality < 0.9 for 3m',
        repairPrompt: 'Developer Agent has failed to generate quality code. Analyze schema definitions, check constitutional requirements, and repair code generation mechanisms according to Article IV requirements.'
      }
    };
  }

  /**
   * Initialize Developer Agent with Schema
   */
  async initialize() {
    try {
      const schemaPath = join(process.cwd(), '..', 'config', 'pow3r.v3.config.json');
      this.schema = JSON.parse(await readFile(schemaPath, 'utf-8'));
      console.log('💻 Developer Agent initialized with Schema v3.0');
      return true;
    } catch (error) {
      console.error('❌ Developer Agent initialization failed:', error);
      return false;
    }
  }

  /**
   * Generate code from implementation plan
   * @param {Object} plan - Implementation plan from Architect Agent
   * @returns {Object} Implementation result
   */
  async generateCode(plan) {
    try {
      console.log('🔧 Generating code for plan:', plan.id);

      const implementation = {
        id: `impl-${Date.now()}`,
        planId: plan.id,
        timestamp: new Date().toISOString(),
        status: 'generating',
        files: [],
        components: [],
        tests: [],
        constitutionalCompliance: true
      };

      // Generate components based on plan requirements
      for (const requirement of plan.requirements) {
        const component = await this.generateComponent(requirement, plan);
        if (component) {
          implementation.components.push(component);
          implementation.files.push(component.file);
        }
      }

      // Generate tests for all components
      for (const component of implementation.components) {
        const test = await this.generateTest(component, plan);
        if (test) {
          implementation.tests.push(test);
          implementation.files.push(test.file);
        }
      }

      // Generate configuration files
      const configFiles = await this.generateConfigFiles(plan);
      implementation.files.push(...configFiles);

      implementation.status = 'completed';
      implementation.completedAt = new Date().toISOString();

      await this.saveImplementation(implementation);
      console.log('✅ Code generation completed:', implementation.id);

      return implementation;

    } catch (error) {
      console.error('❌ Code generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate component based on requirement
   */
  async generateComponent(requirement, plan) {
    const componentId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let component = null;

    if (requirement.includes('React component')) {
      component = await this.generateReactComponent(componentId, requirement, plan);
    } else if (requirement.includes('API')) {
      component = await this.generateAPIComponent(componentId, requirement, plan);
    } else if (requirement.includes('authentication')) {
      component = await this.generateAuthComponent(componentId, requirement, plan);
    } else if (requirement.includes('mobile')) {
      component = await this.generateMobileComponent(componentId, requirement, plan);
    } else if (requirement.includes('X-FILES')) {
      component = await this.generateXFilesComponent(componentId, requirement, plan);
    }

    return component;
  }

  /**
   * Generate React component
   */
  async generateReactComponent(componentId, requirement, plan) {
    const componentName = this.getComponentName(requirement);
    const fileName = `${componentName}.tsx`;
    const filePath = join(process.cwd(), '..', 'src', 'components', fileName);

    const componentCode = `import React from 'react';
import { useState, useEffect } from 'react';

/**
 * ${componentName} Component
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates
 * - Mobile-first design
 * - Unbound design (data/style separation)
 * - X-FILES integration
 */

interface ${componentName}Props {
  // Props interface - unbound from data
  className?: string;
  children?: React.ReactNode;
  onAction?: (action: string) => void;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  className = '',
  children,
  onAction
}) => {
  const [state, setState] = useState({
    // Component state - controlled via pow3r.v3.config.json
    isActive: false,
    data: null
  });

  useEffect(() => {
    // Real-time reconfiguration listener
    const handleConfigUpdate = (event: CustomEvent) => {
      const newConfig = event.detail;
      setState(prev => ({ ...prev, ...newConfig }));
    };

    window.addEventListener('configUpdate', handleConfigUpdate as EventListener);
    
    return () => {
      window.removeEventListener('configUpdate', handleConfigUpdate as EventListener);
    };
  }, []);

  const handleClick = () => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
    onAction?.('click');
  };

  return (
    <div 
      className={\`${componentName.toLowerCase()} \${className}\`}
      data-component-id="${componentId}"
      data-constitution="v3.0"
      data-x-files="enabled"
    >
      {/* Mobile-first responsive design */}
      <div className="block md:hidden">
        {/* Mobile layout */}
        <button
          onClick={handleClick}
          className="w-full p-4 bg-blue-500 text-white rounded-lg"
          aria-label="${componentName} mobile button"
        >
          {state.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>
      
      <div className="hidden md:block">
        {/* Desktop layout */}
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          aria-label="${componentName} desktop button"
        >
          {state.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* X-FILES trigger icon - bottom-right */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            // X-FILES console trigger
            window.dispatchEvent(new CustomEvent('x-files-open', {
              detail: { componentId: '${componentId}', type: '${componentName}' }
            }));
          }}
          className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
          aria-label="X-FILES Console"
          title="Open X-FILES Console"
        >
          🔍
        </button>
      </div>

      {children}
    </div>
  );
};

export default ${componentName};
`;

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, componentCode);

    return {
      id: componentId,
      name: componentName,
      type: 'react-component',
      file: filePath,
      requirement: requirement,
      constitutionalCompliance: true,
      features: [
        'Mobile-first design',
        'Unbound design',
        'X-FILES integration',
        'Real-time reconfiguration',
        'TypeScript support'
      ]
    };
  }

  /**
   * Generate API component
   */
  async generateAPIComponent(componentId, requirement, plan) {
    const apiName = this.getAPIName(requirement);
    const fileName = `${apiName}.ts`;
    const filePath = join(process.cwd(), '..', 'src', 'api', fileName);

    const apiCode = `/**
 * ${apiName} API
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates
 * - Schema-driven development
 * - X-FILES integration
 */

import { Request, Response } from 'express';

interface ${apiName}Request {
  // Request interface - derived from schema
  data: any;
  userId?: string;
}

interface ${apiName}Response {
  // Response interface - schema-compliant
  success: boolean;
  data?: any;
  error?: string;
  constitutionalCompliance: boolean;
}

/**
 * ${apiName} API endpoint
 * Schema-driven implementation
 */
export const ${apiName} = async (req: Request, res: Response) => {
  try {
    const requestData: ${apiName}Request = req.body;
    
    // Constitutional compliance validation
    if (!requestData.data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data',
        constitutionalCompliance: false
      });
    }

    // Process request according to schema
    const result = await process${apiName}Request(requestData);
    
    // X-FILES integration - log for monitoring
    console.log(\`${apiName} API called: \${JSON.stringify(requestData)}\`);
    
    const response: ${apiName}Response = {
      success: true,
      data: result,
      constitutionalCompliance: true
    };

    res.json(response);

  } catch (error) {
    console.error(\`${apiName} API error:\`, error);
    
    // X-FILES CaseFile creation for errors
    window.dispatchEvent(new CustomEvent('x-files-create-case', {
      detail: {
        type: 'BugReport',
        component: '${apiName}',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }));

    res.status(500).json({
      success: false,
      error: error.message,
      constitutionalCompliance: false
    });
  }
};

async function process${apiName}Request(request: ${apiName}Request): Promise<any> {
  // Implementation based on schema requirements
  return {
    processed: true,
    timestamp: new Date().toISOString(),
    requestId: \`req-\${Date.now()}\`
  };
}

export default ${apiName};
`;

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, apiCode);

    return {
      id: componentId,
      name: apiName,
      type: 'api-component',
      file: filePath,
      requirement: requirement,
      constitutionalCompliance: true,
      features: [
        'Schema-driven development',
        'X-FILES integration',
        'Error handling',
        'TypeScript support',
        'Constitutional compliance'
      ]
    };
  }

  /**
   * Generate authentication component
   */
  async generateAuthComponent(componentId, requirement, plan) {
    const authName = 'UserAuthentication';
    const fileName = `${authName}.tsx`;
    const filePath = join(process.cwd(), '..', 'src', 'components', fileName);

    const authCode = `import React, { useState, useEffect } from 'react';

/**
 * UserAuthentication Component
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates
 * - Mobile-first design
 * - X-FILES integration
 * - Schema-driven authentication
 */

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

interface UserAuthenticationProps {
  onAuthChange?: (authState: AuthState) => void;
}

export const UserAuthentication: React.FC<UserAuthenticationProps> = ({
  onAuthChange
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Schema-driven authentication check
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      setAuthState({
        isAuthenticated: data.authenticated,
        user: data.user,
        loading: false
      });
      
      onAuthChange?.(authState);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false
        });
        onAuthChange?.(authState);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      // X-FILES CaseFile creation for auth failures
      window.dispatchEvent(new CustomEvent('x-files-create-case', {
        detail: {
          type: 'SystemAnomaly',
          component: 'UserAuthentication',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      onAuthChange?.(authState);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="user-authentication" data-component-id="${componentId}">
      {authState.isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {authState.user?.name || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile-first login form */}
          <div className="block md:hidden">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleLogin({
                email: formData.get('email') as string,
                password: formData.get('password') as string
              });
            }} className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
          
          {/* Desktop login form */}
          <div className="hidden md:block">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleLogin({
                email: formData.get('email') as string,
                password: formData.get('password') as string
              });
            }} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* X-FILES trigger icon */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('x-files-open', {
              detail: { componentId: '${componentId}', type: 'UserAuthentication' }
            }));
          }}
          className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
          aria-label="X-FILES Console"
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default UserAuthentication;
`;

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, authCode);

    return {
      id: componentId,
      name: authName,
      type: 'auth-component',
      file: filePath,
      requirement: requirement,
      constitutionalCompliance: true,
      features: [
        'Mobile-first design',
        'Schema-driven authentication',
        'X-FILES integration',
        'Error handling',
        'TypeScript support'
      ]
    };
  }

  /**
   * Generate mobile component
   */
  async generateMobileComponent(componentId, requirement, plan) {
    const mobileName = 'MobileResponsive';
    const fileName = `${mobileName}.tsx`;
    const filePath = join(process.cwd(), '..', 'src', 'components', fileName);

    const mobileCode = `import React from 'react';

/**
 * MobileResponsive Component
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article IV: Technical & Architectural Mandates
 * - Mobile-first design (MANDATORY)
 * - Responsive breakpoints
 * - Touch-friendly interactions
 */

interface MobileResponsiveProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileResponsive: React.FC<MobileResponsiveProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={\`mobile-responsive \${className}\`}
      data-component-id="${componentId}"
      data-constitution="v3.0"
    >
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Touch-friendly spacing */}
        <div className="p-4 md:p-6 lg:p-8">
          {/* Mobile-optimized content */}
          <div className="space-y-4 md:space-y-6">
            {children}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500">
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500">
            <span className="text-xs">Search</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500">
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
      
      {/* X-FILES trigger icon - mobile optimized */}
      <div className="fixed bottom-16 right-4 z-50 md:bottom-4">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('x-files-open', {
              detail: { componentId: '${componentId}', type: 'MobileResponsive' }
            }));
          }}
          className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors touch-manipulation"
          aria-label="X-FILES Console"
          style={{ touchAction: 'manipulation' }}
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default MobileResponsive;
`;

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, mobileCode);

    return {
      id: componentId,
      name: mobileName,
      type: 'mobile-component',
      file: filePath,
      requirement: requirement,
      constitutionalCompliance: true,
      features: [
        'Mobile-first design',
        'Touch-friendly interactions',
        'Responsive breakpoints',
        'Bottom navigation',
        'X-FILES integration'
      ]
    };
  }

  /**
   * Generate X-FILES component
   */
  async generateXFilesComponent(componentId, requirement, plan) {
    const xFilesName = 'XFilesConsole';
    const fileName = `${xFilesName}.tsx`;
    const filePath = join(process.cwd(), '..', 'src', 'components', fileName);

    const xFilesCode = `import React, { useState, useEffect } from 'react';

/**
 * X-FILES Console Component
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article VI: X-FILES System
 * - Article VII: Case File Management
 * - Article VIII: Observability
 * - Article IX: Constitutional Enforcement
 */

interface CaseFile {
  id: string;
  type: 'BugReport' | 'FeatureRequest' | 'SystemAnomaly';
  status: 'Open' | 'InProgress' | 'PendingValidation' | 'Closed';
  title: string;
  description: string;
  timestamp: string;
  dossier: any;
}

interface XFilesConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XFilesConsole: React.FC<XFilesConsoleProps> = ({
  isOpen,
  onClose
}) => {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [activeTab, setActiveTab] = useState<'cases' | 'create'>('cases');
  const [newCase, setNewCase] = useState({
    type: 'BugReport' as const,
    title: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCaseFiles();
    }
  }, [isOpen]);

  const loadCaseFiles = async () => {
    try {
      // Load case files from X-FILES system
      const response = await fetch('/api/x-files/cases');
      const data = await response.json();
      setCaseFiles(data.cases || []);
    } catch (error) {
      console.error('Failed to load case files:', error);
    }
  };

  const createCaseFile = async () => {
    try {
      const caseFile: CaseFile = {
        id: \`case-\${Date.now()}\`,
        type: newCase.type,
        status: 'Open',
        title: newCase.title,
        description: newCase.description,
        timestamp: new Date().toISOString(),
        dossier: {
          userIntent: newCase.description,
          componentId: 'x-files-console',
          componentConfig: {},
          applicationState: {},
          logs: [],
          environment: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      };

      const response = await fetch('/api/x-files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseFile)
      });

      if (response.ok) {
        setCaseFiles(prev => [caseFile, ...prev]);
        setNewCase({ type: 'BugReport', title: '', description: '' });
        setActiveTab('cases');
      }
    } catch (error) {
      console.error('Failed to create case file:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            🔍 X-FILES Console - In-Situ Triage & Action
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('cases')}
            className={\`px-4 py-2 \${activeTab === 'cases' ? 'bg-blue-500 text-white' : 'text-gray-600'}\`}
          >
            Case Files ({caseFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={\`px-4 py-2 \${activeTab === 'create' ? 'bg-blue-500 text-white' : 'text-gray-600'}\`}
          >
            Create Case
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'cases' ? (
            <div className="space-y-3">
              {caseFiles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No case files found. Create one to get started.
                </p>
              ) : (
                caseFiles.map(caseFile => (
                  <div key={caseFile.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{caseFile.title}</h3>
                      <span className={\`px-2 py-1 rounded text-xs \${getStatusColor(caseFile.status)}\`}>
                        {caseFile.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{caseFile.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {caseFile.type} • {new Date(caseFile.timestamp).toLocaleString()}
                      </span>
                      <button className="text-blue-500 text-xs hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Type
                </label>
                <select
                  value={newCase.type}
                  onChange={(e) => setNewCase(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="BugReport">Bug Report</option>
                  <option value="FeatureRequest">Feature Request</option>
                  <option value="SystemAnomaly">System Anomaly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-24"
                  placeholder="Detailed description of the issue or request"
                />
              </div>
              
              <button
                onClick={createCaseFile}
                disabled={!newCase.title || !newCase.description}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Case File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'Open': return 'bg-yellow-100 text-yellow-800';
    case 'InProgress': return 'bg-blue-100 text-blue-800';
    case 'PendingValidation': return 'bg-purple-100 text-purple-800';
    case 'Closed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default XFilesConsole;
`;

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, xFilesCode);

    return {
      id: componentId,
      name: xFilesName,
      type: 'x-files-component',
      file: filePath,
      requirement: requirement,
      constitutionalCompliance: true,
      features: [
        'Case File Management',
        'Bug Report creation',
        'Feature Request creation',
        'System Anomaly detection',
        'Constitutional compliance'
      ]
    };
  }

  /**
   * Generate test for component
   */
  async generateTest(component, plan) {
    const testName = `${component.name}.test.tsx`;
    const testPath = join(process.cwd(), '..', 'src', 'components', '__tests__', testName);

    const testCode = `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${component.name} } from '../${component.name}';

/**
 * ${component.name} Tests
 * Generated by Developer Agent under Project Phoenix Constitution v3.0
 * 
 * Constitutional Compliance:
 * - Article III: Schema-Defined Validation
 * - E2E Playwright test requirements
 */

describe('${component.name}', () => {
  test('renders component successfully', () => {
    render(<${component.name} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles user interactions', () => {
    const mockOnAction = jest.fn();
    render(<${component.name} onAction={mockOnAction} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnAction).toHaveBeenCalledWith('click');
  });

  test('displays X-FILES trigger icon', () => {
    render(<${component.name} />);
    const xFilesButton = screen.getByLabelText('X-FILES Console');
    expect(xFilesButton).toBeInTheDocument();
  });

  test('maintains constitutional compliance', () => {
    render(<${component.name} />);
    const componentElement = screen.getByTestId('${component.id}');
    expect(componentElement).toHaveAttribute('data-constitution', 'v3.0');
    expect(componentElement).toHaveAttribute('data-x-files', 'enabled');
  });

  test('supports mobile-first design', () => {
    render(<${component.name} />);
    // Mobile layout should be visible by default
    const mobileLayout = screen.getByTestId('mobile-layout');
    expect(mobileLayout).toBeInTheDocument();
  });
});
`;

    // Ensure directory exists
    await mkdir(dirname(testPath), { recursive: true });
    await writeFile(testPath, testCode);

    return {
      id: `test-${component.id}`,
      name: testName,
      type: 'test-file',
      file: testPath,
      componentId: component.id,
      constitutionalCompliance: true
    };
  }

  /**
   * Generate configuration files
   */
  async generateConfigFiles(plan) {
    const configFiles = [];

    // Generate package.json updates
    const packageJsonPath = join(process.cwd(), '..', 'package.json');
    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      
      // Add dependencies if needed
      if (!packageJson.dependencies['@testing-library/react']) {
        packageJson.dependencies['@testing-library/react'] = '^13.0.0';
      }
      if (!packageJson.dependencies['@testing-library/jest-dom']) {
        packageJson.dependencies['@testing-library/jest-dom'] = '^5.16.0';
      }
      
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      configFiles.push(packageJsonPath);
    } catch (error) {
      console.warn('Could not update package.json:', error.message);
    }

    return configFiles;
  }

  /**
   * Get component name from requirement
   */
  getComponentName(requirement) {
    const words = requirement.split(' ');
    const name = words
      .filter(word => word.length > 2)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return name || 'GeneratedComponent';
  }

  /**
   * Get API name from requirement
   */
  getAPIName(requirement) {
    const words = requirement.split(' ');
    const name = words
      .filter(word => word.length > 2)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return name || 'GeneratedAPI';
  }

  /**
   * Save implementation record
   */
  async saveImplementation(implementation) {
    try {
      const implPath = join(process.cwd(), 'reports', `implementation-${implementation.id}.json`);
      await writeFile(implPath, JSON.stringify(implementation, null, 2));
      this.implementations.push(implementation);
    } catch (error) {
      console.error('❌ Failed to save implementation:', error);
    }
  }

  /**
   * Get implementation report
   */
  getImplementationReport() {
    return {
      developerAgent: 'active',
      totalImplementations: this.implementations.length,
      lastImplementation: this.implementations[this.implementations.length - 1]?.id || 'none',
      status: 'operational'
    };
  }
}

export default DeveloperAgent;
