# HauntHub Quick Start Guide

Get HauntHub running in 5 minutes! 🎃👻

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- A modern web browser

## Installation & Setup

### 1. Install Dependencies
```bash
cd haunthub
npm install
```

### 2. Start Development Servers

**Option A: Run both frontend and backend together**
```bash
npm run dev
```

**Option B: Run separately in different terminals**
```bash
# Terminal 1: Frontend (http://localhost:5173)
npm run dev:frontend

# Terminal 2: Backend (http://localhost:3000)
npm run dev:backend
```

### 3. Open in Browser
Navigate to `http://localhost:5173` and start playing!

---

## 🎮 How to Play

### Step 1: Upload Your Selfie
- Click the upload area or drag & drop an image
- Supported formats: JPG, PNG, WebP (max 10MB)

### Step 2: Select a Spirit
- Choose from 4 haunted entities:
  - 👻 **Phantom** (Ghost)
  - 🧛 **Nosferatu** (Vampire)
  - 🧙 **Enchantress** (Witch)
  - 🎃 **Jack O'Malice** (Pumpkin Demon)

### Step 3: Watch the Possession
- The UI will glitch and transform
- Ambient sounds play based on your spirit
- 3-second possession animation

### Step 4: View Your Costume
- See your AI-generated spooky transformation
- View spirit details and mini-game info

### Step 5: Play the Mini-Game
- **Ghost Chase**: Avoid ghosts for 10 seconds
- **Pumpkin Cipher**: Match the rune sequence (15 seconds)
- **Witch's Brew**: Select ingredients in order (20 seconds)

### Step 6: Share Your Costume
- Download as PNG or JPG
- Share on Twitter, Facebook, or Instagram
- Copy shareable link

---

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Run frontend + backend
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only

# Testing
npm run test            # Frontend tests
npm run test:backend    # Backend tests
npm run test:all        # All tests

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Linting
npm run lint            # Check code quality
npm run format          # Format code with Prettier
```

---

## ♿ Accessibility Features

### Calm Mode
- Click the ♿ button in the bottom-right corner
- Toggle "Calm Mode" to reduce glitch effects
- Perfect for users sensitive to animations

### Keyboard Navigation
- `Tab` - Navigate between elements
- `Enter` - Activate buttons
- `Space` - Toggle checkboxes
- `Esc` - Close menus

### Screen Reader Support
- All interactive elements have ARIA labels
- Semantic HTML structure
- Compatible with popular screen readers

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port for frontend
npm run dev:frontend -- --port 5174

# Change port for backend
PORT=3001 npm run dev:backend
```

### Image Upload Fails
- Check file size (max 10MB)
- Verify file format (JPG, PNG, WebP)
- Clear browser cache and try again

### Mini-Game Not Loading
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

### Audio Not Playing
- Check browser volume settings
- Verify audio permissions are granted
- Try a different browser

---

## 📁 Project Structure

```
haunthub/
├── src/
│   ├── frontend/          # React components & styles
│   ├── backend/           # Express API routes & services
│   └── assets/            # Images, sounds, etc.
├── .kiro/
│   ├── specs/             # Project specifications
│   └── steering/          # Style guides
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Full documentation
```

---

## 🎨 Customization

### Add a New Spirit

1. Edit `.kiro/specs/haunthub/curses.json`:
```json
{
  "id": "werewolf",
  "name": "Werewolf",
  "description": "A fierce beast of the night",
  "color_theme": "#8b4513",
  "glitch_intensity": 0.9,
  "costume_style": "werewolf_fur",
  "mini_game": "ghost_chase",
  "ambient_sound": "howl",
  "transformations": ["fur", "claws", "fangs"]
}
```

2. The spirit will automatically appear in the spirit selection UI!

### Change Colors

Edit `src/frontend/styles/App.css`:
```css
:root {
  --color-neon-green: #00ff41;    /* Change this */
  --color-blood-red: #ff0033;     /* Or this */
  --color-deep-purple: #1a1a2e;   /* Or this */
}
```

### Add New Mini-Game

1. Create `src/frontend/components/games/MyGame.tsx`
2. Export component with `onComplete` callback
3. Add to `MiniGameContainer.tsx` routing logic

---

## 📚 Documentation

- **Full README**: `README.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Performance Guide**: `PERFORMANCE.md`
- **Requirements**: `.kiro/specs/haunthub/requirements.md`
- **Design**: `.kiro/specs/haunthub/design.md`
- **Style Guide**: `.kiro/steering/spooky-style.md`

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Frontend (Vite)
```bash
# Build creates dist/ folder
npm run build

# Deploy dist/ to your hosting service
# (Vercel, Netlify, GitHub Pages, etc.)
```

### Deploy Backend (Express)
```bash
# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start server
npm run dev:backend
```

---

## 🎯 Next Steps

1. **Explore the code**: Check out `src/frontend/App.tsx` for the main game flow
2. **Customize spirits**: Edit `curses.json` to add your own spirits
3. **Add features**: Create new mini-games or costume effects
4. **Deploy**: Share your HauntHub instance with friends!

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full documentation in `README.md`
3. Check browser console for error messages
4. Review `.kiro/specs/haunthub/requirements.md` for feature details

---

## 🎉 Have Fun!

You're all set! Start summoning spirits and creating spooky costumes! 👻

**Built with Kiro for the Kiroween Hackathon 🎃**
