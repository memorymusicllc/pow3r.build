# Enforcement Mechanisms - Compliance and Monitoring

## Rule Hierarchy

### Priority Order (Highest to Lowest)
1. **User-Specific Rules** (`user-policies.md`) - Override all others
2. **Project-Specific Rules** (`project-policies.md`) - Team standards
3. **System Rules** (`system-policies.md`) - Foundation requirements
4. **Default AI Behavior** - Fallback when no rule applies

### Conflict Resolution
- User rules ALWAYS win
- If user and project rules conflict, use user rules and notify
- If project and system rules conflict, use project rules
- Document conflicts and resolution in code comments

## Validation Checkpoints

### Pre-Code Validation
Before writing code:
1. Check applicable rules from all policy files
2. Verify technology stack compliance
3. Confirm data format requirements
4. Review security implications

### Post-Code Validation
After writing code:
1. Run linter: `npm run lint`
2. Check TypeScript compilation
3. Verify test coverage
4. Review security checklist

### Pre-Commit Validation
Before committing:
1. All tests MUST pass
2. No linter errors
3. Build succeeds
4. Rules compliance verified

## Automated Compliance

### Linting Rules
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Pre-commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Lint
npm run lint || exit 1

# Type check
npx tsc --noEmit || exit 1

# Tests
npm test || exit 1

echo "✓ All checks passed"
```

## Monitoring and Feedback

### Compliance Tracking
Track rule violations in `compliance-log.md`:
```markdown
| Date | Rule Violated | File | Resolution |
|------|--------------|------|------------|
| 2025-10-11 | No mock data | src/test.ts | Removed mock data |
```

### Regular Reviews
- **Weekly**: Review rule effectiveness
- **Monthly**: Update rules based on feedback
- **Quarterly**: Comprehensive rule audit

## Violation Response

### Severity Levels

#### Critical (Immediate Action Required)
- Security violations
- Data integrity violations
- User safety issues

Response:
1. Stop current work
2. Fix violation immediately
3. Run full validation
4. Document in compliance log

#### High (Address Before Merge)
- Missing required tests
- Linter errors
- Type errors

Response:
1. Fix before continuing
2. Run validation
3. Update relevant tests

#### Medium (Address Before Deployment)
- Missing documentation
- Suboptimal patterns
- Style guide violations

Response:
1. Create ticket if needed
2. Fix during current session
3. Update documentation

#### Low (Improvement Opportunity)
- Code optimization opportunities
- Better naming suggestions
- Refactoring suggestions

Response:
1. Consider improvements
2. Implement if time permits
3. Document for future

## Exception Process

### When Exceptions Are Allowed
- Technical limitations make compliance impossible
- Urgent hotfix required
- Explicit user override

### Exception Documentation
```typescript
/**
 * @rule-exception SYSTEM-001
 * @reason: Legacy API requires this format
 * @approved-by: user
 * @temporary: Yes, remove after API v2 migration
 */
```

## Continuous Improvement

### Feedback Collection
- Track rule violation frequency
- Collect developer feedback
- Monitor rule effectiveness
- Identify ambiguous rules

### Rule Updates
1. Identify need for update
2. Draft proposed change
3. Review with stakeholders
4. Update policy files
5. Communicate changes
6. Update compliance tools

### Learning Integration
- Maintain rule knowledge base
- Create rule examples
- Document common violations
- Share best practices

## Tools and Automation

### Recommended Tools
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Testing**: Playwright, Vitest
- **Type Checking**: TypeScript Compiler
- **Git Hooks**: Husky + lint-staged

### Custom Validation Scripts
```bash
# validate-rules.sh
#!/bin/bash

echo "🔍 Validating rules compliance..."

# Check for mock data in source
if grep -r "mock" src/ --include="*.ts" --include="*.tsx" | grep -v "test"; then
  echo "❌ Mock data found in source code"
  exit 1
fi

# Check for proper status format
if grep -r '"phase":' src/ --include="*.ts" --include="*.tsx"; then
  echo "⚠️  Legacy status format found, should use new format"
fi

echo "✅ Rules validation complete"
```

## Reporting

### Daily Report
Generated automatically:
- Rules checked
- Violations found
- Fixes applied
- Outstanding issues

### Weekly Summary
- Total compliance rate
- Most common violations
- Rules needing clarification
- Suggested improvements

## Contact and Support

For rule clarifications or exceptions:
1. Document the specific scenario
2. Explain why rule cannot be followed
3. Propose alternative approach
4. Request user approval for exceptions

Remember: Rules exist to ensure quality, security, and consistency. They should help, not hinder development.
