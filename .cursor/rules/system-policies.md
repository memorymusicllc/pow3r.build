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
