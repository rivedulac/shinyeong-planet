// Define the state interface for SettingsDropdown
export interface SettingsDropdownState {
  // Currently, SettingsDropdown doesn't maintain internal state beyond what's controlled by props
  // But we can add a languageMenuOpen state to track expanded sections, if needed in the future
  languageMenuOpen: boolean;
}

// Define the action types
export type SettingsDropdownAction =
  | { type: "TOGGLE_LANGUAGE_MENU" }
  | { type: "CLOSE_LANGUAGE_MENU" };

// Initial state
export const initialSettingsDropdownState: SettingsDropdownState = {
  languageMenuOpen: false,
};

// Reducer function
export function settingsDropdownReducer(
  state: SettingsDropdownState = initialSettingsDropdownState,
  action: SettingsDropdownAction
): SettingsDropdownState {
  // Handle empty or invalid actions
  if (!action || !action.type) {
    return state;
  }

  switch (action.type) {
    case "TOGGLE_LANGUAGE_MENU":
      return {
        ...state,
        languageMenuOpen: !state.languageMenuOpen,
      };

    case "CLOSE_LANGUAGE_MENU":
      return {
        ...state,
        languageMenuOpen: false,
      };

    default:
      return state;
  }
}
