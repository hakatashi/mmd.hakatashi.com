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
1. **Password Authentication**: User enters alphanumeric password with I-Ching style visual hint
2. **Data Fetching**: Retrieves model metadata from S3 endpoint (`https://hakata-public.s3.ap-northeast-1.amazonaws.com/mmd-archive-thumbs/${password}.json`)
3. **Data Processing**: Decodes hex-encoded file paths and generates SHA-256 hashes for S3 keys
4. **Gallery Display**: Shows random sample of 100 models with 30+ pose variations per model

### Key Technical Components

**State Management**: Uses SolidJS signals with `createSignal` for reactive state management. Password and viewing mode persist in localStorage.

**API Integration**: Throttled API calls (500ms) to S3 with error handling for invalid passwords. Data format includes hex-encoded file paths that require Buffer processing.

**Cryptographic Features**: SHA-256 hashing via Web Crypto API to generate secure model identifiers for S3 key generation.

**Performance**: Random sampling limits display to 100 models for fast loading. CSS animations use hardware acceleration.

### File Structure

- `src/App.tsx` - Main application component with authentication and gallery logic
- `src/App.module.css` - Component-scoped styles with CSS animations
- `src/index.tsx` - Application entry point with SolidJS setup
- `public/CNAME` - GitHub Pages domain configuration
- `.github/workflows/deploy.yml` - Automated deployment pipeline

## Development Configuration

### Build Setup
- **Framework**: SolidJS 1.9.9 with TypeScript 5.9.3
- **Build Tool**: Vite 6.3.6 with ESNext target
- **Dev Server**: Port 3000 with HMR
- **JSX**: SolidJS transform enabled

### Key Dependencies
- **lodash**: Used for `sampleSize` (random model sampling) and `throttle` (API rate limiting)
- **buffer**: Browser polyfill for hex string processing
- **@types/lodash**: TypeScript definitions

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