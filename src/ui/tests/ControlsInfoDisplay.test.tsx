// src/ui/tests/ControlsInfoDisplay.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ControlsInfoDisplay from "../ControlsInfoDisplay";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        // Simple mock implementation
        if (str === "controls.title") return "Controls:";
        if (str === "controls.moveForward") return "W - Move Forward";
        if (str === "controls.moveBackward") return "S - Move Backward";
        if (str === "controls.strafeLeft") return "A - Strafe Left";
        if (str === "controls.strafeRight") return "D - Strafe Right";
        if (str === "controls.rotateLeft") return "← - Rotate Left";
        if (str === "controls.rotateRight") return "→ - Rotate Right";
        if (str === "controls.lookUp") return "↑ - Look Up";
        if (str === "controls.lookDown") return "↓ - Look Down";
        if (str === "controls.zoomIn") return "+ - Zoom In (Decrease FOV)";
        if (str === "controls.zoomOut") return "- - Zoom Out (Increase FOV)";
        return str;
      },
    };
  },
}));

describe("ControlsInfoDisplay", () => {
  it("should render controls information display", () => {
    render(<ControlsInfoDisplay />);

    // Check that the title is displayed
    expect(screen.getByText("Controls:")).toBeInTheDocument();

    // Check that all control instructions are displayed
    expect(screen.getByText("W - Move Forward")).toBeInTheDocument();
    expect(screen.getByText("S - Move Backward")).toBeInTheDocument();
    expect(screen.getByText("A - Strafe Left")).toBeInTheDocument();
    expect(screen.getByText("D - Strafe Right")).toBeInTheDocument();
    expect(screen.getByText("← - Rotate Left")).toBeInTheDocument();
    expect(screen.getByText("→ - Rotate Right")).toBeInTheDocument();
    expect(screen.getByText("↑ - Look Up")).toBeInTheDocument();
    expect(screen.getByText("↓ - Look Down")).toBeInTheDocument();
    expect(screen.getByText("+ - Zoom In (Decrease FOV)")).toBeInTheDocument();
    expect(screen.getByText("- - Zoom Out (Increase FOV)")).toBeInTheDocument();
  });
});
