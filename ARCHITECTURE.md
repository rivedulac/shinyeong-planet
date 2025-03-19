# Shinyeong Planet - Architecture Documentation

## Overview

Shinyeong Planet is a 3D exploration game built with React, Three.js, and TypeScript. The game allows players to explore a planet, interact with various NPCs (non-player characters), and provides multilingual support.

## Core Technology Stack

- **React**: Frontend UI framework
- **Three.js**: 3D rendering engine
- **TypeScript**: Strongly-typed JavaScript
- **i18next**: Internationalization framework
- **Vite**: Build tool and development server
- **Vitest**: Testing framework

## Project Structure

The project follows a modular architecture with clear separation of concerns:

```
src/
├── core/           # Core 3D engine components
├── game/           # Game-specific logic and entities
│   └── npcs/       # Non-player character implementations
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization resources
├── ui/             # User interface components
│   ├── common/     # Reusable UI components
│   ├── informationDisplay/ # Information display components
│   ├── map/        # Map-related components
│   ├── menuBar/    # Menu bar components
│   └── virtualControls/ # Virtual control components for touch devices
├── utils/          # Utility functions and helpers
├── config/         # Game configuration and constants
└── services/       # Service modules for external communications
```

## Core Architecture Components

### 1. Core 3D Engine

- **Camera.ts**: Manages the player's viewport, including perspective, movement, and orientation
- **Scene.ts**: Manages the 3D scene, including rendering, lighting, and background

### 2. Game Logic

- **Game.tsx**: Main game component that coordinates all game elements
- **PlayerController.ts**: Handles player input and movement
- **NpcManager.ts**: Manages all NPCs in the game world

### 3. Non-Player Characters (NPCs)

The game uses an extensible NPC system with several implementations:

- **INpc**: Base interface for all NPC types
- **Billboard**: Represents information displays
- **Flag**: Represents country flags and experiences
- **Person**: Represents human characters
- **StaticModel**: Represents 3D models loaded from files

### 4. User Interface

The UI is organized into several modules:

- **Menu system**: Top menu bar with dropdowns for settings and information
- **Information displays**: Camera position, controls info, etc.
- **Map system**: Minimap showing locations and NPCs
- **Dialog system**: Conversation modals for interacting with NPCs
- **Virtual controls**: Touch-based controls for mobile devices

### 5. Internationalization (i18n)

The game supports multiple languages managed through the i18next framework:

- English, Korean, French, German, Japanese, Simplified Chinese, Traditional Chinese
- Translations are organized by language in JSON files
- Language detection and selection UI

### 6. State Management

The game uses several state management approaches:

- React's useState and useEffect for UI state
- Custom hooks (useLocalStorage) for persistent data
- Component-based state for isolated functionality
- Props for parent-child communication

### 7. External Services

- **GeminiService**: Integration with Google's Gemini AI for dynamic conversations

## Data Flow

1. **Input Handling**:

   - Player inputs (keyboard, touch) → PlayerController → Camera movement
   - Virtual controls → PlayerController → Camera movement

2. **Game Loop**:

   - Updates player position and camera perspective
   - Checks for NPC interactions
   - Updates the scene and renders new frames

3. **Interaction Flow**:

   - Player approaches NPC → NpcManager detects proximity
   - NpcManager triggers conversation → ConversationModal displays
   - Player interacts with conversation UI → AI responses via GeminiService

4. **UI Updates**:
   - Camera movements → Position state updates → UI displays updated information
   - Language changes → i18n context updates → UI text changes

## Rendering Pipeline

1. **Scene Setup**:

   - Planet creation
   - Lighting setup
   - Background starfield generation

2. **Frame Rendering**:
   - Player movement is applied
   - NPCs are updated
   - Collisions are checked
   - Scene is rendered to the canvas

## Testing Architecture

Tests are organized by module and utilize Vitest with React Testing Library:

- Component tests for UI elements
- Unit tests for core functionality
- Mock implementations for external dependencies

## Deployment

The application is configured for deployment to Vercel with specific routes and environment variable management.
