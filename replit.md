# MobileCode Pro

## Overview

MobileCode Pro is a web-based code editor designed to work seamlessly on any device - phone, tablet, or laptop. It provides a professional coding environment with live preview capabilities for HTML, CSS, and JavaScript. The application is built as a client-side only React application with no backend, using Vite as the build tool and deployed to Vercel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state (configured for client-only use with no refetching)
- **Styling**: Tailwind CSS with CSS variables for theming, using shadcn/ui component library

### Component Structure
- **UI Components**: Located in `client/src/components/ui/` - comprehensive shadcn/ui component library based on Radix UI primitives
- **Feature Components**: Located in `client/src/components/` - includes CodeEditor, PreviewContainer, FileTree, and FileUploadZone
- **Pages**: Home landing page, Editor page, and 404 Not Found page

### Code Editor Features
- **Multi-tab editing**: HTML, CSS, and JavaScript tabs with syntax-aware editing
- **Live Preview**: Real-time code execution in sandboxed iframe with console output capture
- **Viewport Modes**: Desktop, tablet, and mobile preview sizes
- **Local Storage Persistence**: Code is saved to localStorage for session persistence
- **Project Processing**: Client-side bundling of HTML, CSS, JS, and assets

### Code Execution
- The `CodeRunner` class generates self-contained HTML documents for preview
- Console methods are overridden to capture and forward output to parent window
- Preview is rendered in an isolated iframe for security

### File Handling
- `ProjectProcessor` handles multi-file projects with path resolution
- Supports web assets including images, fonts, and media files
- File upload zone with drag-and-drop support

### Design System
- Dark mode as default with VS Code-inspired theming
- CSS variables for consistent theming across components
- Glassmorphism effects for modern UI appearance
- Inter font family for typography

## External Dependencies

### UI Framework
- **Radix UI**: Complete set of accessible, unstyled UI primitives
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library

### Styling & Animation
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: For component variant management
- **Framer Motion**: Animation library
- **Embla Carousel**: Carousel component

### Utilities
- **clsx/tailwind-merge**: Class name utilities
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation
- **react-hook-form + zod**: Form handling and validation

### Deployment
- **Vercel**: Static site hosting with SPA rewrites configured in `vercel.json`
- Output directory: `dist`
- All routes rewrite to `index.html` for client-side routing