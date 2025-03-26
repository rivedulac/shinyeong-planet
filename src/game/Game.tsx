import React, { useEffect, useState } from "react";
import { Camera } from "../core/Camera";
import { PlayerController } from "./PlayerController";
import CameraPositionDisplay from "../ui/informationDisplay/CameraPositionDisplay";
import PlayerNameInput from "../ui/PlayerNameInput";
import NameEditModal from "../ui/NameEditModal";
import ConversationModal from "../ui/conversation/ConversationModal";
import { Scene } from "../core/Scene";
import useLocalStorage from "../hooks/useLocalStorage";
import { NpcManager } from "./npcs/NpcManager";
import { getConversationForNpc } from "./npcs/interfaces/IConversation";
import ControlsInfoDisplay from "../ui/informationDisplay/ControlsInfoDisplay";
import { Minimap } from "../ui/map";
import ToggleButton from "../ui/common/ToggleButton";
import * as THREE from "three";
import { CORNER_MARGIN } from "@/config/constants";
import VirtualPad from "@/ui/virtualControls/VirtualPad";
import MenuBar from "@/ui/menuBar/MenuBar";
import { useTranslation } from "react-i18next";
import { useGameConversation } from "../hooks/useGameConversation";
import { useGameUiState } from "../hooks/useGameUiState";
import { StaticModel } from "./npcs/StaticModel";

// Use a consistent key for the player name in localStorage
const PLAYER_NAME_KEY = "shinyeongPlanet.playerName";

const Game: React.FC = () => {
  const { i18n } = useTranslation();

  // Use our custom hooks for more organized state management
  const {
    currentConversation,
    isConversationOpen,
    startConversation,
    endConversation,
  } = useGameConversation();

  const {
    showControlsInfo,
    showCameraInfo,
    minimapVisible,
    isEditingName,
    toggleControlsInfo,
    toggleCameraInfo,
    toggleMinimap,
    setEditingName,
  } = useGameUiState();

  // Player state with localStorage integration
  const [playerName, setPlayerName] = useLocalStorage<string>(
    PLAYER_NAME_KEY,
    ""
  );
  const [gameStarted, setGameStarted] = useState<boolean>(!!playerName);

  // Game state
  const [playerController, setPlayerController] =
    useState<PlayerController | null>(null);
  const [npcState, setNpcState] = useState<
    Array<{
      position: THREE.Vector3;
      id: string;
    }>
  >([]);
  const [cameraPosition, setCameraPosition] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  });

  // Handlers for virtual controls
  const handleVirtualControlPressed = (movement: string) => {
    playerController?.triggerMovement(movement, true);
  };

  const handleVirtualControlReleased = (movement: string) => {
    playerController?.triggerMovement(movement, false);
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  const handleEditName = () => {
    setEditingName(true);
  };

  const handleSaveName = (name: string) => {
    setPlayerName(name);
    setEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditingName(false);
  };

  useEffect(() => {
    // Only initialize the game after player has entered their name
    if (!gameStarted) return;

    // Set up scene
    const scene = new Scene();
    const camera = new Camera();

    // Update background color
    scene.setUpdateBackgroundInterval();

    // Initialize player controller with the camera
    const newPlayerController = new PlayerController(camera);
    setPlayerController(newPlayerController);

    // Create NPC manager and initialize NPCs
    const npcManager = new NpcManager(scene.getScene());
    npcManager.initializeDefaultNpcs();

    const allNpcs = npcManager.getAllNpcs();
    const npcsData = allNpcs.map((npc) => ({
      position: npc.getMesh().position.clone(),
      id: npc.getId(),
    }));
    setNpcState(npcsData);

    // Set up conversation callbacks
    npcManager.setOnStartConversation((npc: StaticModel) => {
      // Only start conversation if it's enabled for this NPC
      if (npc.getConversationEnabled()) {
        // Get conversation data for this NPC
        const conversation = getConversationForNpc(npc);
        if (conversation) {
          startConversation(conversation);
        }
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
      newPlayerController.update(deltaTime);

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
      scene.destroy();
    };
  }, [gameStarted, startConversation, endConversation]);

  // Show name input if game hasn't started yet
  if (!gameStarted) {
    return <PlayerNameInput onNameSubmit={handleNameSubmit} />;
  }

  // Otherwise show the game with player name displayed
  return (
    <>
      <MenuBar
        playerName={playerName || ""}
        onEditName={handleEditName}
        onToggleControls={toggleControlsInfo}
        onToggleCamera={toggleCameraInfo}
        onChangeLanguage={i18n.changeLanguage}
        onToggleMinimap={toggleMinimap}
        currentLanguage={i18n.language}
      />
      <div id="game-container" style={{ width: "100%", height: "100vh" }} />

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

      {showControlsInfo && <ControlsInfoDisplay />}
      {showCameraInfo && <CameraPositionDisplay perspective={cameraPosition} />}

      {/* Minimap Toggle Button */}
      <ToggleButton
        isActive={!!minimapVisible}
        onToggle={toggleMinimap}
        icon="🗺️"
        position={{ bottom: CORNER_MARGIN, right: CORNER_MARGIN }}
      />

      {/* Minimap */}
      {minimapVisible && playerController && (
        <Minimap
          playerPosition={playerController.getPosition()}
          playerLookDirection={playerController.getLookDirection()}
          npcs={npcState}
        />
      )}

      <VirtualPad
        onMoveStart={handleVirtualControlPressed}
        onMoveEnd={handleVirtualControlReleased}
      />
    </>
  );
};

export default Game;
