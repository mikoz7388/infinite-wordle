# Infinite Wordle

An infinitely replayable Wordle game built with TypeScript and Vite. Guess five-letter words with colorful feedback after each attempt.

## 🌐 Live Version

Check out the live version of Infinite Wordle here: [Play Now](https://infinite-wordle-kappa.vercel.app/)

## 🎮 Features

- **Unlimited Games**: Unlike the original Wordle, you can play as many games as you want
- **Intuitive Interface**: Clean, responsive design that works on mobile and desktop
- **Visual Feedback**: Color-coded tiles and keyboard show your progress
- **Animations**: Smooth animations for typing, flipping tiles, and game actions
- **Game State Persistence**: Your progress is saved in local storage
- **Accessibility**: Keyboard and mouse controls

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/mikoz7388/infinite-wordle.git
   cd infinite-wordle
   ```
2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server
   ```bash
    npm run dev
    # or
    yarn dev
   ```
4. Open your browser and navigate to `http://localhost:5173`
5. Start playing!

### 🧱 Project Structure

The project follows the Model-View-Controller (MVC) architecture:

```plaintext
src/
├── controllers/     # Controllers connect models and views
├── models/          # Game state and business logic
├── services/        # Helper services (storage)
├── utils/           # Utilities like event emitter
├── views/           # UI components
├── constants.ts     # Game constants
├── main.ts          # Entry point
├── style.css        # Global styles
├── types.ts         # TypeScript definitions
└── words.ts         # Word database
```

🙏 Acknowledgements

- Original Wordle game by Josh Wardle
- The open-source community for inspiration and tools
