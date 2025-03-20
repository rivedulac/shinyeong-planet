export interface VirtualPadState {
  isActive: boolean;
  currentDirections: string[];
}

export type VirtualPadAction =
  | { type: "ACTIVATE" }
  | { type: "DEACTIVATE" }
  | { type: "UPDATE_DIRECTIONS"; directions: string[] };

export const initialVirtualPadState: VirtualPadState = {
  isActive: false,
  currentDirections: [],
};

export function virtualPadReducer(
  state: VirtualPadState = initialVirtualPadState,
  action: VirtualPadAction
): VirtualPadState {
  if (!action || !action.type) {
    return state;
  }

  switch (action.type) {
    case "ACTIVATE":
      return {
        ...state,
        isActive: true,
      };

    case "DEACTIVATE":
      return {
        ...state,
        isActive: false,
        currentDirections: [], // Clear directions when deactivating
      };

    case "UPDATE_DIRECTIONS":
      return {
        ...state,
        currentDirections: action.directions,
      };

    default:
      return state;
  }
}
