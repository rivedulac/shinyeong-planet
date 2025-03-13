import { describe, it, expect } from "vitest";
import { Billboard } from "../Billboard";
import { NpcType } from "../INpc";
import * as THREE from "three";
import { PLANET_RADIUS, PLANET_CENTER } from "../../../config/constants";

describe("Billboard NPC", () => {
  it("should create a billboard with correct properties", () => {
    const id = "test-billboard";
    const title = "My Resume";
    const billboard = new Billboard(id, title);

    // Check ID and type
    expect(billboard.getId()).toBe(id);
    expect(billboard.getType()).toBe(NpcType.Billboard);

    // Check mesh creation
    const mesh = billboard.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.children.length).toBeGreaterThan(0);
  });

  it("should position correctly on the planet surface with offset", () => {
    const billboard = new Billboard("test-positioning");
    const surfaceOffset = 7; // Same offset used in the class

    // Position at the north pole (latitude = PI/2, longitude = 0)
    billboard.setPositionOnPlanet(Math.PI / 2, 0);

    // Calculate expected position with offset
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y + PLANET_RADIUS + surfaceOffset, // Adding offset in Y direction (for north pole)
      PLANET_CENTER.z
    );

    // The billboard should be at (0, PLANET_RADIUS + offset, 0) in world coordinates
    const mesh = billboard.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should position correctly at the equator with offset", () => {
    const billboard = new Billboard("test-positioning-equator");
    const surfaceOffset = 7; // Same offset used in the class

    // Position at the equator (latitude = 0, longitude = 0)
    billboard.setPositionOnPlanet(0, 0);

    // Calculate expected position with offset
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS + surfaceOffset, // Adding offset in X direction (for equator at 0 longitude)
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    // The billboard should be at (PLANET_RADIUS + offset, 0, 0) in world coordinates
    const mesh = billboard.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should update without errors", () => {
    const billboard = new Billboard("test-update");

    // This should not throw any errors
    expect(() => billboard.update(0.1)).not.toThrow();
  });
});
