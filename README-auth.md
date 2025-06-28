# SkillForge - AI-Powered Learning Platform

An innovative learning platform built on the Internet Computer Protocol (ICP) that uses AI to create personalized skill development paths with blockchain-verified achievements.

## 🚀 Features

### 🔐 Authentication System
- **Internet Identity Integration**: Secure, decentralized authentication
- **Smart User Onboarding**: Automatic detection of new vs existing users
- **Profile Management**: Complete user profile system with persistent storage
- **Trie-Based Storage**: Efficient data storage using Motoko Trie structures

### 🎯 Core Functionality
- AI-powered skill tree generation
- Personalized learning paths
- Progress tracking and analytics
- Blockchain-verified achievements
- Modern, responsive UI with Tailwind CSS

## 🏗️ Architecture

### Backend (Motoko)
- **Main Canister**: `src/skill-forge-backend/main.mo`
- **Type Definitions**: `src/skill-forge-backend/Types.mo`
- **Authentication Module**: `src/skill-forge-backend/Auth.mo`
- **Storage**: Trie-based persistent storage with upgrade hooks

### Frontend (React + TypeScript)
- **Authentication Service**: Complete II integration
- **Canister Service**: Type-safe backend communication
- **Context Management**: React Context for auth state
- **Modern UI**: Tailwind CSS with animations

## 🔄 Authentication Flow

1. **User clicks "Get Started"** → Internet Identity authentication
2. **Authentication Check** → System verifies if user exists in canister
3. **Route Decision**:
   - **Existing User** → Load profile → Dashboard
   - **New User** → Profile Setup → Dashboard
4. **Profile Setup** (new users):
   - Upload profile picture (optional)
   - Enter full name (required, 2-100 characters)
   - Auto-generate username from first name
   - Save to ICP canister with Trie storage
5. **Dashboard Access** with full authentication state

## 🛠️ Development

### Prerequisites
- Node.js >= 16.0.0
- npm >= 7.0.0
- DFX (DFINITY SDK) latest version

### Quick Start
```bash
# Install dependencies
npm install

# Start local IC replica
dfx start --clean

# Deploy canisters and start development
npm run dev
```

### Available Scripts
```bash
npm run setup          # Complete setup (install + deploy)
npm run dev            # Start development servers
npm run build          # Build frontend
npm run deploy         # Deploy to local replica
npm run deploy:ic      # Deploy to mainnet
npm run clean          # Clean build artifacts
```

## 🧪 Testing Authentication

1. Start the development environment:
   ```bash
   dfx start --clean
   npm run deploy
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Click "Get Started" to test the authentication flow

4. Use Internet Identity in development mode (creates local identity)

5. Test both new user setup and existing user login flows

## 📁 Project Structure

```
skill-forge/
├── src/
│   ├── skill-forge-backend/          # Motoko backend
│   │   ├── main.mo                   # Main canister
│   │   ├── Types.mo                  # Type definitions
│   │   └── Auth.mo                   # Authentication logic
│   ├── skill-forge-frontend/         # React frontend
│   │   └── src/
│   │       ├── services/             # API services
│   │       ├── contexts/             # React contexts
│   │       ├── components/           # UI components
│   │       └── types/                # TypeScript types
│   └── declarations/                 # Auto-generated canister declarations
├── dfx.json                          # DFX configuration
└── package.json                      # Project dependencies
```

## 🔗 Key Technologies

- **Internet Computer Protocol (ICP)**: Blockchain platform
- **Motoko**: Backend smart contract language
- **React 18**: Frontend framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Internet Identity**: Decentralized authentication

## 📚 API Reference

### Backend Canister Methods

```motoko
// Authenticate or create user
authenticateUser(userData: UserCreateData) : Result<AuthResult, Text>

// Get current user profile
getCurrentUser() : Result<User, Text>

// Update user profile
updateUserProfile(updateData: UserUpdateData) : Result<User, Text>

// Check if user exists
userExists() : Bool

// Get user by username
getUserByUsername(username: Text) : ?User
```

### Frontend Services

```typescript
// Auth Service
authService.login() : Promise<boolean>
authService.logout() : Promise<void>
authService.saveUserProfile(profile: UserProfile) : Promise<void>

// Canister Service
canisterService.authenticateUser(userData: UserCreateData) : Promise<AuthResult>
canisterService.getCurrentUser() : Promise<BackendUser>
```

## 🔧 Configuration

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_CANISTER_ID_SKILL_FORGE_BACKEND=your-canister-id
NODE_ENV=development|production

# DFX Network
DFX_NETWORK=local|ic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the authentication flow
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Internet Computer Protocol
