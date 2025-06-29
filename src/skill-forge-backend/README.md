# SkillForge Backend - Refactored Architecture

## Overview

The SkillForge backend has been refactored to follow clean code principles, with a modular architecture that separates concerns and improves maintainability. All debug code has been removed and comprehensive documentation has been added.

## Architecture

### Core Modules

#### 1. **Types.mo** - Data Structure Definitions
- **Purpose**: Defines all data structures used throughout the application
- **Key Types**:
  - `User`: User profile information
  - `SkillCard`: Complete skill card with multiple skills
  - `Quest`: Quiz/assessment for skill validation
  - `UserSkillProgress`: User's progress tracking
  - Storage types using Trie for efficient lookups

#### 2. **Auth.mo** - Authentication & User Management
- **Purpose**: Handles user authentication and profile management
- **Key Functions**:
  - `authenticateUser()`: Authenticate or create users with Internet Identity
  - `updateUserProfile()`: Update user profile information
  - `getUserByUsername()`: Find users by username
  - `getUserByPrincipal()`: Find users by principal ID

#### 3. **Level.mo** - Experience & Leveling System
- **Purpose**: Manages user experience, levels, and progression
- **Key Functions**:
  - `addExperience()`: Add experience and check for level up
  - `getLevelInfo()`: Get current level information
  - `getExpRequiredForLevel()`: Calculate experience requirements
  - `getExpReward()`: Get experience rewards for activities

#### 4. **SkillCard.mo** - Skill Card Generation & Management
- **Purpose**: Handles AI-powered skill card generation and management
- **Key Functions**:
  - `generateSkillCard()`: Generate skill cards using LLM
  - `acceptSkillCard()`: Accept a skill card for learning
  - `unlockSkill()`: Unlock skills based on dependencies
  - JSON parsing and validation for LLM responses

### Service Modules (`modules/`)

#### 1. **Storage.mo** - Data Persistence Layer
- **Purpose**: Provides clean interface for all storage operations
- **Key Functions**:
  - `storeUser()`, `storeSkillCard()`, `storeQuest()`: Store data
  - `findUser()`, `findSkillCard()`, `findQuest()`: Retrieve data
  - `usersToArray()`, `skillCardsToArray()`: Convert for upgrades
  - `rebuildUsers()`, `rebuildSkillCards()`: Restore after upgrades

#### 2. **UserService.mo** - User Business Logic
- **Purpose**: Handles user-related business logic and operations
- **Key Functions**:
  - `ensureUserExists()`: Validate user existence
  - `authenticateUser()`: Handle authentication logic
  - `addExperience()`: Manage experience and leveling
  - `completeActivity()`: Award experience for activities

#### 3. **SkillCardService.mo** - Skill Card Business Logic
- **Purpose**: Handles skill card-related business logic
- **Key Functions**:
  - `generateSkillCard()`: Orchestrate skill card generation
  - `completeSkill()`: Handle skill completion logic
  - `submitQuestAnswers()`: Process quiz submissions
  - `updateProgressAfterSkillCompletion()`: Update user progress

### Main Actor (`main.mo`)

The main actor orchestrates all operations and provides the public API:

#### API Endpoints

**User Management:**
- `authenticateUser()`: Authenticate with Internet Identity
- `getCurrentUser()`: Get current user profile
- `updateUserProfile()`: Update user information
- `getUserByUsername()`: Find user by username
- `userExists()`: Check if user exists

**Experience & Leveling:**
- `addExperience()`: Add experience points
- `getLevelInfo()`: Get level information
- `completeActivity()`: Complete activities for XP
- `getExpRequiredForLevel()`: Get XP requirements

**Skill Card System:**
- `generateSkillCard()`: Generate AI-powered skill cards
- `acceptSkillCard()`: Accept a skill card
- `declineSkillCard()`: Decline a skill card
- `getUserSkillCards()`: Get user's skill cards
- `completeSkill()`: Complete a skill
- `submitQuestAnswers()`: Submit quiz answers

**Admin & Testing:**
- `getAllUsers()`: Get all users (admin)
- `getAllSkillCards()`: Get all skill cards (admin)
- `testLeveling()`: Test leveling system
- `healthCheck()`: Health check endpoint

## Key Improvements

### 1. **Modular Architecture**
- Separated concerns into focused modules
- Clear separation between data, business logic, and storage
- Improved testability and maintainability

### 2. **Clean Code Principles**
- Removed all debug code and console logs
- Added comprehensive documentation for all functions
- Consistent naming conventions
- Single responsibility principle

### 3. **Error Handling**
- Consistent error handling patterns
- Clear error messages for users
- Proper Result types for all operations

### 4. **Data Persistence**
- Clean upgrade/downgrade handling
- Efficient Trie-based storage
- Proper data serialization/deserialization

### 5. **Security**
- Principal validation for all operations
- User authorization checks
- No auto-creation of users (explicit authentication required)

## Usage Examples

### Authenticating a User
```motoko
let authResult = await skillForge.authenticateUser({
    username = "john_doe";
    fullName = ?"John Doe";
    profilePicture = null;
});
```

### Generating a Skill Card
```motoko
let generation = await skillForge.generateSkillCard({
    prompt = "Learn React development";
    category = ?"Frontend";
    difficulty = ?"Intermediate";
});
```

### Completing a Skill
```motoko
let result = await skillForge.completeSkill(skillCardId, skillId);
```

## Development Guidelines

### Adding New Features
1. Define types in `Types.mo`
2. Add business logic to appropriate service module
3. Expose API endpoint in `main.mo`
4. Add comprehensive documentation

### Error Handling
- Use `Result<T, E>` types for all operations
- Provide clear, user-friendly error messages
- Log errors appropriately (without debug prints)

### Testing
- Use the test functions provided for validation
- Test edge cases and error conditions
- Verify data persistence across upgrades

## File Structure

```
src/skill-forge-backend/
├── main.mo                 # Main actor and API endpoints
├── Types.mo               # Data structure definitions
├── Auth.mo                # Authentication and user management
├── Level.mo               # Experience and leveling system
├── SkillCard.mo           # Skill card generation and management
├── modules/
│   ├── Storage.mo         # Data persistence layer
│   ├── UserService.mo     # User business logic
│   └── SkillCardService.mo # Skill card business logic
└── README.md              # This documentation
```

## Notes

- All debug code has been removed from production code
- Comprehensive documentation added to all functions
- Modular structure improves maintainability and testability
- Clean separation of concerns follows best practices
- Error handling is consistent throughout the application 