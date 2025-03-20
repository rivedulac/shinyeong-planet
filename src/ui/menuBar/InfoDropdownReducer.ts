// Define the state interface for InfoDropdown
export interface InfoDropdownState {
  isControlsVisible: boolean;
  isCameraVisible: boolean;
}

// Define the action types
export type InfoDropdownAction =
  | { type: "TOGGLE_CONTROLS" }
  | { type: "TOGGLE_CAMERA" }
  | { type: "HIDE_ALL" };

// Initial state
export const initialInfoDropdownState: InfoDropdownState = {
  isControlsVisible: false,
  isCameraVisible: false,
};

// Reducer function
export function infoDropdownReducer(
  state: InfoDropdownState = initialInfoDropdownState,
  action: InfoDropdownAction
): InfoDropdownState {
  // Handle empty or invalid actions
  if (!action || !action.type) {
    return state;
  }

  switch (action.type) {
    case "TOGGLE_CONTROLS":
      return {
        ...state,
        isControlsVisible: !state.isControlsVisible,
        isCameraVisible: false, // Close other panel when opening one
      };

    case "TOGGLE_CAMERA":
      return {
        ...state,
        isCameraVisible: !state.isCameraVisible,
        isControlsVisible: false, // Close other panel when opening one
      };

    case "HIDE_ALL":
      return {
        ...state,
        isControlsVisible: false,
        isCameraVisible: false,
      };

    default:
      return state;
  }
}
