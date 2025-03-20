// Define the state interface for the MenuBar component
export interface MenuBarState {
  settingsHovered: boolean;
  infoHovered: boolean;
  settingsOpen: boolean;
  infoOpen: boolean;
}

// Define the action types
export type MenuBarAction =
  | { type: "SET_SETTINGS_HOVERED"; payload: boolean }
  | { type: "SET_INFO_HOVERED"; payload: boolean }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "TOGGLE_INFO" }
  | { type: "CLOSE_ALL_DROPDOWNS" };

// Initial state
export const initialMenuBarState: MenuBarState = {
  settingsHovered: false,
  infoHovered: false,
  settingsOpen: false,
  infoOpen: false,
};

// Reducer function
export function menuBarReducer(
  state: MenuBarState,
  action: MenuBarAction
): MenuBarState {
  switch (action.type) {
    case "SET_SETTINGS_HOVERED":
      return {
        ...state,
        settingsHovered: action.payload,
      };

    case "SET_INFO_HOVERED":
      return {
        ...state,
        infoHovered: action.payload,
      };

    case "TOGGLE_SETTINGS":
      return {
        ...state,
        settingsOpen: !state.settingsOpen,
        // Close info dropdown if opening settings
        infoOpen: state.settingsOpen ? state.infoOpen : false,
      };

    case "TOGGLE_INFO":
      return {
        ...state,
        infoOpen: !state.infoOpen,
        // Close settings dropdown if opening info
        settingsOpen: state.infoOpen ? state.settingsOpen : false,
      };

    case "CLOSE_ALL_DROPDOWNS":
      return {
        ...state,
        settingsOpen: false,
        infoOpen: false,
      };

    default:
      return state;
  }
}
