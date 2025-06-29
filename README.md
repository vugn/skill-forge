# SkillForge 🚀

> AI-Powered Skill Development Platform built on Internet Computer Protocol (ICP)

**SkillForge** is a revolutionary AI-powered learning platform built on the Internet Computer Protocol (ICP). This platform enables users to create personalized learning paths with the help of artificial intelligence, complete with interactive skill cards, learning quests, and comprehensive progress tracking systems.

## ✨ Key Features

### 🧠 AI-Powered Learning Path Generator

- **Personalized skill cards**: Input your career goals and AI will create skill cards tailored to your objectives and background
- **Smart Prioritization**: AI analyzes industry trends to prioritize the most important skills
- **Dynamic Adaptation**: Skill cards evolve along with your learning progress

### 🎯 Interactive Learning Experience

- **Visual skill cards**: Attractive visual representation of learning paths with connections between skills
- **Interactive Quests**: Each skill comes with interactive learning quests and quizzes
- **Progress Tracking**: XP system, levels, and achievements to motivate learning
- **Real-time Updates**: Progress and skill status update in real-time

### 🎨 Modern UI/UX Design

- **Glassmorphism Design**: Modern interface with glass effects and backdrop blur
- **Responsive Interface**: Optimized for desktop and mobile
- **Smooth Animations**: Framer Motion animations for fluid experience
- **Dark Theme**: Professional dark theme with eye-catching accent colors

### 🔐 Decentralized & Secure

- **ICP Integration**: Built on Internet Computer Protocol for full decentralization
- **Identity Management**: Secure authentication using Internet Identity
- **Data Ownership**: Users have full control over their learning data

## 🛠 Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing
- **Vite** - Fast build tool and development server

### Backend

- **Motoko** - Native ICP programming language
- **Internet Computer Protocol (ICP)** - Decentralized cloud platform
- **Internet Identity** - Secure, anonymous authentication

### Development Tools

- **DFX** - DFINITY command-line execution environment
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- DFX (DFINITY SDK)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd skill-forge
```

2. **Install dependencies**

```bash
npm install
```

3. **Start local Internet Computer replica**

```bash
dfx start --background
```

4. **Deploy canisters**

```bash
dfx deploy
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Quick Setup (All-in-One)

```bash
npm run setup
```

## 📖 Usage Guide

### 1. **Create Account**

- Visit the homepage and click "Get Started"
- Authenticate using Internet Identity
- Set up your profile with name and profile picture

### 2. **Generate AI Skill Card**

- Navigate to the "Skills" page
- Input your career goal (e.g., "Frontend Developer", "Data Scientist")
- AI will generate a comprehensive skill card with prerequisites and learning path
- Review and accept the generated skill card

### 3. **Start Learning**

- Access skill cards through the dashboard
- Click on available skills to start quests
- Complete quizzes and interactive challenges
- Earn XP and unlock new skills

### 4. **Track Progress**

- Monitor progress through the dashboard
- View learning statistics and achievements
- Access profile for detailed progress overview

## 🏗 Project Structure

```
skill-forge/
├── src/
│   ├── skill-forge-backend/          # Motoko backend canister
│   │   ├── main.mo                   # Main backend logic and API endpoints
│   │   ├── core/                     # Core data structures and utilities
│   │   │   ├── Types.mo              # Type definitions
│   │   │   └── Level.mo              # Level and XP system
│   │   ├── auth/                     # Authentication module
│   │   │   └── Auth.mo               # User authentication logic
│   │   ├── services/                 # Service modules
│   │   │   ├── user/                 # User management
│   │   │   │   └── UserService.mo    # User operations
│   │   │   ├── skillcard/            # Skill card system
│   │   │   │   ├── SkillCard.mo      # AI skill card generation
│   │   │   │   └── SkillCardService.mo # Skill card operations
│   │   │   └── storage/              # Data storage
│   │   │       └── Storage.mo        # Storage utilities
│   │   └── ARCHITECTURE.md           # Backend architecture documentation
│   └── skill-forge-frontend/         # React frontend application
│       ├── src/
│       │   ├── components/           # React components
│       │   │   ├── ai/              # AI-related components
│       │   │   ├── dashboard/       # Dashboard and skill cards
│       │   │   ├── profile/         # User profile management
│       │   │   ├── skills/          # Skills and learning paths
│       │   │   ├── account/         # Account setup
│       │   │   ├── common/          # Common components
│       │   │   └── ui/              # Reusable UI components
│       │   ├── contexts/            # React contexts
│       │   ├── hooks/               # Custom React hooks
│       │   ├── services/            # API services
│       │   ├── types/               # TypeScript type definitions
│       │   ├── utils/               # Utility functions
│       │   └── constants/           # Application constants
│       └── public/                  # Static assets
├── dfx.json                         # DFX configuration
├── mops.toml                        # Motoko package manager
└── package.json                     # Root package configuration
```

## 🏛️ Backend Architecture

The backend follows a clean, modular architecture with clear separation of concerns:

### Core Modules
- **Types.mo**: Central type definitions for all data structures
- **Level.mo**: Experience points and leveling system logic

### Authentication Layer
- **Auth.mo**: User authentication, profile management, and Internet Identity integration

### Service Layer
- **UserService.mo**: User operations and profile management
- **SkillCard.mo**: AI-powered skill card generation using LLM
- **SkillCardService.mo**: Skill card operations and quest management
- **Storage.mo**: Data persistence and storage utilities

### Main Entry Point
- **main.mo**: API endpoints and business logic orchestration


## 🎯 Core Components

### AI Skill Card Generator (`/skills`)

Main component that allows users to:

- Input career goals and background
- Generate personalized skill cards using AI
- Preview and customize skill cards before acceptance
- View detailed skill information and prerequisites

### Interactive Dashboard (`/dashboard`)

Central hub that displays:

- User profile and learning statistics
- Interactive skill card canvas with zoom and drag functionality
- Progress tracking and XP system
- Quick access to available skills and quests

### Learning Path Detail (`/learning-path/:id`)

Detailed view for each learning path:

- Full-screen interactive skill card
- Skills sidebar with detailed information
- Quest modal with interactive quizzes
- Progress tracking and completion management

### User Profile (`/profile`)

Comprehensive profile management:

- Personal information editing
- Learning statistics overview
- Skill card progress tracking
- Achievement system

## 🎨 Design System

### Color Palette

- **Primary**: Deep Navy (`#0B1426`) and Dark Blue (`#1E293B`)
- **Accent**: Gold (`#F59E0B`) for highlights and CTAs
- **Success**: Green (`#10B981`) for completed items
- **Warning**: Orange (`#F97316`) for in-progress items
- **Info**: Blue (`#3B82F6`) for available items

### Typography

- **Headings**: Bold, high contrast
- **Body**: Clean, readable typography
- **Code**: Monospace for technical content

### Animations

- **Smooth Transitions**: Framer Motion for seamless interactions
- **Loading States**: Skeleton loading and progress indicators
- **Hover Effects**: Subtle scale and color transitions
- **Progress Animations**: Animated progress bars and XP counters

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run setup           # Complete setup (install + deploy + start)

# Building
npm run build           # Build for production
npm run prebuild        # Pre-build tasks

# Deployment
npm run deploy          # Deploy to local network
npm run deploy:local    # Deploy to local network (explicit)
npm run deploy:ic       # Deploy to IC mainnet

# Maintenance
npm run clean           # Clean build artifacts and stop dfx
npm run generate        # Generate canister declarations
npm test               # Run tests
```

## 🎯 Target Users

- **Career Changers**: Professionals looking to transition to the tech industry
- **Students**: Students seeking structured learning paths
- **Self-Learners**: Individuals who prefer personalized learning approaches
- **Professionals**: Working professionals looking to upskill

## 🚀 Future Roadmap

- [ ] **System Rank**: Introduce a global ranking system where users can compare their progress and achievements with others on the platform.
- [ ] **Daily Quest**: Add daily learning challenges and quests to encourage consistent engagement and reward users with XP or badges.
- [ ] **Guild**: Enable users to form or join guilds (learning groups) for collaborative quests, group discussions, and peer support.
- [ ] **AI Mentor**: Integrate an AI-powered mentor that provides personalized feedback, study tips, and adaptive learning recommendations.
- [ ] **World Challenge**: Launch periodic platform-wide challenges where users collaborate or compete to solve real-world problems and unlock exclusive rewards.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for improvements.

## 📞 Support

For support and questions, please open an issue on GitHub or contact our team.

---

**Built with ❤️ on Internet Computer Protocol**