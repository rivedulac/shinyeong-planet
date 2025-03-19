import React, { useEffect, useState } from "react";
import { Camera } from "../core/Camera";
import { PlayerController } from "./PlayerController";
import CameraPositionDisplay from "../ui/informationDisplay/CameraPositionDisplay";
import LanguageSelector from "../ui/LanguageSelector";
import PlayerNameInput from "../ui/PlayerNameInput";
import PlayerNameDisplay from "../ui/PlayerNameDisplay";
import NameEditButton from "../ui/NameEditButton";
import NameEditModal from "../ui/NameEditModal";
import ConversationModal from "../ui/ConversationModal";
import { Scene } from "../core/Scene";
import useLocalStorage from "../hooks/useLocalStorage";
import { NpcManager } from "./npcs/NpcManager";
import { IConversation } from "./npcs/interfaces/IConversation";
import { getConversationForNpc } from "./npcs/interfaces/IConversation";
import { INpc } from "./npcs/interfaces/INpc";
import ControlsInfoDisplay from "../ui/informationDisplay/ControlsInfoDisplay";
import { Minimap } from "../ui/map";
import ToggleButton from "../ui/common/ToggleButton";
import * as THREE from "three";
import { CORNER_MARGIN } from "@/config/constants";
import VirtualPad from "@/ui/virtualControls/VirtualPad";
import MenuBar from "@/ui/menuBar/menuBar";

// Use a consistent key for the player name in localStorage
const PLAYER_NAME_KEY = "shinyeongPlanet.playerName";

const Game: React.FC = () => {
  const [cameraPosition, setCameraPosition] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  });

  // Use the localStorage hook for player name persistence
  const [playerName, setPlayerName] = useLocalStorage<string>(
    PLAYER_NAME_KEY,
    ""
  );

  // Game has started if player has entered a name
  const [gameStarted, setGameStarted] = useState<boolean>(!!playerName);
  // State for name editing modal
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // State for conversation
  const [currentConversation, setCurrentConversation] =
    useState<IConversation | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState<boolean>(false);

  // Create a state to store the player controller instance
  const [playerController, setPlayerController] =
    useState<PlayerController | null>(null);

  const [showControlsInfo, setShowControlsInfo] = useState<boolean>(false);

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [minimapVisible, setMinimapVisible] = useLocalStorage<boolean>(
    "shinyeongPlanet.minimapVisible",
    true
  );

  const [npcState, setNpcState] = useState<
    Array<{
      type: string;
      position: THREE.Vector3;
      id: string;
    }>
  >([]);

  // Handlers for virtual controls
  const handleVirtualControlStart = (key: string) => {
    playerController?.triggerKeyDown(key);
  };

  const handleVirtualControlEnd = (key: string) => {
    playerController?.triggerKeyUp(key);
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = (name: string) => {
    setPlayerName(name);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
  };

  // Function to start a conversation with an NPC
  const startConversation = (conversation: IConversation) => {
    setCurrentConversation(conversation);
    setIsConversationOpen(true);
  };

  // Function to end the current conversation
  const endConversation = () => {
    setIsConversationOpen(false);
    // Keep the conversation data for a moment before clearing it
    // This prevents UI flicker during the closing animation if we had one
    setTimeout(() => setCurrentConversation(null), 300);
  };

  const toggleControlsInfo = () => {
    setShowControlsInfo(!showControlsInfo);

    // If we're showing controls info, hide the settings
    if (!showControlsInfo && showSettings) {
      setShowSettings(false);
    }
  };

  const toggleMinimap = () => {
    setMinimapVisible(!minimapVisible);
  };

  // Toggle settings visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);

    // If we're showing settings, hide the controls info
    if (!showSettings && showControlsInfo) {
      setShowControlsInfo(false);
    }
  };

  useEffect(() => {
    // Only initialize the game after player has entered their name
    if (!gameStarted) return;

    // Set up scene
    const scene = new Scene();
    const camera = new Camera();

    // Initialize player controller with the camera
    const newPlayerController = new PlayerController(camera);
    setPlayerController(newPlayerController);

    // Create NPC manager and initialize NPCs
    const npcManager = new NpcManager(scene.getScene());
    npcManager.initializeDefaultNpcs();

    const allNpcs = npcManager.getAllNpcs();
    const npcsData = allNpcs.map((npc) => ({
      type: npc.getType(),
      position: npc.getMesh().position.clone(),
      id: npc.getId(),
    }));
    setNpcState(npcsData);

    // Set up conversation callbacks
    npcManager.setOnStartConversation((npc: INpc) => {
      // Get conversation data for this NPC
      const conversation = getConversationForNpc(npc);
      if (conversation) {
        startConversation(conversation);
      }
    });

    npcManager.setOnEndConversation(() => {
      endConversation();
    });

    // Pass the NPC manager to the player controller for optimized collision detection
    newPlayerController.setNpcManager(npcManager);

    // Initial camera position
    setCameraPosition(camera.getPerspectivePosition());

    scene.setup();

    // Animation loop
    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = lastTime === 0 ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      // Update player controller with deltaTime
      // This will now also check for collisions with nearby NPCs only
      newPlayerController.update(deltaTime);

      // Update NPCs
      npcManager.update(deltaTime);

      // Check for NPC interactions
      npcManager.checkInteractions(
        camera.getPerspectiveCamera().position.clone()
      );

      // Update camera position state on each frame
      setCameraPosition(camera.getPerspectivePosition());

      // Update npc states periodically (for minimap and any other UI that needs it)
      if (time % 100 < 16) {
        // Update roughly every 100ms
        const updatedNpcsData = allNpcs.map((npc) => ({
          type: npc.getType(),
          position: npc.getMesh().position.clone(),
          id: npc.getId(),
        }));
        setNpcState(updatedNpcsData);
      }

      animationId = requestAnimationFrame(animate);
      scene.render(camera.getPerspectiveCamera());
    };

    animationId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      camera.handleResize(window.innerWidth, window.innerHeight);
      scene.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      // Clean up player controller
      newPlayerController.dispose();
      setPlayerController(null);

      // Clean up NPCs
      npcManager.clear();

      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      // Dispose resources
      scene.destory();
    };
  }, [gameStarted]);

  // Show name input if game hasn't started yet
  if (!gameStarted) {
    return <PlayerNameInput onNameSubmit={handleNameSubmit} />;
  }

  // Otherwise show the game with player name displayed
  return (
    <>
      <MenuBar playerName={playerName || ""} />
      <div id="game-container" style={{ width: "100%", height: "100vh" }} />
      {/* Settings UI */}
      <ToggleButton
        isActive={showSettings}
        onToggle={toggleSettings}
        icon="⚙️"
        position={{ top: CORNER_MARGIN, right: CORNER_MARGIN }}
      />
      {playerName && showSettings && (
        <NameEditButton onClick={handleEditName} />
      )}
      {showSettings && <LanguageSelector />}
      {isEditingName && (
        <NameEditModal
          currentName={playerName || ""}
          onSave={handleSaveName}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Conversation Modal */}
      {currentConversation && (
        <ConversationModal
          conversation={currentConversation}
          isOpen={isConversationOpen}
          onClose={endConversation}
        />
      )}

      {/* Controls Info Display */}
      <ToggleButton
        isActive={showControlsInfo}
        onToggle={toggleControlsInfo}
        icon="ℹ️"
        position={{
          top: "calc(" + CORNER_MARGIN + " + 3.5rem)",
          right: CORNER_MARGIN,
        }}
      />
      {showControlsInfo && <ControlsInfoDisplay />}
      {showControlsInfo && (
        <CameraPositionDisplay perspective={cameraPosition} />
      )}
      {/* Minimap */}
      <ToggleButton
        isActive={!!minimapVisible}
        onToggle={toggleMinimap}
        icon="🗺️"
        position={{ bottom: CORNER_MARGIN, right: CORNER_MARGIN }}
      />
      {minimapVisible && playerController && (
        <Minimap
          playerPosition={playerController.getPosition()}
          playerLookDirection={playerController.getLookDirection()}
          npcs={npcState}
        />
      )}
      <VirtualPad
        onMoveStart={handleVirtualControlStart}
        onMoveEnd={handleVirtualControlEnd}
      />
    </>
  );
};

export default Game;
