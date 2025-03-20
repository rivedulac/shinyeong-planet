import { describe, it, expect } from "vitest";
import {
  virtualPadReducer,
  initialVirtualPadState,
  VirtualPadState,
  VirtualPadAction,
} from "../VirtualPadReducer";

describe("VirtualPadReducer", () => {
  it("should handle undefined or null actions gracefully", () => {
    const result = virtualPadReducer(
      initialVirtualPadState,
      {} as VirtualPadAction
    );
    expect(result).toEqual(initialVirtualPadState);
  });

  it("should return unchanged state for unknown action types", () => {
    const result = virtualPadReducer(initialVirtualPadState, {
      type: "UNKNOWN_ACTION",
    } as any);
    expect(result).toEqual(initialVirtualPadState);
  });

  it("should handle ACTIVATE action", () => {
    const state: VirtualPadState = {
      ...initialVirtualPadState,
      isActive: false,
    };
    const action: VirtualPadAction = { type: "ACTIVATE" };

    const result = virtualPadReducer(state, action);

    expect(result.isActive).toBe(true);
    expect(result.currentDirections).toEqual([]);
  });

  it("should handle DEACTIVATE action", () => {
    const state: VirtualPadState = {
      isActive: true,
      currentDirections: ["w", "arrowleft"],
    };
    const action: VirtualPadAction = { type: "DEACTIVATE" };

    const result = virtualPadReducer(state, action);

    expect(result.isActive).toBe(false);
    expect(result.currentDirections).toEqual([]);
  });

  it("should handle UPDATE_DIRECTIONS action", () => {
    const state: VirtualPadState = {
      isActive: true,
      currentDirections: ["w"],
    };
    const newDirections = ["w", "arrowright"];
    const action: VirtualPadAction = {
      type: "UPDATE_DIRECTIONS",
      directions: newDirections,
    };

    const result = virtualPadReducer(state, action);

    expect(result.isActive).toBe(true);
    expect(result.currentDirections).toEqual(newDirections);
  });

  it("should provide default state if state is undefined", () => {
    const action: VirtualPadAction = { type: "ACTIVATE" };

    // @ts-ignore: Testing with undefined state
    const result = virtualPadReducer(undefined, action);

    expect(result.isActive).toBe(true);
    expect(result.currentDirections).toEqual([]);
  });
});
