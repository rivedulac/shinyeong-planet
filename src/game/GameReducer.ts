import * as THREE from "three";
import { IConversation } from "./npcs/interfaces/IConversation";
import { PlayerController } from "./PlayerController";

export interface GameState {
  playerName: string;
  gameStarted: boolean;
  isEditingName: boolean;

  showControlsInfo: boolean;
  showCameraInfo: boolean;
  minimapVisible: boolean;

  currentConversation: IConversation | null;
  isConversationOpen: boolean;

  playerController: PlayerController | null;
  npcState: Array<{
    type: string;
    position: THREE.Vector3;
    id: string;
  }>;

  cameraPosition: {
    position: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
  };
}

export type GameAction =
  | { type: "SET_PLAYER_NAME"; payload: string }
  | { type: "START_GAME" }
  | { type: "EDIT_NAME"; payload: boolean }
  | { type: "TOGGLE_CONTROLS_INFO" }
  | { type: "TOGGLE_CAMERA_INFO" }
  | { type: "TOGGLE_MINIMAP" }
  | { type: "SET_MINIMAP_VISIBILITY"; payload: boolean }
  | { type: "START_CONVERSATION"; payload: IConversation }
  | { type: "END_CONVERSATION" }
  | { type: "SET_PLAYER_CONTROLLER"; payload: PlayerController | null }
  | {
      type: "UPDATE_NPC_STATE";
      payload: Array<{ type: string; position: THREE.Vector3; id: string }>;
    }
  | {
      type: "UPDATE_CAMERA_POSITION";
      payload: {
        position: { x: number; y: number; z: number };
        rotation: { pitch: number; yaw: number; roll: number };
      };
    };

export const initialGameState: GameState = {
  playerName: "",
  gameStarted: false,
  isEditingName: false,
  showControlsInfo: false,
  showCameraInfo: false,
  minimapVisible: true,
  currentConversation: null,
  isConversationOpen: false,
  playerController: null,
  npcState: [],
  cameraPosition: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  },
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYER_NAME":
      return {
        ...state,
        playerName: action.payload,
      };

    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
      };

    case "EDIT_NAME":
      return {
        ...state,
        isEditingName: action.payload,
      };

    case "TOGGLE_CONTROLS_INFO":
      return {
        ...state,
        showControlsInfo: !state.showControlsInfo,
        // If we're showing controls info, hide the camera info
        showCameraInfo: state.showControlsInfo ? state.showCameraInfo : false,
      };

    case "TOGGLE_CAMERA_INFO":
      return {
        ...state,
        showCameraInfo: !state.showCameraInfo,
      };

    case "TOGGLE_MINIMAP":
      return {
        ...state,
        minimapVisible: !state.minimapVisible,
      };

    case "SET_MINIMAP_VISIBILITY":
      return {
        ...state,
        minimapVisible: action.payload,
      };

    case "START_CONVERSATION":
      return {
        ...state,
        currentConversation: action.payload,
        isConversationOpen: true,
      };

    case "END_CONVERSATION":
      return {
        ...state,
        isConversationOpen: false,
        // Note: We don't immediately clear currentConversation to avoid UI flicker
        // This would typically be handled by a setTimeout in the component
      };

    case "SET_PLAYER_CONTROLLER":
      return {
        ...state,
        playerController: action.payload,
      };

    case "UPDATE_NPC_STATE":
      return {
        ...state,
        npcState: action.payload,
      };

    case "UPDATE_CAMERA_POSITION":
      return {
        ...state,
        cameraPosition: action.payload,
      };

    default:
      return state;
  }
}
