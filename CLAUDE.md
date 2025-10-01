# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SolidJS web application that serves as a password-protected MMD (MikuMikuDance) archive thumbnail viewer hosted at `mmd.hakatashi.com`. The application provides a gallery interface for browsing MMD model thumbnails stored in AWS S3.

## Common Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run serve      # Preview production build locally
```

### Dependencies
```bash
npm install        # Install dependencies
npm outdated       # Check for outdated packages
```

## Architecture Overview

### Core Application Flow
1. **Routing**: Uses `@solidjs/router` for client-side navigation with three routes: `/` (login), `/gallery` (protected), and `/models/:hash` (protected)
2. **Password Authentication**: User enters alphanumeric password with I-Ching style visual hint on login page
3. **Route Protection**: Gallery and model details routes validate password and redirect to login if invalid
4. **Data Fetching**: Retrieves model metadata from S3 endpoint (`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${password}.json`)
5. **Data Processing**: Decodes hex-encoded file paths and generates SHA-256 hashes for S3 keys
6. **Gallery Display**: Shows random sample of 20 models with interactive mode switcher and refresh functionality
7. **Model Details**: Displays individual model with all 30 pose variations and back navigation
8. **State Persistence**: Sampled models persist across navigation to maintain consistent gallery view

### Key Technical Components

**Routing**: SolidJS Router manages navigation between login (`/`), gallery (`/gallery`), and model details (`/models/:hash`) routes. Protected routes use custom `ProtectedRoute` component to guard access.

**State Management**: Uses SolidJS signals with `createSignal` for reactive state management. App-level state includes password, sampled models, and viewing mode. Password and mode persist in localStorage. Sampled models state is shared between Gallery and ModelDetails components to preserve consistency.

**API Integration**: Throttled API calls (500ms) to S3 with error handling for invalid passwords. Data format includes hex-encoded file paths that require Buffer processing.

**Cryptographic Features**: SHA-256 hashing via Web Crypto API to generate secure model identifiers for S3 key generation.

**Performance**: Random sampling limits display to 20 models for fast loading. CSS animations use hardware acceleration. Models are sampled once and reused across navigation.

**Interactive Features**:
- Mode switcher (original/nude) with localStorage persistence
- Refresh button to generate new random sample
- Click-to-navigate from gallery thumbnails to model details
- Back button to return to gallery with preserved sample

### File Structure

- `src/App.tsx` - Main application component with router setup, shared state management (password, sampled models)
- `src/components/Login.tsx` - Login page with password input and authentication logic
- `src/components/Login.module.css` - Login page styles (header, logo, password input)
- `src/components/Gallery.tsx` - Gallery page displaying random sample of model thumbnails with refresh functionality
- `src/components/Gallery.module.css` - Gallery page styles (container, thumbnails, refresh button)
- `src/components/ModelDetails.tsx` - Model details page showing all poses for a single model
- `src/components/ModelDetails.module.css` - Model details page styles (pose grid, back button)
- `src/components/ModeSwitcher.tsx` - Reusable mode toggle component (original/nude)
- `src/components/ModeSwitcher.module.css` - Mode switcher styles
- `src/components/ProtectedRoute.tsx` - Route guard component for authentication
- `src/App.module.css` - Shared application styles
- `src/index.tsx` - Application entry point with SolidJS setup
- `public/CNAME` - GitHub Pages domain configuration
- `.github/workflows/deploy.yml` - Automated deployment pipeline

## Development Configuration

### Build Setup
- **Framework**: SolidJS 1.9.9 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7 with ESNext target
- **Dev Server**: Port 3000 with HMR
- **JSX**: SolidJS transform enabled

### Key Dependencies
- **@solidjs/router**: Client-side routing for SolidJS applications
- **lodash**: Used for `sampleSize` (random model sampling) and `throttle` (API rate limiting)
- **buffer**: Browser polyfill for hex string processing
- **@types/lodash**: TypeScript definitions for lodash
- **@types/node**: TypeScript definitions for Node.js built-in modules

## Deployment

The application deploys automatically to GitHub Pages via GitHub Actions on pushes to `main` branch. The build output (`dist/`) is served at `mmd.hakatashi.com` with CNAME configuration.

## Data Format

The S3 JSON endpoints return arrays of hex-encoded file paths. Each path requires:
1. Hex decoding to get the original file path
2. SHA-256 hashing to generate the S3 object key
3. URL construction for thumbnail display

Example flow:
```
Hex string → Buffer.from(hex, 'hex') → crypto.subtle.digest('SHA-256') → S3 URL
```

## Security Considerations

- Password validation is client-side only (alphanumeric characters)
- No sensitive data stored in source code
- All model data fetched from public S3 bucket with computed keys
- Authentication relies on knowledge of correct password for data endpoint