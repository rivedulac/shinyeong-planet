import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InfoDropdown from "../InfoDropdown";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        // Mock translation strings
        const translations: Record<string, string> = {
          "controls.title": "Game Controls",
          "cameraPosition.title": "Camera Position",
        };
        return translations[str] || str;
      },
    };
  },
}));

describe("InfoDropdown", () => {
  it("should not render when isOpen is false", () => {
    render(
      <InfoDropdown
        isOpen={false}
        onClose={() => {}}
        onToggleControls={() => {}}
      />
    );

    // Verify that dropdown content is not in the document
    expect(screen.queryByText("Game Controls")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <InfoDropdown
        isOpen={true}
        onClose={() => {}}
        onToggleControls={() => {}}
      />
    );

    // Verify dropdown content is visible
    expect(screen.getByText("Game Controls")).toBeInTheDocument();
  });

  it("should render the controls option when onToggleControls is provided", () => {
    render(
      <InfoDropdown
        isOpen={true}
        onClose={() => {}}
        onToggleControls={() => {}}
      />
    );

    // Check for Controls option
    expect(screen.getByText("Game Controls")).toBeInTheDocument();
  });

  it("should not render controls option when onToggleControls is not provided", () => {
    render(<InfoDropdown isOpen={true} onClose={() => {}} />);

    // Check that Controls option is not rendered
    expect(screen.queryByText("Game Controls")).not.toBeInTheDocument();
  });

  it("should render camera position option when onToggleCamera is provided", () => {
    render(
      <InfoDropdown
        isOpen={true}
        onClose={() => {}}
        onToggleCamera={() => {}}
      />
    );

    // Check for Camera Position option
    expect(screen.getByText("Camera Position")).toBeInTheDocument();
  });

  it("should not render camera position when onToggleCamera is not provided", () => {
    render(<InfoDropdown isOpen={true} onClose={() => {}} />);

    // Check that Camera Position option is not rendered
    expect(screen.queryByText("Camera Position")).not.toBeInTheDocument();
  });

  it("should call onToggleControls when controls option is clicked", () => {
    const mockToggleControls = vi.fn();
    const mockClose = vi.fn();

    render(
      <InfoDropdown
        isOpen={true}
        onClose={mockClose}
        onToggleControls={mockToggleControls}
      />
    );

    // Click on controls option
    fireEvent.click(screen.getByText("Game Controls"));

    // Verify callbacks were called
    expect(mockToggleControls).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should call onToggleCamera when camera position option is clicked", () => {
    const mockToggleCamera = vi.fn();
    const mockClose = vi.fn();

    render(
      <InfoDropdown
        isOpen={true}
        onClose={mockClose}
        onToggleCamera={mockToggleCamera}
      />
    );

    // Click on camera position option
    fireEvent.click(screen.getByText("Camera Position"));

    // Verify callbacks were called
    expect(mockToggleCamera).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
