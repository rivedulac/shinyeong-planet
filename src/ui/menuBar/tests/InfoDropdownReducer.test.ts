import { describe, it, expect } from "vitest";
import {
  infoDropdownReducer,
  initialInfoDropdownState,
  InfoDropdownState,
  InfoDropdownAction,
} from "../InfoDropdownReducer";

describe("InfoDropdownReducer", () => {
  it("should handle undefined or null actions gracefully", () => {
    const result = infoDropdownReducer(
      initialInfoDropdownState,
      {} as InfoDropdownAction
    );
    expect(result).toEqual(initialInfoDropdownState);
  });

  it("should return unchanged state for unknown action types", () => {
    const result = infoDropdownReducer(initialInfoDropdownState, {
      type: "UNKNOWN_ACTION",
    } as any);
    expect(result).toEqual(initialInfoDropdownState);
  });

  it("should handle TOGGLE_CONTROLS action", () => {
    // Test toggling from false to true
    const state: InfoDropdownState = {
      ...initialInfoDropdownState,
      isControlsVisible: false,
    };
    const action: InfoDropdownAction = { type: "TOGGLE_CONTROLS" };

    const result = infoDropdownReducer(state, action);

    expect(result.isControlsVisible).toBe(true);
    expect(result.isCameraVisible).toBe(false); // Should close other panel

    // Test toggling from true to false
    const state2: InfoDropdownState = {
      ...initialInfoDropdownState,
      isControlsVisible: true,
    };

    const result2 = infoDropdownReducer(state2, action);

    expect(result2.isControlsVisible).toBe(false);
    expect(result2.isCameraVisible).toBe(false);
  });

  it("should handle TOGGLE_CAMERA action", () => {
    // Test toggling from false to true
    const state: InfoDropdownState = {
      ...initialInfoDropdownState,
      isCameraVisible: false,
    };
    const action: InfoDropdownAction = { type: "TOGGLE_CAMERA" };

    const result = infoDropdownReducer(state, action);

    expect(result.isCameraVisible).toBe(true);
    expect(result.isControlsVisible).toBe(false); // Should close other panel

    // Test toggling from true to false
    const state2: InfoDropdownState = {
      ...initialInfoDropdownState,
      isCameraVisible: true,
    };

    const result2 = infoDropdownReducer(state2, action);

    expect(result2.isCameraVisible).toBe(false);
    expect(result2.isControlsVisible).toBe(false);
  });

  it("should handle HIDE_ALL action", () => {
    // Test hiding when some panels are open
    const state: InfoDropdownState = {
      isControlsVisible: true,
      isCameraVisible: true,
    };
    const action: InfoDropdownAction = { type: "HIDE_ALL" };

    const result = infoDropdownReducer(state, action);

    expect(result.isControlsVisible).toBe(false);
    expect(result.isCameraVisible).toBe(false);
  });

  it("should provide default state if state is undefined", () => {
    const action: InfoDropdownAction = { type: "TOGGLE_CONTROLS" };

    // @ts-ignore: Testing with undefined state
    const result = infoDropdownReducer(undefined, action);

    expect(result.isControlsVisible).toBe(true);
    expect(result.isCameraVisible).toBe(false);
  });

  it("should ensure only one panel is visible at a time", () => {
    // Start with controls visible
    const state: InfoDropdownState = {
      isControlsVisible: true,
      isCameraVisible: false,
    };

    // Toggle camera
    const result = infoDropdownReducer(state, { type: "TOGGLE_CAMERA" });

    expect(result.isControlsVisible).toBe(false);
    expect(result.isCameraVisible).toBe(true);
  });
});
