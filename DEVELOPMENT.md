# Development Guide

## Project Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- DFX (DFINITY SDK) latest version

### First Time Setup

1. Clone the repository
2. Run `npm run setup` for complete setup
3. Access the app at `http://localhost:3000`

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start local IC replica
dfx start --clean

# Terminal 2: Deploy and start frontend
npm run dev
```

### Making Changes

#### Frontend Changes

- Hot reload is enabled via Vite
- Changes to React components will auto-refresh
- TypeScript errors will show in terminal and browser

#### Backend Changes

- Modify `src/skill-forge-backend/main.mo`
- Redeploy: `dfx deploy skill-forge-backend`
- Generate new declarations: `dfx generate`
- Restart frontend if needed

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## Architecture

### Frontend Structure

```
src/skill-forge-frontend/src/
├── components/
│   ├── ai/              # AI-related components
│   ├── dashboard/       # Dashboard and skill tree
│   ├── profile/         # User profile
│   ├── skills/          # Skills and learning paths
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript types
└── utils/               # Utilities
```

### Backend Structure

```
src/skill-forge-backend/
└── main.mo             # Main backend logic
```

### Key Components

#### AI Skill Tree Generator

- Location: `components/ai/AISkillTreeGenerator.tsx`
- Purpose: Generate personalized learning paths
- Features: Career goal input, AI generation, preview/accept flow

#### Interactive Dashboard

- Location: `components/dashboard/Dashboard.tsx`
- Purpose: Central user hub
- Features: Profile overview, skill tree canvas, progress tracking

#### Skill Tree Canvas

- Location: `components/dashboard/SkillTreeCanvas.tsx`
- Purpose: Interactive skill visualization
- Features: Zoom, drag, node interactions, progress indicators

### State Management

- React Context for authentication (`contexts/AuthContext.tsx`)
- Local state for component-specific data
- ICP backend for persistent data

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS for complex animations
- Framer Motion for interactive animations
- Glassmorphism design system

## API Integration

### ICP Backend Communication

```typescript
// Example service call
import { skill_forge_backend } from "../declarations/skill-forge-backend";

const createProfile = async (data) => {
  return await skill_forge_backend.createUserProfile(
    data.id,
    data.fullName,
    data.profilePicture
  );
};
```

### Authentication Flow

1. User clicks "Get Started"
2. Internet Identity authentication
3. Profile creation/retrieval
4. Context state update
5. Redirect to dashboard

## Deployment

### Local Development

```bash
dfx start --background
dfx deploy
npm run dev
```

### Production Build

```bash
npm run build
dfx deploy --network ic
```

## Troubleshooting

### Common Issues

#### DFX Connection Issues

```bash
# Reset local state
dfx stop
dfx start --clean
dfx deploy
```

#### Frontend Build Issues

```bash
# Clear cache
npm run clean
npm install
npm run dev
```

#### TypeScript Errors

```bash
# Regenerate declarations
dfx generate
npm run type-check
```

### Performance Optimization

- Use React.memo for expensive components
- Implement proper key props for lists
- Optimize images and assets
- Use lazy loading for routes

### Debugging

- Use browser DevTools for frontend
- Use `console.log` in Motoko (shows in dfx logs)
- Check network tab for API calls
- Use React DevTools extension
