import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
// Import the component to test
import CameraPositionDisplay from "../CameraPositionDisplay";

describe("CameraPositionDisplay", () => {
  it("should render camera position coordinates", () => {
    const position = { x: 10.123, y: 5.456, z: -3.789 };

    // Use the component in the test by rendering it
    render(<CameraPositionDisplay position={position} />);

    // Check that the component title is displayed
    expect(screen.getByText("Camera Position")).toBeInTheDocument();

    // Check that coordinates are displayed with two decimal places
    expect(screen.getByText("X: 10.12")).toBeInTheDocument();
    expect(screen.getByText("Y: 5.46")).toBeInTheDocument();
    expect(screen.getByText("Z: -3.79")).toBeInTheDocument();
  });
});
