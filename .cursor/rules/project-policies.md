# Project Policies (Highest Priority)

## Required Technology Stack
- **MANDATORY**: React Three Fiber/Redux UI/Zustand/Vite/Tailwind CSS/Playwright/CloudFlare/Abacus.ai/React Flow
- **REQUIRED**: Use specified technologies for all new implementations
- **PROHIBITED**: DO NOT use technologies outside the approved stack

## Automation Permissions
- **AUTHORIZED TOOLS**: terminal/fs/web/edit_file/E2E/Full-Auto/Background Agents/Github/CloudFlare/Playwright/Auto-Merge/GitHub CLI/GitHub Actions/GitHub App/token/Cloudflare Pages/Workers token/PR Auto-merge/Github Settings/GitHub CLI access/filesystem write/read CI job statuses and Cloudflare account outputs/shell and filesystem/write

## Testing Requirements
- **MANDATORY**: Testing is REQUIRED for all features
- **REQUIRED**: Use version display: `v.{DEV/PROD}.{YYYMMDD.HH.MM}.{CloudFlare_Deployment_ID}`
- **MANDATORY**: Use Playwright E2E testing when possible
- **PROHIBITED**: DO NOT rely on code review only
- **REQUIRED**: Real UX/UI testing before completion
- **MANDATORY**: Build and test before status changes
- **PROHIBITED**: DO NOT use simulations or mock implementations

## Code Quality Standards
- **PROHIBITED**: DO NOT use mock data violations
- **MANDATORY**: Use real data connections, API, MCP, etc.
- **PROHIBITED**: DO NOT write temporary code without explicit user permission
- **REQUIRED**: Revert temporary code immediately after testing
- **MANDATORY**: Add comments explaining integration choices
- **REQUIRED**: Write Playwright tests for UX features before marking complete
- **MANDATORY**: Search for all references when deleting files
- **REQUIRED**: Check existing solutions before creating new scripts
