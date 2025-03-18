// src/ui/virtualControls/tests/VirtualZoomControls.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualZoomControls from "../VirtualZoomControls";

describe("VirtualZoomControls", () => {
  const mockZoomStart = vi.fn();
  const mockZoomEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render zoom in and zoom out buttons", () => {
    render(
      <VirtualZoomControls
        onZoomStart={mockZoomStart}
        onZoomEnd={mockZoomEnd}
      />
    );

    // Check that zoom buttons are rendered
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should call onZoomStart when zoom in button is pressed", () => {
    render(
      <VirtualZoomControls
        onZoomStart={mockZoomStart}
        onZoomEnd={mockZoomEnd}
      />
    );

    const zoomInButton = screen.getByText("+");
    fireEvent.mouseDown(zoomInButton);

    expect(mockZoomStart).toHaveBeenCalledWith("+");
  });

  it("should call onZoomEnd when zoom out button is released", () => {
    render(
      <VirtualZoomControls
        onZoomStart={mockZoomStart}
        onZoomEnd={mockZoomEnd}
      />
    );

    const zoomOutButton = screen.getByText("-");
    fireEvent.mouseDown(zoomOutButton);
    fireEvent.mouseUp(zoomOutButton);

    expect(mockZoomEnd).toHaveBeenCalledWith("-");
  });
});
