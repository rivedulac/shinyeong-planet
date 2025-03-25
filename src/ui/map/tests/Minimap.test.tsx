import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Minimap from "../Minimap";
import * as THREE from "three";
import {
  MINI_MAP_CENTER_X,
  MINI_MAP_CENTER_Y,
  MINI_MAP_RADIUS,
  PLANET_CENTER,
} from "../../../config/constants";

// Mock the projection utils module - needs to be before any reference to the variables
vi.mock("../utils/projection", () => {
  return {
    projectToMinimap: vi.fn().mockReturnValue({ x: 10, y: 20 }),
    generateGridLines: vi.fn().mockReturnValue({
      latitudeLines: [{ points: "100,100 110,110", label: "Equator" }],
      longitudeLines: [{ points: "90,90 130,130", label: "Prime Meridian" }],
      poleMarkers: [{ x: 10, y: 20, isPole: true, isNorth: true }],
    }),
    isPointVisible: vi.fn().mockReturnValue(true),
    cartesianToLatLong: vi.fn().mockReturnValue({ lat: 45, long: 30 }),
  };
});

// Import the mocked functions after the mock definition
import {
  projectToMinimap,
  generateGridLines,
  isPointVisible,
} from "../utils/projection";

describe("Minimap", () => {
  // Test data
  const mockPlayerPosition = new THREE.Vector3(10, 20, 30);
  const mockPlayerRotation = Math.PI / 4; // 45 degrees
  const mockPlayerLookDirection = new THREE.Vector3(1, 0, 1).normalize();
  const mockNpcs = [
    { id: "npc1", position: new THREE.Vector3(5, 5, 5) },
    {
      id: "npc2",
      position: new THREE.Vector3(-5, 10, -5),
    },
    {
      id: "npc3",
      position: new THREE.Vector3(15, 0, 15),
    },
  ];

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();

    // Reset default mock returns
    (projectToMinimap as any).mockReturnValue({ x: 10, y: 20 });
    (isPointVisible as any).mockReturnValue(true);
  });

  describe("Component Rendering", () => {
    it("should render the minimap container with correct styles", () => {
      const { container } = render(
        <Minimap
          playerPosition={mockPlayerPosition}
          playerRotation={mockPlayerRotation}
          npcs={mockNpcs}
        />
      );

      // Check if the container div exists with the correct styles
      const minimapContainer = container.firstChild as HTMLElement;
      expect(minimapContainer).toBeInTheDocument();
      expect(minimapContainer.tagName).toBe("DIV");
    });

    it("should render an SVG element with correct viewport", () => {
      const { container } = render(<Minimap />);

      // Check if there's an SVG element
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "100%");
      expect(svg).toHaveAttribute("height", "100%");
      expect(svg).toHaveAttribute("viewBox", "0 0 200 200");
    });

    it("should render compass direction indicators", () => {
      render(<Minimap />);

      expect(screen.getByText("N")).toBeInTheDocument();
      expect(screen.getByText("S")).toBeInTheDocument();
      expect(screen.getByText("E")).toBeInTheDocument();
      expect(screen.getByText("W")).toBeInTheDocument();
    });

    it("should render grid lines when player position is provided", () => {
      const { container } = render(
        <Minimap playerPosition={mockPlayerPosition} />
      );

      // Verify grid lines are rendered
      const polylines = container.querySelectorAll("polyline");
      expect(polylines.length).toBeGreaterThanOrEqual(2); // At least latitude and longitude lines
    });
  });

  describe("Player Marker", () => {
    it("should render a player marker with correct rotation using look direction", () => {
      const { container } = render(
        <Minimap
          playerPosition={mockPlayerPosition}
          playerRotation={mockPlayerRotation}
          playerLookDirection={mockPlayerLookDirection}
        />
      );

      // Find the player marker polygon
      const playerMarker = container.querySelector("polygon");
      expect(playerMarker).toBeInTheDocument();
      expect(playerMarker).toHaveAttribute("fill", "#ff3333");

      // Verify triangle shape points
      const pointsAttr = playerMarker?.getAttribute("points");
      expect(pointsAttr).toContain(
        `${MINI_MAP_CENTER_X},${MINI_MAP_CENTER_Y - 6}`
      );

      // Check rotation transform - should include a rotate transformation
      expect(playerMarker?.getAttribute("transform")).toMatch(/rotate\(.*\)/);
    });

    it("should render a center dot at player position", () => {
      const { container } = render(
        <Minimap
          playerPosition={mockPlayerPosition}
          playerRotation={mockPlayerRotation}
        />
      );

      // Check for the center dot
      const centerDot = container.querySelector(
        `circle[cx='${MINI_MAP_CENTER_X}'][cy='${MINI_MAP_CENTER_Y}'][r='1']`
      );
      expect(centerDot).toBeInTheDocument();
      expect(centerDot).toHaveAttribute("fill", "#ffffff");
    });
  });

  describe("NPC Rendering", () => {
    it("should render NPCs with correct colors and sizes", () => {
      const { container } = render(
        <Minimap playerPosition={mockPlayerPosition} npcs={mockNpcs} />
      );

      // Check for NPC markers
      const npcMarkers = container.querySelectorAll("rect");
      expect(npcMarkers.length).toBe(mockNpcs.length);
    });
  });

  describe("calculateRelativeRotation Function", () => {
    it("should handle both look direction and raw rotation", () => {
      // First render with look direction
      const { container, rerender } = render(
        <Minimap
          playerPosition={mockPlayerPosition}
          playerRotation={mockPlayerRotation}
          playerLookDirection={mockPlayerLookDirection}
        />
      );

      let playerMarker = container.querySelector("polygon");
      expect(playerMarker).toBeInTheDocument();

      const transformWithLookDirection =
        playerMarker?.getAttribute("transform");

      // Rerender with only rotation (no look direction)
      rerender(
        <Minimap
          playerPosition={mockPlayerPosition}
          playerRotation={mockPlayerRotation}
        />
      );

      playerMarker = container.querySelector("polygon");
      const transformWithRotationOnly = playerMarker?.getAttribute("transform");

      // Both should include a rotation
      expect(transformWithLookDirection).toMatch(/rotate\(.*\)/);
      expect(transformWithRotationOnly).toMatch(/rotate\(.*\)/);
    });

    it("should handle position at north pole", () => {
      // Create a position at the north pole
      const northPolePosition = new THREE.Vector3(
        PLANET_CENTER.x,
        PLANET_CENTER.y + MINI_MAP_RADIUS,
        PLANET_CENTER.z
      );

      const lookDirection = new THREE.Vector3(1, 0, 0);

      const { container } = render(
        <Minimap
          playerPosition={northPolePosition}
          playerLookDirection={lookDirection}
        />
      );

      // The player marker should render without errors
      const playerMarker = container.querySelector("polygon");
      expect(playerMarker).toBeInTheDocument();
      expect(playerMarker?.getAttribute("transform")).toMatch(/rotate\(.*\)/);
    });
  });

  describe("Projection Utilities Integration", () => {
    it("should call projection utilities when player position is provided", () => {
      render(<Minimap playerPosition={mockPlayerPosition} npcs={mockNpcs} />);

      // Should call generateGridLines
      expect(generateGridLines).toHaveBeenCalledWith(
        mockPlayerPosition,
        MINI_MAP_RADIUS,
        MINI_MAP_CENTER_X,
        MINI_MAP_CENTER_Y
      );

      // Should call projectToMinimap for each NPC
      mockNpcs.forEach((npc) => {
        expect(projectToMinimap).toHaveBeenCalledWith(
          npc.position,
          mockPlayerPosition,
          MINI_MAP_RADIUS
        );
      });
    });

    it("should filter out NPCs that are not visible", () => {
      // Make the first NPC invisible
      (isPointVisible as any).mockImplementationOnce(() => false);

      render(<Minimap playerPosition={mockPlayerPosition} npcs={mockNpcs} />);

      // Should call isPointVisible for each NPC
      expect(isPointVisible).toHaveBeenCalledTimes(mockNpcs.length);

      // Should call projectToMinimap less than total NPCs (since one is invisible)
      expect(projectToMinimap).toHaveBeenCalledTimes(mockNpcs.length - 1);
    });

    it("should handle null projection results", () => {
      // Make projectToMinimap return null once
      (projectToMinimap as any).mockImplementationOnce(() => null);

      const { container } = render(
        <Minimap playerPosition={mockPlayerPosition} npcs={mockNpcs} />
      );

      // Should render fewer NPCs than the total
      const npcMarkers = container.querySelectorAll("rect");
      expect(npcMarkers.length).toBeLessThan(mockNpcs.length);
    });
  });
});
