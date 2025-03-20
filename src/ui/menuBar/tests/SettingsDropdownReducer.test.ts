import { describe, it, expect } from "vitest";
import {
  settingsDropdownReducer,
  initialSettingsDropdownState,
  SettingsDropdownState,
  SettingsDropdownAction,
} from "../SettingsDropdownReducer";

describe("SettingsDropdownReducer", () => {
  it("should handle undefined or null actions gracefully", () => {
    const result = settingsDropdownReducer(
      initialSettingsDropdownState,
      {} as SettingsDropdownAction
    );
    expect(result).toEqual(initialSettingsDropdownState);
  });

  it("should return unchanged state for unknown action types", () => {
    const result = settingsDropdownReducer(initialSettingsDropdownState, {
      type: "UNKNOWN_ACTION",
    } as any);
    expect(result).toEqual(initialSettingsDropdownState);
  });

  it("should handle TOGGLE_LANGUAGE_MENU action", () => {
    // Test toggling from false to true
    const state: SettingsDropdownState = {
      ...initialSettingsDropdownState,
      languageMenuOpen: false,
    };
    const action: SettingsDropdownAction = { type: "TOGGLE_LANGUAGE_MENU" };

    const result = settingsDropdownReducer(state, action);

    expect(result.languageMenuOpen).toBe(true);

    // Test toggling from true to false
    const state2: SettingsDropdownState = {
      ...initialSettingsDropdownState,
      languageMenuOpen: true,
    };

    const result2 = settingsDropdownReducer(state2, action);

    expect(result2.languageMenuOpen).toBe(false);
  });

  it("should handle CLOSE_LANGUAGE_MENU action", () => {
    // Test closing when already open
    const state: SettingsDropdownState = {
      ...initialSettingsDropdownState,
      languageMenuOpen: true,
    };
    const action: SettingsDropdownAction = { type: "CLOSE_LANGUAGE_MENU" };

    const result = settingsDropdownReducer(state, action);

    expect(result.languageMenuOpen).toBe(false);

    // Test closing when already closed (should remain closed)
    const state2: SettingsDropdownState = {
      ...initialSettingsDropdownState,
      languageMenuOpen: false,
    };

    const result2 = settingsDropdownReducer(state2, action);

    expect(result2.languageMenuOpen).toBe(false);
  });

  it("should provide default state if state is undefined", () => {
    const action: SettingsDropdownAction = { type: "TOGGLE_LANGUAGE_MENU" };

    // @ts-ignore: Testing with undefined state
    const result = settingsDropdownReducer(undefined, action);

    expect(result.languageMenuOpen).toBe(true);
  });
});
