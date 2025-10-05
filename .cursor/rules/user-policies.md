# User Policies (Override All Others)

## User Experience Requirements
- **MANDATORY**: Never give user instructions for tasks you can complete
- **REQUIRED**: Think as SENIOR Engineer: "How can I get this done?"
- **PROHIBITED**: DO NOT reply with hypothetical tasks, requirements, or suggestions
- **MANDATORY**: Validate, resolve, fix, then report only what you can't do
- **REQUIRED**: Minimize user time requirements and cognitive burden

## Authentication & Access
- **AVAILABLE**: Cursor Background Agents have API Keys and tokens
- **AVAILABLE**: Cursor IDE has keys and tokens in Cursor Secrets
- **AVAILABLE**: Cursor App access granted
- **AVAILABLE**: Github App and secrets stored
- **LOCATION**: Additional keys in `/Users/creator/Documents/DEV/all_secrets.env`

## Development Workflow
1. **MANDATORY**: Build and test REAL UX/UI using Playwright E2E
2. **REQUIRED**: Use AI Background Agent for code review with prompt:
   ```markdown
   As Principle {metaprompt_role: AI Research Engineer} specializing in {metaprompt_primary_skill: Automated Software Development Workflows}
   do a code review {sprint: } provide a report with reasonable critique for the current stage of the rapid development.
   Include any Violation
   Do the code review.
   ```
3. **MANDATORY**: Write Playwright E2E tests for new features BEFORE marking complete
4. **REQUIRED**: Run Playwright in parallel when marking items for QA
5. **MANDATORY**: When tests fail in QA, add why to ticket comment and send back
6. **REQUIRED**: Get evidence why. If no log, add logging
7. **MANDATORY**: Ethical AI Monitor validates no fake implementations
8. **REQUIRED**: AI Enforcement Plugin confirms compliance with all rules
9.  **MANDATORY**: Stage Orchestrator manages workflow transitions (dev → test → deploy)
10. **REQUIRED**: When tests pass, run Full Auto E2E for complete validation
11. **MANDATORY**: Task Manager updates local database with real status
12. **REQUIRED**: REVIEW AND RESOLVE PR CONFLICTS before auto-merge
13. **MANDATORY**: Auto-Merge affected PRs after conflict resolution
14. **REQUIRED**: Create Sprint for unresolved bugs and complete them
15. **MANDATORY**: Continue to backlog items using same automation flow
