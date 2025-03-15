import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Minimap from "../Minimap";

describe("Minimap", () => {
  it("should render the minimap container", () => {
    const { container } = render(<Minimap />);

    // Check if the container div exists with the correct styles
    const minimapContainer = container.firstChild as HTMLElement;
    expect(minimapContainer).toBeInTheDocument();
    expect(minimapContainer.tagName).toBe("DIV");
    expect(minimapContainer).toHaveStyle({
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "200px",
      height: "200px",
      borderRadius: "50%",
    });
  });

  it("should render an SVG element", () => {
    const { container } = render(<Minimap />);

    // Check if there's an SVG element
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "100%");
    expect(svg).toHaveAttribute("height", "100%");
    expect(svg).toHaveAttribute("viewBox", "0 0 200 200");
  });

  it("should contain a player marker", () => {
    render(<Minimap />);

    // Find the player marker polygon (triangle shape)
    const playerMarker = document.querySelector("polygon");
    expect(playerMarker).toBeInTheDocument();
    expect(playerMarker).toHaveAttribute("fill", "#ff3333");
    expect(playerMarker).toHaveAttribute("points", "100,94 96,106 104,106");
  });

  it("should render the 'Minimap' text", () => {
    render(<Minimap />);

    // Check that the text content is displayed
    const textElement = screen.getByText("Minimap");
    expect(textElement).toBeInTheDocument();
  });

  it("should render a planet/background circle", () => {
    const { container } = render(<Minimap />);

    // Check for the background circle
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "100");
    expect(circle).toHaveAttribute("cy", "100");
    expect(circle).toHaveAttribute("r", "95");
    expect(circle).toHaveAttribute("stroke", "#ffffff");
  });
});
