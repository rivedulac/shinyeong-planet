import { describe, it, expect } from "vitest";
import {
  gameReducer,
  initialGameState,
  GameState,
  GameAction,
} from "../GameReducer";
import * as THREE from "three";
import { IConversation } from "../npcs/interfaces/IConversation";

describe("gameReducer", () => {
  it("should return the initial state", () => {
    const result = gameReducer(initialGameState, {} as GameAction);
    expect(result).toEqual(initialGameState);
  });

  it("should handle SET_PLAYER_NAME", () => {
    const action: GameAction = {
      type: "SET_PLAYER_NAME",
      payload: "Test Player",
    };

    const result = gameReducer(initialGameState, action);

    expect(result.playerName).toBe("Test Player");
  });

  it("should handle START_GAME", () => {
    const action: GameAction = {
      type: "START_GAME",
    };

    const result = gameReducer(initialGameState, action);

    expect(result.gameStarted).toBe(true);
  });

  it("should handle EDIT_NAME", () => {
    const action: GameAction = {
      type: "EDIT_NAME",
      payload: true,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.isEditingName).toBe(true);
  });

  it("should handle TOGGLE_CONTROLS_INFO", () => {
    // From false to true
    const result1 = gameReducer(initialGameState, {
      type: "TOGGLE_CONTROLS_INFO",
    });
    expect(result1.showControlsInfo).toBe(true);

    // From true to false
    const result2 = gameReducer(
      { ...initialGameState, showControlsInfo: true },
      { type: "TOGGLE_CONTROLS_INFO" }
    );
    expect(result2.showControlsInfo).toBe(false);
  });

  it("should handle TOGGLE_CAMERA_INFO", () => {
    // From false to true
    const result1 = gameReducer(initialGameState, {
      type: "TOGGLE_CAMERA_INFO",
    });
    expect(result1.showCameraInfo).toBe(true);

    // From true to false
    const result2 = gameReducer(
      { ...initialGameState, showCameraInfo: true },
      { type: "TOGGLE_CAMERA_INFO" }
    );
    expect(result2.showCameraInfo).toBe(false);
  });

  it("should handle TOGGLE_MINIMAP", () => {
    // From true (default) to false
    const result1 = gameReducer(initialGameState, { type: "TOGGLE_MINIMAP" });
    expect(result1.minimapVisible).toBe(false);

    // From false to true
    const result2 = gameReducer(
      { ...initialGameState, minimapVisible: false },
      { type: "TOGGLE_MINIMAP" }
    );
    expect(result2.minimapVisible).toBe(true);
  });

  it("should handle SET_MINIMAP_VISIBILITY", () => {
    const action: GameAction = {
      type: "SET_MINIMAP_VISIBILITY",
      payload: false,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.minimapVisible).toBe(false);
  });

  it("should handle START_CONVERSATION", () => {
    const mockConversation: IConversation = {
      title: "Test Conversation",
      messages: ["Hello", "World"],
      icon: "🧪",
    };

    const action: GameAction = {
      type: "START_CONVERSATION",
      payload: mockConversation,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.currentConversation).toBe(mockConversation);
    expect(result.isConversationOpen).toBe(true);
  });

  it("should handle END_CONVERSATION", () => {
    // Set up initial state with an open conversation
    const stateWithConversation: GameState = {
      ...initialGameState,
      currentConversation: {
        title: "Test Conversation",
        messages: ["Hello", "World"],
        icon: "🧪",
      },
      isConversationOpen: true,
    };

    const result = gameReducer(stateWithConversation, {
      type: "END_CONVERSATION",
    });

    // Conversation should be closed but content still present
    expect(result.isConversationOpen).toBe(false);
    expect(result.currentConversation).not.toBeNull();
  });

  it("should handle SET_PLAYER_CONTROLLER", () => {
    // Create a mock player controller (partial since we can't easily instantiate a real one)
    const mockController = {
      dispose: () => {},
      update: () => {},
      getPosition: () => new THREE.Vector3(),
      getLookDirection: () => new THREE.Vector3(),
    } as any;

    const action: GameAction = {
      type: "SET_PLAYER_CONTROLLER",
      payload: mockController,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.playerController).toBe(mockController);
  });

  it("should handle UPDATE_NPC_STATE", () => {
    const mockNpcState = [
      {
        id: "npc1",
        type: "Flag",
        position: new THREE.Vector3(1, 2, 3),
      },
      {
        id: "npc2",
        type: "Person",
        position: new THREE.Vector3(4, 5, 6),
      },
    ];

    const action: GameAction = {
      type: "UPDATE_NPC_STATE",
      payload: mockNpcState,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.npcState).toBe(mockNpcState);
    expect(result.npcState.length).toBe(2);
  });

  it("should handle UPDATE_CAMERA_POSITION", () => {
    const mockCameraPosition = {
      position: { x: 10, y: 20, z: 30 },
      rotation: { pitch: 0.1, yaw: 0.2, roll: 0.3 },
    };

    const action: GameAction = {
      type: "UPDATE_CAMERA_POSITION",
      payload: mockCameraPosition,
    };

    const result = gameReducer(initialGameState, action);

    expect(result.cameraPosition).toBe(mockCameraPosition);
    expect(result.cameraPosition.position.x).toBe(10);
    expect(result.cameraPosition.rotation.yaw).toBe(0.2);
  });

  it("should hide camera info when showing controls info", () => {
    // Set up state with camera info visible
    const stateWithCameraInfo: GameState = {
      ...initialGameState,
      showCameraInfo: true,
    };

    // Toggle controls info on
    const result = gameReducer(stateWithCameraInfo, {
      type: "TOGGLE_CONTROLS_INFO",
    });

    // Controls should be visible, camera info should be hidden
    expect(result.showControlsInfo).toBe(true);
    expect(result.showCameraInfo).toBe(false);
  });
});
