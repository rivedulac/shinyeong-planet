// src/ui/VirtualControlPad.tsx
import { CORNER_MARGIN } from "@/config/constants";
import React, { useReducer } from "react";
import { virtualPadReducer, initialVirtualPadState } from "./VirtualPadReducer";

interface VirtualControlPadProps {
  onMoveStart: (key: string) => void;
  onMoveEnd: (key: string) => void;
}

export const MOVE_THRESHOLD = 0.6;
export const LOOK_THRESHOLD = 0.85;
export const ROTATE_THRESHOLD = 0.3;

const VirtualControlPad: React.FC<VirtualControlPadProps> = ({
  onMoveStart,
  onMoveEnd,
}) => {
  const [state, dispatch] = useReducer(
    virtualPadReducer,
    initialVirtualPadState
  );

  // Calculate directions based on relative position
  const getDirectionsFromPosition = (relX: number, relY: number): string[] => {
    const directions: string[] = [];

    if (relY < -LOOK_THRESHOLD) {
      directions.push("arrowup");
    } else if (relY > LOOK_THRESHOLD) {
      directions.push("arrowdown");
    }

    // Forward/backward movement
    if (relX > -MOVE_THRESHOLD && relX < MOVE_THRESHOLD) {
      if (relY < 0) {
        directions.push("w"); // Forward
      } else if (relY > 0) {
        directions.push("s"); // Backward
      }
    }

    // Left/right rotation
    if (relX < -ROTATE_THRESHOLD) {
      directions.push("arrowleft"); // Left
    } else if (relX > ROTATE_THRESHOLD) {
      directions.push("arrowright"); // Right
    }

    return directions;
  };

  // Handle position updates and trigger appropriate events
  const updatePosition = (
    clientX: number,
    clientY: number,
    element: HTMLElement
  ) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const relX = (clientX - rect.left - centerX) / centerX;
    const relY = (clientY - rect.top - centerY) / centerY;

    const newDirections = getDirectionsFromPosition(relX, relY);

    // End directions that are no longer active
    state.currentDirections.forEach((dir) => {
      if (!newDirections.includes(dir)) {
        onMoveEnd(dir);
      }
    });

    // Start new directions
    newDirections.forEach((dir) => {
      if (!state.currentDirections.includes(dir)) {
        onMoveStart(dir);
      }
    });

    // Update current directions through reducer
    dispatch({ type: "UPDATE_DIRECTIONS", directions: newDirections });
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    dispatch({ type: "ACTIVATE" });

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePosition(
        touch.clientX,
        touch.clientY,
        e.currentTarget as HTMLElement
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePosition(
        touch.clientX,
        touch.clientY,
        e.currentTarget as HTMLElement
      );
    }
  };

  const handleTouchEnd = () => {
    // End all current directions
    state.currentDirections.forEach((dir) => {
      onMoveEnd(dir);
    });

    dispatch({ type: "DEACTIVATE" });
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dispatch({ type: "ACTIVATE" });
    updatePosition(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (state.isActive) {
      updatePosition(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    }
  };

  const handleMouseUp = () => {
    // End all current directions
    state.currentDirections.forEach((dir) => {
      onMoveEnd(dir);
    });

    dispatch({ type: "DEACTIVATE" });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "25%",
        width: "50%",
        height: "20%",
        bottom: CORNER_MARGIN,
        borderRadius: "10px",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        touchAction: "none",
      }}
      data-testid="virtual-pad"
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
      // Touch events (primarily for mobile)
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      // Mouse events (primarily for desktop)
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Center circle */}
      <div
        style={{
          width: "2.0rem",
          height: "2.0rem",
          borderRadius: "50%",
          backgroundColor: "white",
          opacity: 0.8,
        }}
      />

      {/* Visual indicator of touch position (only shown when active) */}
      {state.isActive && (
        <div
          style={{
            position: "absolute",
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
        />
      )}
    </div>
  );
};

export default VirtualControlPad;
