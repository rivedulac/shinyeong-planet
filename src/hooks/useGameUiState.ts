import { useCallback, useReducer } from "react";
import useLocalStorage from "./useLocalStorage";

interface UiState {
  showControlsInfo: boolean;
  showCameraInfo: boolean;
  minimapVisible: boolean;
  isEditingName: boolean;
}

type UiAction =
  | { type: "TOGGLE_CONTROLS_INFO" }
  | { type: "TOGGLE_CAMERA_INFO" }
  | { type: "SET_MINIMAP_VISIBILITY"; payload: boolean }
  | { type: "TOGGLE_MINIMAP" }
  | { type: "SET_EDITING_NAME"; payload: boolean };

const initialState: UiState = {
  showControlsInfo: false,
  showCameraInfo: false,
  minimapVisible: true,
  isEditingName: false,
};

function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case "TOGGLE_CONTROLS_INFO":
      return {
        ...state,
        showControlsInfo: !state.showControlsInfo,
        // If we're showing controls info, hide the camera info to avoid cluttering
        showCameraInfo: state.showControlsInfo ? state.showCameraInfo : false,
      };
    case "TOGGLE_CAMERA_INFO":
      return {
        ...state,
        showCameraInfo: !state.showCameraInfo,
      };
    case "SET_MINIMAP_VISIBILITY":
      return {
        ...state,
        minimapVisible: action.payload,
      };
    case "TOGGLE_MINIMAP":
      return {
        ...state,
        minimapVisible: !state.minimapVisible,
      };
    case "SET_EDITING_NAME":
      return {
        ...state,
        isEditingName: action.payload,
      };
    default:
      return state;
  }
}

// Local storage key for minimap visibility
const MINIMAP_VISIBILITY_KEY = "shinyeongPlanet.minimapVisible";

/**
 * Custom hook to manage UI state in the game
 */
export function useGameUiState() {
  const [storedMinimapVisible, setStoredMinimapVisible] =
    useLocalStorage<boolean>(MINIMAP_VISIBILITY_KEY, true);

  // Initialize state with value from localStorage
  const [state, dispatch] = useReducer(uiReducer, {
    ...initialState,
    minimapVisible: storedMinimapVisible ?? true,
  });

  // Toggle controls info display
  const toggleControlsInfo = useCallback(() => {
    dispatch({ type: "TOGGLE_CONTROLS_INFO" });
  }, []);

  // Toggle camera info display
  const toggleCameraInfo = useCallback(() => {
    dispatch({ type: "TOGGLE_CAMERA_INFO" });
  }, []);

  // Toggle minimap visibility
  const toggleMinimap = useCallback(() => {
    const newVisibility = !state.minimapVisible;
    setStoredMinimapVisible(newVisibility);
    dispatch({ type: "SET_MINIMAP_VISIBILITY", payload: newVisibility });
  }, [state.minimapVisible, setStoredMinimapVisible]);

  // Set name editing state
  const setEditingName = useCallback((isEditing: boolean) => {
    dispatch({ type: "SET_EDITING_NAME", payload: isEditing });
  }, []);

  return {
    ...state,
    toggleControlsInfo,
    toggleCameraInfo,
    toggleMinimap,
    setEditingName,
  };
}
