# SkillForge 🚀

> AI-Powered Skill Development Platform built on Internet Computer Protocol (ICP)

**SkillForge** adalah platform pembelajaran berbasis AI yang revolusioner, dibangun di atas Internet Computer Protocol (ICP). Platform ini memungkinkan pengguna untuk membuat jalur pembelajaran yang dipersonalisasi dengan bantuan kecerdasan buatan, lengkap dengan skill tree interaktif, quest pembelajaran, dan sistem tracking progress yang komprehensif.

## ✨ Key Features

### 🧠 AI-Powered Learning Path Generator

- **Personalized Skill Trees**: Input career goal Anda dan AI akan membuat skill tree yang disesuaikan dengan tujuan dan background Anda
- **Smart Prioritization**: AI menganalisis tren industri untuk memprioritaskan skill yang paling penting
- **Dynamic Adaptation**: Skill tree berkembang seiring dengan progress pembelajaran Anda

### 🎯 Interactive Learning Experience

- **Visual Skill Trees**: Representasi visual yang menarik dari jalur pembelajaran dengan koneksi antar skill
- **Interactive Quests**: Setiap skill dilengkapi dengan quest pembelajaran interaktif dan quiz
- **Progress Tracking**: Sistem XP, level, dan achievement untuk memotivasi pembelajaran
- **Real-time Updates**: Progress dan status skill ter-update secara real-time

### 🎨 Modern UI/UX Design

- **Glassmorphism Design**: Antarmuka modern dengan efek glass dan backdrop blur
- **Responsive Interface**: Optimized untuk desktop dan mobile
- **Smooth Animations**: Framer Motion animations untuk pengalaman yang fluid
- **Dark Theme**: Professional dark theme dengan accent colors yang eye-catching

### 🔐 Decentralized & Secure

- **ICP Integration**: Built on Internet Computer Protocol untuk desentralisasi penuh
- **Identity Management**: Secure authentication menggunakan Internet Identity
- **Data Ownership**: User memiliki kontrol penuh atas data pembelajaran mereka

## 🛠 Tech Stack

### Frontend

- **React 18** - Modern React dengan hooks dan concurrent features
- **TypeScript** - Type safety dan better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations dan transitions
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing
- **Vite** - Fast build tool dan development server

### Backend

- **Motoko** - Native ICP programming language
- **Internet Computer Protocol (ICP)** - Decentralized cloud platform
- **Internet Identity** - Secure, anonymous authentication

### Development Tools

- **DFX** - DFINITY command-line execution environment
- **ESLint** - Code linting dan formatting
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

- Kunjungi homepage dan klik "Get Started"
- Authenticate menggunakan Internet Identity
- Setup profile dengan nama dan foto profil

### 2. **Generate AI Skill Tree**

- Navigate ke "Skills" page
- Input career goal Anda (contoh: "Frontend Developer", "Data Scientist")
- AI akan generate comprehensive skill tree dengan prerequisites dan learning path
- Review dan accept skill tree yang digenerate

### 3. **Start Learning**

- Akses skill tree melalui dashboard
- Klik pada available skills untuk memulai quest
- Complete quiz dan interactive challenges
- Earn XP dan unlock new skills

### 4. **Track Progress**

- Monitor progress melalui dashboard
- View learning statistics dan achievements
- Akses profile untuk detailed progress overview

## 🏗 Project Structure

```
skill-forge/
├── src/
│   ├── skill-forge-backend/          # Motoko backend canister
│   │   └── main.mo                   # Backend logic dan data management
│   └── skill-forge-frontend/         # React frontend application
│       ├── src/
│       │   ├── components/           # React components
│       │   │   ├── ai/              # AI-related components
│       │   │   ├── dashboard/       # Dashboard dan skill tree
│       │   │   ├── profile/         # User profile management
│       │   │   ├── skills/          # Skills dan learning paths
│       │   │   └── ui/              # Reusable UI components
│       │   ├── contexts/            # React contexts
│       │   ├── hooks/               # Custom React hooks
│       │   ├── services/            # API services
│       │   ├── types/               # TypeScript type definitions
│       │   └── utils/               # Utility functions
│       └── public/                  # Static assets
├── dfx.json                         # DFX configuration
└── package.json                     # Root package configuration
```

## 🎯 Core Components

### AI Skill Tree Generator (`/skills`)

Komponen utama yang memungkinkan user untuk:

- Input career goals dan background
- Generate personalized skill trees menggunakan AI
- Preview dan customize skill trees sebelum accept
- View detailed skill information dan prerequisites

### Interactive Dashboard (`/dashboard`)

Central hub yang menampilkan:

- User profile dan learning statistics
- Interactive skill tree canvas dengan zoom dan drag functionality
- Progress tracking dan XP system
- Quick access ke available skills dan quests

### Learning Path Detail (`/learning-path/:id`)

Detailed view untuk setiap learning path:

- Full-screen interactive skill tree
- Skill sidebar dengan detailed information
- Quest modal dengan interactive quizzes
- Progress tracking dan completion management

### User Profile (`/profile`)

Comprehensive profile management:

- Personal information editing
- Learning statistics overview
- Skill trees progress tracking
- Achievement system

## 🎨 Design System

### Color Palette

- **Primary**: Deep Navy (`#0B1426`) dan Dark Blue (`#1E293B`)
- **Accent**: Gold (`#F59E0B`) untuk highlights dan CTAs
- **Success**: Green (`#10B981`) untuk completed items
- **Warning**: Orange (`#F97316`) untuk in-progress items
- **Info**: Blue (`#3B82F6`) untuk available items

### Typography

- **Headings**: Bold, high contrast
- **Body**: Clean, readable typography
- **Code**: Monospace untuk technical content

### Animations

- **Smooth Transitions**: Framer Motion untuk seamless interactions
- **Loading States**: Skeleton loading dan progress indicators
- **Hover Effects**: Subtle scale dan color transitions
- **Progress Animations**: Animated progress bars dan XP counters

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
npm run clean           # Clean build artifacts dan stop dfx
npm run generate        # Generate canister declarations
npm test               # Run tests
```

## 🎯 Target Users

- **Career Changers**: Professionals yang ingin transition ke tech industry
- **Students**: Mahasiswa yang ingin structured learning path
- **Self-Learners**: Individuals yang prefer personalized learning approach
- **Professionals**: Working professionals yang ingin upskill

## 🚀 Future Roadmap

- [ ] **Social Learning**: Collaborative learning dan peer reviews
- [ ] **Certification System**: Verifiable certificates on blockchain
- [ ] **Marketplace**: Course content marketplace
- [ ] **Mentorship Platform**: Connect dengan industry mentors
- [ ] **Company Integration**: Corporate training solutions
- [ ] **Mobile App**: Native mobile applications

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines dan submit pull requests untuk improvements.

## 📞 Support

For support dan questions, please open an issue on GitHub atau contact our team.

---

**Built with ❤️ on Internet Computer Protocol**

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
