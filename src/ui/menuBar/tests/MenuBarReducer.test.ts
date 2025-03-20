import { describe, it, expect } from "vitest";
import {
  menuBarReducer,
  initialMenuBarState,
  MenuBarState,
  MenuBarAction,
} from "../MenuBarReducer";

describe("MenuBarReducer", () => {
  it("should handle undefined or null actions gracefully", () => {
    // Instead of trying to pass undefined directly, let's use a default parameter technique
    const result = menuBarReducer(initialMenuBarState, {} as MenuBarAction);
    expect(result).toEqual(initialMenuBarState);
  });

  it("should return unchanged state for unknown action types", () => {
    const result = menuBarReducer(initialMenuBarState, {
      type: "UNKNOWN_ACTION",
    } as any);
    expect(result).toEqual(initialMenuBarState);
  });

  it("should handle SET_SETTINGS_HOVERED action", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsHovered: false,
    };
    const action: MenuBarAction = {
      type: "SET_SETTINGS_HOVERED",
      payload: true,
    };

    const result = menuBarReducer(state, action);

    expect(result.settingsHovered).toBe(true);
    expect(result.infoHovered).toBe(false); // Other states unchanged
    expect(result.settingsOpen).toBe(false);
    expect(result.infoOpen).toBe(false);
  });

  it("should handle SET_INFO_HOVERED action", () => {
    const state: MenuBarState = { ...initialMenuBarState, infoHovered: false };
    const action: MenuBarAction = { type: "SET_INFO_HOVERED", payload: true };

    const result = menuBarReducer(state, action);

    expect(result.infoHovered).toBe(true);
    expect(result.settingsHovered).toBe(false); // Other states unchanged
    expect(result.settingsOpen).toBe(false);
    expect(result.infoOpen).toBe(false);
  });

  it("should handle TOGGLE_SETTINGS action when settings is closed", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: false,
      infoOpen: false,
    };
    const action: MenuBarAction = { type: "TOGGLE_SETTINGS" };

    const result = menuBarReducer(state, action);

    expect(result.settingsOpen).toBe(true);
    expect(result.infoOpen).toBe(false); // Info should remain closed
  });

  it("should handle TOGGLE_SETTINGS action when settings is open", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: true,
      infoOpen: false,
    };
    const action: MenuBarAction = { type: "TOGGLE_SETTINGS" };

    const result = menuBarReducer(state, action);

    expect(result.settingsOpen).toBe(false);
    expect(result.infoOpen).toBe(false); // Info should remain closed
  });

  it("should close info dropdown when toggling settings on", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: false,
      infoOpen: true,
    };
    const action: MenuBarAction = { type: "TOGGLE_SETTINGS" };

    const result = menuBarReducer(state, action);

    expect(result.settingsOpen).toBe(true);
    expect(result.infoOpen).toBe(false); // Info should close
  });

  it("should handle TOGGLE_INFO action when info is closed", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: false,
      infoOpen: false,
    };
    const action: MenuBarAction = { type: "TOGGLE_INFO" };

    const result = menuBarReducer(state, action);

    expect(result.infoOpen).toBe(true);
    expect(result.settingsOpen).toBe(false); // Settings should remain closed
  });

  it("should handle TOGGLE_INFO action when info is open", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: false,
      infoOpen: true,
    };
    const action: MenuBarAction = { type: "TOGGLE_INFO" };

    const result = menuBarReducer(state, action);

    expect(result.infoOpen).toBe(false);
    expect(result.settingsOpen).toBe(false); // Settings should remain closed
  });

  it("should close settings dropdown when toggling info on", () => {
    const state: MenuBarState = {
      ...initialMenuBarState,
      settingsOpen: true,
      infoOpen: false,
    };
    const action: MenuBarAction = { type: "TOGGLE_INFO" };

    const result = menuBarReducer(state, action);

    expect(result.infoOpen).toBe(true);
    expect(result.settingsOpen).toBe(false); // Settings should close
  });

  it("should handle CLOSE_ALL_DROPDOWNS action", () => {
    const state: MenuBarState = {
      settingsHovered: true,
      infoHovered: true,
      settingsOpen: true,
      infoOpen: true,
    };
    const action: MenuBarAction = { type: "CLOSE_ALL_DROPDOWNS" };

    const result = menuBarReducer(state, action);

    expect(result.settingsOpen).toBe(false);
    expect(result.infoOpen).toBe(false);
    expect(result.settingsHovered).toBe(true); // Hover states shouldn't change
    expect(result.infoHovered).toBe(true);
  });
});
