import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "../core/Camera";
import { PlayerController } from "./PlayerController";
import CameraPositionDisplay from "../ui/CameraPositionDisplay";
import LanguageSelector from "../ui/LanguageSelector";
import PlayerNameInput from "../ui/PlayerNameInput";
import PlayerNameDisplay from "../ui/PlayerNameDisplay";
import NameEditButton from "../ui/NameEditButton";
import NameEditModal from "../ui/NameEditModal";
import ConversationModal from "../ui/ConversationModal";
import {
  VirtualControlsToggle,
  VirtualMoveControls,
  VirtualRotationControls,
} from "../ui/virtualControls";
import { Scene } from "../core/Scene";
import useLocalStorage from "../hooks/useLocalStorage";
import { useMobileDetect } from "../hooks/useMobileDetect";
import { NpcManager } from "./npcs/NpcManager";
import { IConversation } from "./npcs/IConversation";
import { getConversationForNpc } from "./npcs/IConversation";
import { INpc } from "./npcs/INpc";

// Use a consistent key for the player name in localStorage
const PLAYER_NAME_KEY = "shinyeongPlanet.playerName";
const VIRTUAL_CONTROLS_KEY = "shinyeongPlanet.virtualControlsEnabled";

const Game: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMobileDetect();
  const [cameraPosition, setCameraPosition] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  });

  // Simple toggle state for virtual controls - default to true on mobile
  const [virtualControlsEnabled, setVirtualControlsEnabled] =
    useLocalStorage<boolean>(
      VIRTUAL_CONTROLS_KEY,
      isMobile // Default to true on mobile devices
    );

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

  // Handlers for virtual controls
  const handleVirtualMoveStart = (key: string) => {
    playerController?.triggerKeyDown(key);
  };

  const handleVirtualMoveEnd = (key: string) => {
    playerController?.triggerKeyUp(key);
  };

  // Handlers for virtual rotation controls
  const handleVirtualRotateStart = (key: string) => {
    playerController?.triggerKeyDown(key.toLowerCase());
  };

  const handleVirtualRotateEnd = (key: string) => {
    playerController?.triggerKeyUp(key.toLowerCase());
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

  // Toggle virtual controls
  const toggleVirtualControls = () => {
    setVirtualControlsEnabled(!virtualControlsEnabled);
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
      <div id="game-container" style={{ width: "100%", height: "100vh" }} />
      <CameraPositionDisplay perspective={cameraPosition} />
      <LanguageSelector />
      <VirtualControlsToggle
        isEnabled={virtualControlsEnabled ?? false}
        onToggle={toggleVirtualControls}
      />
      {playerName && <PlayerNameDisplay name={playerName} />}
      {playerName && <NameEditButton onClick={handleEditName} />}
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

      {/* Show virtual controls if enabled */}
      {virtualControlsEnabled && (
        <>
          <VirtualMoveControls
            onMoveStart={handleVirtualMoveStart}
            onMoveEnd={handleVirtualMoveEnd}
          />
          <VirtualRotationControls
            onRotateStart={handleVirtualRotateStart}
            onRotateEnd={handleVirtualRotateEnd}
          />
        </>
      )}

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
          zIndex: 1000,
        }}
      >
        {t("controls.title")}
        <div>{t("controls.moveForward")}</div>
        <div>{t("controls.moveBackward")}</div>
        <div>{t("controls.strafeLeft")}</div>
        <div>{t("controls.strafeRight")}</div>
        <div>{t("controls.rotateLeft")}</div>
        <div>{t("controls.rotateRight")}</div>
        <div>{t("controls.lookUp")}</div>
        <div>{t("controls.lookDown")}</div>
        <div>{t("controls.zoomIn")}</div>
        <div>{t("controls.zoomOut")}</div>
      </div>
    </>
  );
};

export default Game;
