/**
 * Chat Analyzer Agent - A-TEAM Chat History Analysis
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * This agent goes through all chat history making a list of every request:
 * - Assuming requests aren't done, regardless if claimed complete
 * - Every time a subject is brought up after the first time = 10% more likely to be unresolved
 * - Any user critique or issue with development = request to solve
 * - All To-dos not checked off by the agent are recorded
 * - Every "Next Steps" reply is recorded as a To-do
 * - Always makes sure all user requests are implemented
 */

import { readFile, writeFile, appendFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

class ChatAnalyzerAgent {
  constructor() {
    this.name = 'Chat Analyzer';
    this.role = 'Request Tracking & Analysis';
    this.version = '3.0';
    this.requestLogPath = join(process.cwd(), 'Request Log.md');
    this.todoTrackerPath = join(process.cwd(), 'Todo Tracker.md');
    this.unresolvedRequestsPath = join(process.cwd(), 'Unresolved Requests.md');
    
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-i',
      requiredTests: [
        {
          description: 'Verify that Chat Analyzer can track all user requests and identify unresolved items',
          testType: 'e2e-playwright',
          expectedOutcome: 'All user requests are tracked and unresolved items are identified'
        },
        {
          description: 'Verify that Chat Analyzer can calculate unresolved likelihood based on repetition',
          testType: 'e2e-playwright',
          expectedOutcome: 'Unresolved likelihood increases by 10% for each repetition'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['requestTrackingAccuracy', 'todoCompletionRate', 'unresolvedDetection'],
        failureCondition: 'requestTrackingAccuracy < 0.9 for 5m',
        repairPrompt: 'Chat Analyzer has failed to maintain accurate request tracking. Analyze chat history parsing, request identification, and todo tracking. Repair according to constitutional requirements.'
      }
    };

    this.requestHistory = new Map();
    this.todoHistory = new Map();
    this.nextStepsHistory = new Map();
  }

  /**
   * Initialize Chat Analyzer Agent
   */
  async initialize() {
    try {
      console.log('📋 Initializing Chat Analyzer Agent...');

      // Initialize Request Log
      await this.initializeRequestLog();

      // Initialize Todo Tracker
      await this.initializeTodoTracker();

      // Initialize Unresolved Requests
      await this.initializeUnresolvedRequests();

      console.log('✅ Chat Analyzer Agent initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Chat Analyzer Agent initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Request Log
   */
  async initializeRequestLog() {
    if (!existsSync(this.requestLogPath)) {
      const initialLog = `# Request Log - Chat Analyzer Agent
# Complete tracking of all user requests from chat history
# Managed by Chat Analyzer Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Chat Analyzer v${this.version}
- Purpose: Comprehensive request tracking and analysis

## Request Tracking Rules
1. All requests are assumed NOT done, regardless of completion claims
2. Each repetition of a subject increases unresolved likelihood by 10%
3. User critiques and development issues = requests to solve
4. All "Next Steps" replies are recorded as To-dos
5. All unchecked To-dos are tracked

## Request History
`;
      await writeFile(this.requestLogPath, initialLog);
    }
  }

  /**
   * Initialize Todo Tracker
   */
  async initializeTodoTracker() {
    if (!existsSync(this.todoTrackerPath)) {
      const initialTracker = `# Todo Tracker - Chat Analyzer Agent
# Complete tracking of all To-dos and Next Steps
# Managed by Chat Analyzer Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Chat Analyzer v${this.version}
- Purpose: Comprehensive todo tracking and completion monitoring

## Todo Tracking Rules
1. All unchecked To-dos are recorded
2. All "Next Steps" replies are recorded as To-dos
3. Completion status is tracked and verified
4. Unresolved To-dos are flagged for attention

## Todo History
`;
      await writeFile(this.todoTrackerPath, initialTracker);
    }
  }

  /**
   * Initialize Unresolved Requests
   */
  async initializeUnresolvedRequests() {
    if (!existsSync(this.unresolvedRequestsPath)) {
      const initialUnresolved = `# Unresolved Requests - Chat Analyzer Agent
# Requests that are likely unresolved based on repetition and context
# Managed by Chat Analyzer Agent

## Initialization
- Created: ${new Date().toISOString()}
- Agent: Chat Analyzer v${this.version}
- Purpose: Identification and prioritization of unresolved requests

## Unresolved Detection Rules
1. Base unresolved likelihood: 50% (assume not done)
2. Each repetition: +10% unresolved likelihood
3. User critique/issue: +20% unresolved likelihood
4. Unchecked To-dos: +15% unresolved likelihood
5. "Next Steps" without completion: +25% unresolved likelihood

## Unresolved Requests
`;
      await writeFile(this.unresolvedRequestsPath, initialUnresolved);
    }
  }

  /**
   * Analyze chat history and extract all requests
   * @param {Array} chatHistory - Array of chat messages
   */
  async analyzeChatHistory(chatHistory) {
    try {
      console.log('📋 Chat Analyzer analyzing chat history...');

      const requests = [];
      const todos = [];
      const nextSteps = [];
      const critiques = [];

      for (const message of chatHistory) {
        // Extract requests from user messages
        if (message.role === 'user') {
          const userRequests = this.extractUserRequests(message.content);
          requests.push(...userRequests);

          // Check for critiques or issues
          const userCritiques = this.extractCritiques(message.content);
          critiques.push(...userCritiques);
        }

        // Extract todos from assistant messages
        if (message.role === 'assistant') {
          const assistantTodos = this.extractTodos(message.content);
          todos.push(...assistantTodos);

          // Extract "Next Steps"
          const assistantNextSteps = this.extractNextSteps(message.content);
          nextSteps.push(...assistantNextSteps);
        }
      }

      // Process and track all extracted items
      await this.processRequests(requests);
      await this.processTodos(todos);
      await this.processNextSteps(nextSteps);
      await this.processCritiques(critiques);

      // Calculate unresolved likelihood for each request
      const unresolvedAnalysis = await this.calculateUnresolvedLikelihood();

      return {
        totalRequests: requests.length,
        totalTodos: todos.length,
        totalNextSteps: nextSteps.length,
        totalCritiques: critiques.length,
        unresolvedAnalysis: unresolvedAnalysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Chat history analysis failed:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract user requests from message content
   */
  extractUserRequests(content) {
    const requests = [];
    
    // Look for request patterns
    const requestPatterns = [
      /I wish (.+)/gi,
      /I want (.+)/gi,
      /I need (.+)/gi,
      /Can you (.+)/gi,
      /Please (.+)/gi,
      /Could you (.+)/gi,
      /I'd like (.+)/gi,
      /I would like (.+)/gi,
      /I hope (.+)/gi,
      /I expect (.+)/gi
    ];

    for (const pattern of requestPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          requests.push({
            text: match,
            type: 'user_request',
            timestamp: new Date().toISOString(),
            source: 'chat_analysis'
          });
        }
      }
    }

    return requests;
  }

  /**
   * Extract critiques or issues from user messages
   */
  extractCritiques(content) {
    const critiques = [];
    
    // Look for critique patterns
    const critiquePatterns = [
      /I don't like (.+)/gi,
      /This doesn't work (.+)/gi,
      /There's a problem (.+)/gi,
      /I'm having issues (.+)/gi,
      /This is broken (.+)/gi,
      /I can't (.+)/gi,
      /It's not working (.+)/gi,
      /There's an error (.+)/gi,
      /I'm frustrated (.+)/gi,
      /This is wrong (.+)/gi
    ];

    for (const pattern of critiquePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          critiques.push({
            text: match,
            type: 'user_critique',
            timestamp: new Date().toISOString(),
            source: 'chat_analysis'
          });
        }
      }
    }

    return critiques;
  }

  /**
   * Extract todos from assistant messages
   */
  extractTodos(content) {
    const todos = [];
    
    // Look for todo patterns
    const todoPatterns = [
      /- \[ \] (.+)/g,
      /- \[x\] (.+)/g,
      /- \[X\] (.+)/g,
      /TODO: (.+)/gi,
      /FIXME: (.+)/gi,
      /NOTE: (.+)/gi
    ];

    for (const pattern of todoPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const isCompleted = match.includes('[x]') || match.includes('[X]');
          todos.push({
            text: match,
            type: 'todo',
            completed: isCompleted,
            timestamp: new Date().toISOString(),
            source: 'chat_analysis'
          });
        }
      }
    }

    return todos;
  }

  /**
   * Extract "Next Steps" from assistant messages
   */
  extractNextSteps(content) {
    const nextSteps = [];
    
    // Look for "Next Steps" patterns
    const nextStepsPatterns = [
      /Next Steps?: (.+)/gi,
      /Next: (.+)/gi,
      /Following steps?: (.+)/gi,
      /Upcoming: (.+)/gi,
      /Future: (.+)/gi
    ];

    for (const pattern of nextStepsPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          nextSteps.push({
            text: match,
            type: 'next_steps',
            timestamp: new Date().toISOString(),
            source: 'chat_analysis'
          });
        }
      }
    }

    return nextSteps;
  }

  /**
   * Process and track requests
   */
  async processRequests(requests) {
    for (const request of requests) {
      const requestKey = this.normalizeRequestText(request.text);
      
      if (this.requestHistory.has(requestKey)) {
        // Increment repetition count
        const existing = this.requestHistory.get(requestKey);
        existing.repetitionCount++;
        existing.lastSeen = new Date().toISOString();
        this.requestHistory.set(requestKey, existing);
      } else {
        // New request
        this.requestHistory.set(requestKey, {
          ...request,
          repetitionCount: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        });
      }
    }

    // Update Request Log
    await this.updateRequestLog();
  }

  /**
   * Process and track todos
   */
  async processTodos(todos) {
    for (const todo of todos) {
      const todoKey = this.normalizeRequestText(todo.text);
      
      if (this.todoHistory.has(todoKey)) {
        // Update existing todo
        const existing = this.todoHistory.get(todoKey);
        existing.completed = todo.completed;
        existing.lastUpdated = new Date().toISOString();
        this.todoHistory.set(todoKey, existing);
      } else {
        // New todo
        this.todoHistory.set(todoKey, {
          ...todo,
          firstSeen: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
    }

    // Update Todo Tracker
    await this.updateTodoTracker();
  }

  /**
   * Process and track next steps
   */
  async processNextSteps(nextSteps) {
    for (const nextStep of nextSteps) {
      const nextStepKey = this.normalizeRequestText(nextStep.text);
      
      if (this.nextStepsHistory.has(nextStepKey)) {
        // Increment repetition count
        const existing = this.nextStepsHistory.get(nextStepKey);
        existing.repetitionCount++;
        existing.lastSeen = new Date().toISOString();
        this.nextStepsHistory.set(nextStepKey, existing);
      } else {
        // New next step
        this.nextStepsHistory.set(nextStepKey, {
          ...nextStep,
          repetitionCount: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Process and track critiques
   */
  async processCritiques(critiques) {
    for (const critique of critiques) {
      const critiqueKey = this.normalizeRequestText(critique.text);
      
      if (this.requestHistory.has(critiqueKey)) {
        // Mark as critique/issue
        const existing = this.requestHistory.get(critiqueKey);
        existing.isCritique = true;
        existing.critiqueCount = (existing.critiqueCount || 0) + 1;
        existing.lastSeen = new Date().toISOString();
        this.requestHistory.set(critiqueKey, existing);
      } else {
        // New critique
        this.requestHistory.set(critiqueKey, {
          ...critique,
          isCritique: true,
          critiqueCount: 1,
          repetitionCount: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Calculate unresolved likelihood for each request
   */
  async calculateUnresolvedLikelihood() {
    const unresolvedAnalysis = [];

    for (const [key, request] of this.requestHistory) {
      let likelihood = 50; // Base likelihood (assume not done)

      // Add 10% for each repetition
      likelihood += (request.repetitionCount - 1) * 10;

      // Add 20% for critiques/issues
      if (request.isCritique) {
        likelihood += 20;
      }

      // Add 15% for unchecked todos
      if (this.todoHistory.has(key)) {
        const todo = this.todoHistory.get(key);
        if (!todo.completed) {
          likelihood += 15;
        }
      }

      // Add 25% for next steps without completion
      if (this.nextStepsHistory.has(key)) {
        const nextStep = this.nextStepsHistory.get(key);
        if (nextStep.repetitionCount > 1) {
          likelihood += 25;
        }
      }

      // Cap at 100%
      likelihood = Math.min(likelihood, 100);

      unresolvedAnalysis.push({
        request: request.text,
        likelihood: likelihood,
        repetitionCount: request.repetitionCount,
        isCritique: request.isCritique || false,
        hasUncheckedTodo: this.todoHistory.has(key) && !this.todoHistory.get(key).completed,
        hasRepeatedNextSteps: this.nextStepsHistory.has(key) && this.nextStepsHistory.get(key).repetitionCount > 1,
        firstSeen: request.firstSeen,
        lastSeen: request.lastSeen
      });
    }

    // Sort by likelihood (highest first)
    unresolvedAnalysis.sort((a, b) => b.likelihood - a.likelihood);

    // Update Unresolved Requests
    await this.updateUnresolvedRequests(unresolvedAnalysis);

    return unresolvedAnalysis;
  }

  /**
   * Normalize request text for consistent tracking
   */
  normalizeRequestText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Update Request Log
   */
  async updateRequestLog() {
    const timestamp = new Date().toISOString();
    const logEntry = `
## ${timestamp}
- Total Requests: ${this.requestHistory.size}
- New Requests: ${Array.from(this.requestHistory.values()).filter(r => r.repetitionCount === 1).length}
- Repeated Requests: ${Array.from(this.requestHistory.values()).filter(r => r.repetitionCount > 1).length}
- Critiques/Issues: ${Array.from(this.requestHistory.values()).filter(r => r.isCritique).length}

### Recent Requests
${Array.from(this.requestHistory.values())
  .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
  .slice(0, 10)
  .map(r => `- ${r.text} (${r.repetitionCount}x, ${r.isCritique ? 'CRITIQUE' : 'REQUEST'})`)
  .join('\n')}
`;

    try {
      await appendFile(this.requestLogPath, logEntry);
    } catch (error) {
      console.error('❌ Failed to update Request Log:', error);
    }
  }

  /**
   * Update Todo Tracker
   */
  async updateTodoTracker() {
    const timestamp = new Date().toISOString();
    const trackerEntry = `
## ${timestamp}
- Total Todos: ${this.todoHistory.size}
- Completed: ${Array.from(this.todoHistory.values()).filter(t => t.completed).length}
- Unchecked: ${Array.from(this.todoHistory.values()).filter(t => !t.completed).length}

### Unchecked Todos
${Array.from(this.todoHistory.values())
  .filter(t => !t.completed)
  .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
  .slice(0, 10)
  .map(t => `- ${t.text}`)
  .join('\n')}
`;

    try {
      await appendFile(this.todoTrackerPath, trackerEntry);
    } catch (error) {
      console.error('❌ Failed to update Todo Tracker:', error);
    }
  }

  /**
   * Update Unresolved Requests
   */
  async updateUnresolvedRequests(unresolvedAnalysis) {
    const timestamp = new Date().toISOString();
    const unresolvedEntry = `
## ${timestamp}
- Total Unresolved: ${unresolvedAnalysis.length}
- High Priority (>80%): ${unresolvedAnalysis.filter(r => r.likelihood > 80).length}
- Medium Priority (60-80%): ${unresolvedAnalysis.filter(r => r.likelihood >= 60 && r.likelihood <= 80).length}
- Low Priority (<60%): ${unresolvedAnalysis.filter(r => r.likelihood < 60).length}

### High Priority Unresolved Requests
${unresolvedAnalysis
  .filter(r => r.likelihood > 80)
  .slice(0, 10)
  .map(r => `- ${r.request} (${r.likelihood}% unresolved)`)
  .join('\n')}
`;

    try {
      await appendFile(this.unresolvedRequestsPath, unresolvedEntry);
    } catch (error) {
      console.error('❌ Failed to update Unresolved Requests:', error);
    }
  }

  /**
   * Get Chat Analyzer status
   */
  getStatus() {
    return {
      agent: 'Chat Analyzer',
      role: 'Request Tracking & Analysis',
      version: this.version,
      status: 'active',
      trackedRequests: this.requestHistory.size,
      trackedTodos: this.todoHistory.size,
      trackedNextSteps: this.nextStepsHistory.size,
      constitutionalCompliance: true,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default ChatAnalyzerAgent;

