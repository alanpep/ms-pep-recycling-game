# Recycling Game - AI Agent Instructions

## Project Overview
A simple, educational web-based recycling game designed to run on nginx. Players learn to distinguish between trash and recyclables through an interactive 10-round quiz game with audio feedback.

## Architecture & Tech Stack
- **Deployment**: Static web app served via nginx (no backend required)
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Assets**: Audio files for game start, correct answers, incorrect answers
- **Structure**: Single-page application with all game logic in client-side JS

## Game Flow
1. **Start**: Play intro sound on page load or start button click
2. **Gameplay Loop** (10 rounds):
   - Display image of an item (trash or recyclable)
   - Present two choices: Trash Bin or Recycling Bin
   - Player selects their answer
   - Play correct/incorrect sound based on choice
   - Track score
   - Advance to next item
3. **End Game**: Display final score (e.g., "7/10 correct!")

## File Structure
```
/
├── index.html          # Main game interface
├── css/
│   └── style.css      # Game styling (use frontend-design skill)
├── js/
│   └── game.js        # Game logic and state management
├── assets/
│   ├── images/        # Item images (trash/recyclables)
│   └── sounds/        # Audio files (start, correct, incorrect)
└── nginx.conf         # nginx configuration (if needed)
```

## Development Conventions

### Game State Management
- Use a simple JavaScript object to track:
  - Current round (1-10)
  - Score (correct answers)
  - Array of items to display (randomized at start)
  - Game state (not-started, playing, finished)

### Item Data Structure
Items should be stored as an array of objects with properties:
```javascript
{
  id: string,
  name: string,
  imagePath: string,
  isRecyclable: boolean
}
```

### Audio Handling
- Preload all audio files on page load
- Use Web Audio API or HTML5 `<audio>` elements
- Ensure sounds don't overlap inappropriately

### Visual Design
- **Use the `frontend-design` skill** for creating a distinctive, engaging UI
- Target audience: educational (suitable for all ages)
- Consider playful, colorful aesthetics that make learning fun
- Clear visual distinction between trash and recycling bins
- Responsive design for tablets and desktops

### Code Quality
- Keep JavaScript vanilla (no external dependencies if possible)
- Use ES6+ features (const/let, arrow functions, template literals)
- Add comments for game logic sections
- Ensure accessibility (keyboard navigation, ARIA labels)

## Critical Workflows

### Local Development
```powershell
# Serve locally with Python (if available)
python -m http.server 8000

# Or use VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### nginx Deployment
- Place all files in nginx web root (typically `/usr/share/nginx/html` or `/var/www/html`)
- Default nginx config should work for static files
- Ensure MIME types are correct for audio files (.mp3, .wav, .ogg)

## Integration Points

### Assets
- **Images**: Use free stock photos or create simple icons for recyclable items (bottles, cans, paper) and trash (food waste, plastic bags)
- **Sounds**: Source from free audio libraries (freesound.org, zapsplat.com) or generate simple tones
- Keep file sizes reasonable (<100KB per sound, <500KB per image)

### Browser Compatibility
- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use standard Web APIs (no polyfills needed)
- Test audio autoplay policies (may need user interaction first)

## Project-Specific Patterns

### Randomization
- Shuffle items array at game start (Fisher-Yates shuffle)
- Ensure balanced mix of trash/recyclables (suggest 50/50 split)

### Score Display
- Show running score during game: "Question 3/10 | Score: 2"
- End screen: "Game Over! You scored 8/10!" with visual feedback

### State Transitions
- Clear visual feedback for state changes (start → playing → finished)
- Disable buttons during sound playback if needed
- Reset functionality to replay without page refresh

## Getting Started for AI Agents
1. Create basic HTML structure with game container
2. Design the UI using `frontend-design` skill for distinctive aesthetics
3. Implement game logic in `game.js` with clear functions (startGame, checkAnswer, nextRound, endGame)
4. Add audio elements and handle playback
5. Create or source 10+ item images and categorize them
6. Test full game flow and scoring accuracy
7. Ensure responsive layout and accessibility

## Notes
- No external API calls required - fully self-contained
- Consider adding difficulty levels in future (trickier items to categorize)
- Potential expansion: timer per question, leaderboard (localStorage), multiplayer
