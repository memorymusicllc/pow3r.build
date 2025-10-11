# Project Policies - Pow3r.build Specific Rules

## Technology Stack

### MANDATORY: Required Technologies
- React 18.2.0+ for UI components
- TypeScript 5.3.3+ for all new code
- Three.js for 3D visualization
- Vite 5.0.8+ for build system
- Playwright for E2E testing

### REQUIRED: Styling
- Tailwind CSS for styling (MANDATORY)
- DO NOT use inline styles
- Particle Space theme for all UI components
- Mobile-first responsive design

## Component Architecture

### MANDATORY: Component Structure
- All React components MUST use TypeScript
- All components MUST be functional components with hooks
- All components MUST include prop types/interfaces
- All components MUST handle loading and error states

### REQUIRED: Component Organization
- UI components in `/src/components/`
- Integration components in `/src/integrations/`
- Utilities in `/src/utils/`
- Types in `/src/types/`

## Data Flow

### MANDATORY: Status Data Format
- Repository level: `{state, progress, quality, legacy}`
- Node level: `{state, progress, quality, legacy}`
- Use `status_utils.py` (Python) or `status-utils.js` (JS) for conversions
- Support both new and legacy formats for backward compatibility

### REQUIRED: Configuration
- pow3r.status.config.json for configuration
- data.json as fallback
- Validate against schema in `/docs/pow3r.status.json`

## API Integration

### MANDATORY: CloudFlare Workers
- All CloudFlare Workers MUST use status-utils.js
- All API endpoints MUST return normalized status format
- All responses MUST include CORS headers
- All errors MUST be handled and logged

### REQUIRED: Data Aggregation
- Aggregate data from KV storage
- Support R2 bucket as secondary storage
- Cache responses appropriately
- Include status breakdown in responses

## Build & Deployment

### MANDATORY: Build Requirements
- Production build MUST be < 300 KB (gzipped)
- All TypeScript MUST compile without errors
- All linter warnings MUST be resolved
- All tests MUST pass

### REQUIRED: Deployment Process
1. Run linter: `npm run lint`
2. Build project: `npm run build`
3. Run tests: `npm test`
4. Review build output
5. Deploy via Git push (triggers CloudFlare Pages)

## Navigation & UI

### MANDATORY: Navigation Style
- Bottom nav bar for mobile (< 768px width)
- Left sidebar for tablet/desktop (>= 768px width)
- Fixed position navigation
- Auto-hide on scroll down, show on scroll up

### REQUIRED: Dashboard Design
- Max width mobile: device width - padding
- Max width desktop: 520px per card
- Cards wrap and stack responsively
- Touch-friendly controls (min 44x44px)

## Version Control

### PROHIBITED: Git Operations
- DO NOT force push to main/master
- DO NOT skip hooks (--no-verify)
- DO NOT hard reset shared branches
- DO NOT update git config without permission

### REQUIRED: Commit Standards
- Use conventional commits format
- Include ticket/issue numbers when applicable
- Write descriptive commit messages
- Commit only working code
