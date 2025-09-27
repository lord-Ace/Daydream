Sacrifice Keys: Maze Challenge - Project Documentation

Overview

Sacrifice Keys: Maze Challenge is a JavaScript-based browser game that combines maze navigation with strategic key sacrifices. Players must navigate through procedurally generated mazes while making difficult choices about which keyboard keys to permanently sacrifice in exchange for temporary special abilities.

Game Concept

The game embodies the theme "sacrifices must be made" by forcing players to trade essential controls for power-ups. Each sacrificed key makes navigation more challenging but provides advantages needed to progress through increasingly difficult levels.

Core Gameplay

Objective

Navigate through randomly generated mazes to reach the exit while collecting points and avoiding enemies. Progress through multiple levels with increasingly complex mazes.

Controls

· Arrow Keys: Move the player character (up, down, left, right)
· Spacebar: Teleport (when ability is active)
· Mouse: Click on sacrifice options to trade keys for abilities

Game Elements

· Player: Red circular character that navigates the maze
· Walls: Impassable barriers that form the maze structure
· Exit: Golden square that advances the player to the next level
· Points: Yellow collectibles that increase score
· Enemies: Red creatures that patrol the maze and reduce lives on contact

Key Sacrifice System

How to Sacrifice

1. During gameplay, click on any of the six sacrifice options in the right panel
2. Each option corresponds to a specific keyboard key and ability
3. Once sacrificed, the key becomes permanently unavailable
4. The player gains a temporary special ability (15 seconds)

Available Sacrifices

Key Ability Effect
↑ Speed Boost Increases player movement speed
↓ Shield Protects from one enemy hit
← Magnet Attracts points toward player
→ X-Ray Vision See through walls (visual effect)
Space Teleport Instantly move to random location
Shift Freeze Enemies Stops enemy movement temporarily

Strategic Considerations

· Early sacrifices make later levels harder to navigate
· Some abilities are more valuable than others depending on play style
· The game becomes progressively challenging as keys are sacrificed

Game Progression

Level System

· Each level features a larger, more complex maze
· New enemies are added with each level
· Point values increase with level difficulty
· Reaching the exit advances to the next level

Scoring

· Points: 10 points per collectible (doubled with active ability)
· Level Completion: 100 points bonus per level
· High Score: Persistent best score tracking

Lives System

· Start with 3 lives
· Lose a life when touching an enemy without shield
· Game over when all lives are lost

Technical Implementation

Maze Generation

The game uses a Depth-First Search (DFS) algorithm to generate random mazes:

```javascript
// Algorithm Overview:
1. Initialize grid with all walls
2. Start from a random cell (ensuring odd coordinates)
3. Use stack-based DFS to carve paths
4. Remove walls between current cell and chosen neighbor
5. Backtrack when no unvisited neighbors remain
6. Place exit in bottom-right corner
```

Game Architecture

· Canvas-based rendering for smooth graphics
· Modular design with separate functions for game logic, rendering, and input
· Event-driven architecture for player interactions
· Time-based abilities with JavaScript setTimeout

Key Components

· Game Loop: Continuous update and render cycle
· Collision Detection: Pixel-perfect checking for maze navigation
· State Management: Tracking game status, abilities, and sacrifices
· UI Synchronization: Real-time updates of game statistics

User Interface

Game Sections

1. Player Status Panel (Left)
   · Score, level, lives, and sacrifices counters
   · Active abilities display with visual indicators
2. Sacrifice Options Panel (Right)
   · Six clickable key sacrifice options
   · Visual feedback for sacrificed keys
   · Keyboard visualization showing available keys
3. Game Canvas (Center)
   · Main gameplay area with maze, player, and elements
   · Mini-map in bottom-right corner for navigation
4. Control Buttons
   · Start Game: Begins new game session
   · Reset Game: Returns to initial state

Game Logic Flow

```
Initialize Game
  ↓
Generate Maze (Level 1)
  ↓
Game Loop Starts
  ↓
Player Input Processing
  ↓
Update Game State
  - Move player
  - Update enemies
  - Check collisions
  - Update abilities
  ↓
Render Frame
  - Draw maze
  - Draw game elements
  - Update UI
  ↓
Check Level Completion
  - Yes → Generate Next Level
  - No → Continue Game Loop
  ↓
Check Game Over
  - Yes → Display Score
  - No → Continue Game Loop
```

Abilities System

Implementation

Each ability is implemented as a boolean flag in the activeAbilities object:

```javascript
activeAbilities = {
    speed: false,
    shield: false,
    magnet: false,
    vision: false,
    teleport: false,
    freeze: false
}
```

Ability Effects

· Speed: Increases player movement multiplier
· Shield: Prevents one life loss from enemies
· Magnet: Modifies point movement toward player
· Vision: Visual effect (could be enhanced)
· Teleport: Random relocation within maze
· Freeze: Stops enemy movement updates

Enemy AI

Enemies use simple patrol behavior:

· Move in random directions
· Change direction when hitting walls
· Move at slower pace than player
· Collide with player to cause damage

Future Enhancement Ideas

Gameplay Expansions

· Multiple character classes with unique abilities
· Boss enemies with special patterns
· Power-up items scattered in maze
· Time attack mode with countdown

Technical Improvements

· Local storage for high scores
· Sound effects and background music
· Animated transitions between levels
· Mobile touch controls support

Advanced Features

· Multiplayer cooperative mode
· Maze editor for custom levels
· Achievement system
· Difficulty settings

Browser Compatibility

· Compatible with all modern browsers supporting HTML5 Canvas
· Responsive design adapts to different screen sizes
· No external dependencies - pure JavaScript implementation

Conclusion

Sacrifice Keys: Maze Challenge successfully implements the "sacrifices must be made" theme through its core mechanic of trading controls for power. The game offers increasing challenge through procedural content generation while maintaining strategic depth through its sacrifice system. The clean code structure allows for easy expansion and modification, making it an excellent foundation for further development.