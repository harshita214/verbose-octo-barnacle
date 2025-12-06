# 🎃 HauntHub: The AI-Possessed Costume Generator Game

A spooky Halloween web game where users upload a selfie, summon a haunted AI spirit, and watch their UI transform into an escalating spooky experience. Each costume triggers a different interactive mini-game.

## 🕸️ Features

- **Spirit Summoning**: Choose from 4 haunted entities (Phantom, Nosferatu, Enchantress, Jack O'Malice)
- **UI Possession**: Watch the interface glitch and corrupt as the spirit takes over
- **AI Costume Generation**: Transform your photo into a spooky character
- **Mini-Games**: Play themed puzzles (Ghost Chase, Pumpkin Cipher, Witch's Brew)
- **Shareable Costumes**: Download and share your cursed transformation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Testing**: Vitest (frontend), Jest (backend), fast-check (property-based)
- **Styling**: CSS with spooky animations and glitch effects

## 📁 Project Structure

```
haunthub/
├── src/
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── spirits/        # Spirit-specific UI components
│   │   │   ├── glitch/         # Glitch effect components
│   │   │   └── games/          # Mini-game components
│   │   ├── hooks/              # React hooks for game state
│   │   ├── styles/             # Spooky CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── backend/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── models/             # Data models
│   │   └── server.ts
│   ├── games/                  # Mini-game implementations
│   └── assets/
│       ├── sounds/             # Ambient audio
│       └── cursors/            # Spooky cursors
├── package.json
├── tsconfig.json
├── vite.config.ts
├── jest.config.js
└── vitest.config.ts
```

## 🚀 Getting Started

### Installation

```bash
cd haunthub
npm install
```

### Development

```bash
# Run frontend and backend concurrently
npm run dev

# Or run separately
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3000
```

### Testing

```bash
# Run all tests
npm run test:all

# Frontend tests only
npm run test

# Backend tests only
npm run test:backend
```

### Build

```bash
npm run build
npm run preview
```

## 📋 Implementation Status

### Phase 1: Project Setup & Core Infrastructure ✅
- [x] Initialize project structure and dependencies
- [x] Set up curse template loader and spirit configuration
- [x] Create backend API structure and middleware

### Phase 2: Image Upload & Validation ✅
- [x] Implement image upload endpoint and validation
- [x] Create frontend upload component (UploadSpirit)

### Phase 3: Spirit Selection & Session Management ✅
- [x] Implement spirit selection and session initialization
- [x] Create spirit selection UI and state management

### Phase 4: Possession Effects & UI Glitching ✅
- [x] Implement glitch effect system (GlitchEffect component)
- [x] Implement PossessHUD component with animations
- [x] Implement ambient sound system

### Phase 5: Costume Generation ✅
- [x] Set up image transformation service
- [x] Create costume generation endpoint
- [x] Create CostumeDisplay component

### Phase 6: Mini-Games Implementation ✅
- [x] Implement Ghost Chase mini-game
- [x] Implement Pumpkin Cipher mini-game
- [x] Implement Witch's Brew mini-game
- [x] Create MiniGameContainer component

### Phase 7: Sharing & Metadata ✅
- [x] Implement costume sharing endpoint
- [x] Implement costume download functionality
- [x] Create ShareCostume component

### Phase 8: Error Handling & Fallbacks ✅
- [x] Implement comprehensive error handling
- [x] Implement frontend error boundaries

### Phase 9: Integration & Full Flow Testing ✅
- [x] Create end-to-end game flow

### Phase 10: Accessibility & Polish ✅
- [x] Implement accessibility features
- [x] Optimize performance

## 🎨 Spooky Style Guide

All code follows spooky naming conventions:

- **Spirits & Entities**: `haunt_*`, `spectral_*`, `curse_*`
- **UI Components**: `glitch_*`, `possess_*`, `phantom_*`
- **Game Logic**: `game_*`, `mini_*`, `spell_*`
- **Backend Endpoints**: `/api/haunt/*`, `/api/curse/*`, `/api/summon/*`

See `.kiro/steering/spooky-style.md` for full guidelines.

## 📚 Documentation

- **Requirements**: `.kiro/specs/haunthub/requirements.md`
- **Design**: `.kiro/specs/haunthub/design.md`
- **Tasks**: `.kiro/specs/haunthub/tasks.md`
- **Curse Templates**: `.kiro/specs/haunthub/curses.json`
- **Style Guide**: `.kiro/steering/spooky-style.md`

## 👻 Spirits

1. **Phantom** (Ghost) - Mournful spirit with spectral glow
2. **Nosferatu** (Vampire) - Ancient bloodsucker with hypnotic powers
3. **Enchantress** (Witch) - Mystical sorceress brewing dark magic
4. **Jack O'Malice** (Pumpkin Demon) - Mischievous harvest realm demon

## 🎮 Mini-Games

- **Ghost Chase**: Avoid the phantom for 10 seconds
- **Pumpkin Cipher**: Drag runes to match the sequence (15 seconds)
- **Witch's Brew**: Mix the right 3 ingredients (20 seconds)

## 📝 License

MIT

---

**Built with Kiro for the Kiroween Hackathon 🎃👻**
