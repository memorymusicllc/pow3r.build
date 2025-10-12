# System Policies - Foundation Rules

## Trust & Verification

### MANDATORY: Data Integrity
- DO NOT generate fake data or mock data in production code
- DO NOT run simulations with mock data
- MUST use real data sources for all production features
- Test data is ONLY allowed in test files (*.test.*, *.spec.*)

### REQUIRED: Code Quality
- All new code MUST include proper error handling
- All API calls MUST have try-catch blocks
- All async functions MUST handle Promise rejections
- TypeScript MUST be used for all new files (no .js for new code)

### PROHIBITED: Mock Code
- DO NOT create mock implementations in source code
- DO NOT use placeholder/dummy data in production
- DO NOT create theatrical code for demonstration purposes

## Status System Requirements

### MANDATORY: New Status Format
- All status fields MUST use new format: `{state, progress, quality, legacy}`
- Valid states: `building`, `backlogged`, `blocked`, `burned`, `built`, `broken`
- Progress MUST be integer 0-100
- Legacy format supported for backward compatibility only

### REQUIRED: Status Validation
- All status updates MUST validate state against enum
- All progress values MUST be between 0-100
- All quality scores MUST be between 0-1

## Testing Requirements

### MANDATORY: Test Coverage
- All new features MUST have Playwright E2E tests
- All critical paths MUST have test coverage
- Tests MUST pass before deployment

### REQUIRED: Test Types
- E2E tests for user workflows
- Integration tests for API endpoints
- Unit tests for utility functions

## Documentation Standards

### REQUIRED: Code Documentation
- All functions MUST have JSDoc/TSDoc comments
- All complex algorithms MUST have inline comments
- All APIs MUST have endpoint documentation

### MANDATORY: README Requirements
- Feature READMEs MUST link to parent README
- Parent README MUST link to all feature READMEs
- READMEs MUST include usage examples

## Security Policies

### PROHIBITED: Security Violations
- DO NOT expose sensitive data in API responses
- DO NOT log sensitive information
- DO NOT store credentials in code
- DO NOT bypass security checks

### REQUIRED: Input Validation
- All user input MUST be validated
- All API parameters MUST be sanitized
- All database queries MUST use parameterized statements

### Agent to User Status Communication & Full-Auto Execution
- **STATUS FORMAT**: Reply with ONE TASK LIST showing final verification status:
  - "- [x] 🟢 VERIFIED: {name. comment}" - ALL features tested on live CloudFlare deployment
  - "- [ ] 🔴 BLOCKED: {name. comment}" - Storage full or account at max budget (ONLY valid blockers)
- **PROHIBITED RESPONSES**:
  - Do NOT reply with "next steps", "building", "in progress", or "working on it"
  - Do NOT create summary/report/status documents unless explicitly requested
  - Do NOT ask "what should I do?" or "shall I proceed?"
  - Do NOT claim success without CloudFlare deployment ID and live URL testing
  - Do NOT claim credentials unavailable, 
    - All Secrets in CloudFlare
    - All Secrets in Cursor IDE
    - CloudFlare App / Cursor MCP
    - Our custom MCP Server on CloudFlare
    - All ACLs, API Keys, Access Tokens, and variables local environment
    - All ACLs, API Keys, Access Tokens, and variables ../
- **FAILURE DEFINITION**: Responding before completing full deployment and verification = failed full-auto

## Enforcement
- Violation of these rules constitutes a breach of user trust
- Must immediately correct any false status reports
- Must implement proper verification before any success claims
- Must acknowledge and fix the specific bypass that led to violation, including improving the .cursor/ enforcement-mechanisms

## MANDATORY TECH STACK
- REDUX UI (UNBOUND from data and style)
- CSS THEMES
- TAILWIND BASIC CSS
- ZUSTAND 
- VITE
- REACT THREE FIBER 
- CANNOT USE SHADCN, RADIX, OR NEXTJS
