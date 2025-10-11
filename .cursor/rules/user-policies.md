# User Policies - Override Rules

These policies override all other policies and reflect user preferences.

## Browser Testing

### PROHIBITED: Tor Browser
- DO NOT use Tor Browser for testing
- Use Chrome, Firefox, or Safari for testing

## Data Handling

### MANDATORY: No Fake Data
- DO NOT GENERATE FAKE DATA
- DO NOT RUN SIMULATIONS
- DO NOT use mock data or mock code
- DO NOT create theatrical code

## Documentation

### REQUIRED: README Management
- When creating feature READMEs (README-[feature].md):
  * MUST link to parent README
  * MUST add link in parent README to feature README
- Maintain bidirectional navigation

## Daily Logging

### REQUIRED: Context Window Management
When user indicates memory drift, feature loss, or missing information:
1. Review chat and agent history
2. Check for deviation from original task
3. Check for missing solutions or omitted features
4. If drift detected:
   - Notify user about context window limitations
   - Recommend updating `dailylog.md`
   - Recommend starting new chat to preserve continuity

### REQUIRED: Daily Log Updates (`dailylog.md`)
Update after major events:
- Bug fixes
- Feature start/completion
- Context window full
- Git commits

Include:
- Summary of major changes and insights
- Resolved issues
- In-progress items
- New issues discovered
- What has not worked and why
- Analysis of conversation patterns

### REQUIRED: Todo Table (top of dailylog.md)
Maintain table sorted by most recent:
```markdown
| x/o | Status | Description | [Date Modified](link) | [Date Created](link) |
```

### REQUIRED: Prompt History (`prompts.md`)
Log prompts in table format:
```markdown
| Date (YYYY-MM-DDTHH:MM:SSZ) | Category | Prompt | Prompt Snippet |
```
- Remove reference information from prompts
- Record original and improved version
- Keep general purpose versions

## Mobile-First Design

### MANDATORY: Mobile Priority
- ALL UI components MUST be designed for mobile first
- Desktop experience adds more UI, never just stretches mobile
- Touch-friendly controls (min 44x44px)
- Clear navigation and minimal clutter on mobile

### REQUIRED: Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Compliance

### CRITICAL: Cursor Rules Compliance
- Compliance to Cursor Rules in .cursor/rules/ is REQUIRED
- These are NOT preferences
- Failure to comply is an UNETHICAL VIOLATION of user trust and safety
- Rules violations MUST be reported and corrected immediately
