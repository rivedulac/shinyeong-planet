import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
// Import the component to test
import CameraPositionDisplay from "../CameraPositionDisplay";

describe("CameraPositionDisplay", () => {
  it("should render camera position coordinates", () => {
    const perspective = {
      position: { x: 10.123, y: 5.456, z: -3.789 },
      rotation: { pitch: 0.123, yaw: 0.456, roll: -0.789 },
    };

    // Use the component in the test by rendering it
    render(<CameraPositionDisplay perspective={perspective} />);

    // Check that the component title is displayed
    expect(screen.getByText("Camera Position")).toBeInTheDocument();

    // Check that coordinates are displayed with two decimal places
    expect(screen.getByText("X: 10.12")).toBeInTheDocument();
    expect(screen.getByText("Y: 5.46")).toBeInTheDocument();
    expect(screen.getByText("Z: -3.79")).toBeInTheDocument();

    // Check that rotation is displayed with two decimal places
    expect(screen.getByText("Pitch: 0.12")).toBeInTheDocument();
    expect(screen.getByText("Yaw: 0.46")).toBeInTheDocument();
    expect(screen.getByText("Roll: -0.79")).toBeInTheDocument();
  });
});
