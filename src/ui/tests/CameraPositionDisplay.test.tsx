import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
// Import the component to test
import CameraPositionDisplay from "../CameraPositionDisplay";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string, params: Record<string, unknown> = {}) => {
        // Simple mock implementation of t function
        if (str === "cameraPosition.title") return "Camera Position";
        if (str === "cameraPosition.x") return `X: ${params.value}`;
        if (str === "cameraPosition.y") return `Y: ${params.value}`;
        if (str === "cameraPosition.z") return `Z: ${params.value}`;
        if (str === "cameraPosition.pitch") return `Pitch: ${params.value}`;
        if (str === "cameraPosition.yaw") return `Yaw: ${params.value}`;
        if (str === "cameraPosition.roll") return `Roll: ${params.value}`;
        return str;
      },
      i18n: {
        changeLanguage: vi.fn(),
        language: "en",
      },
    };
  },
}));

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
