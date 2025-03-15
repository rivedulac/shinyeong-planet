import { describe, it, expect } from "vitest";
import { Flag } from "../Flag";
import { NpcType } from "../interfaces/INpc";
import * as THREE from "three";
import {
  PLANET_RADIUS,
  PLANET_CENTER,
  DEFAULT_FLAG_CONVERSTAION,
} from "../../../config/constants";

describe("Flag NPC", () => {
  it("should create a flag with correct properties", () => {
    const id = "test-flag";
    const country = "🇺🇸";
    const description = "Internship";

    const flag = new Flag(id, country, description);

    // Check ID and type
    expect(flag.getId()).toBe(id);
    expect(flag.getType()).toBe(NpcType.Flag);
    expect(flag.getConversation()).toBe(DEFAULT_FLAG_CONVERSTAION);

    // Check mesh creation
    const mesh = flag.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.children.length).toBeGreaterThan(0);
  });

  it("should position correctly on the planet surface with offset", () => {
    const flag = new Flag("test-positioning");

    // Position at the north pole (latitude = PI/2, longitude = 0)
    flag.setPositionOnPlanet(Math.PI / 2, 0);

    // Calculate expected position on the surface (no offset)
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y + PLANET_RADIUS, // At surface level for north pole
      PLANET_CENTER.z
    );

    // The flag should be at the planet surface
    const mesh = flag.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should position correctly at the equator", () => {
    const flag = new Flag("test-positioning-equator");

    // Position at the equator (latitude = 0, longitude = 0)
    flag.setPositionOnPlanet(0, 0);

    // Calculate expected position at the surface
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS, // At surface level for equator at 0 longitude
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    // The flag should be at the planet surface
    const mesh = flag.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should create a flag with default values if not provided", () => {
    const flag = new Flag("test-defaults");

    // Check mesh creation still works
    const mesh = flag.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.children.length).toBeGreaterThan(0);
  });

  it("should return correct flag information", () => {
    const id = "test-info";
    const country = "🇯🇵";
    const description = "Study Abroad";

    const flag = new Flag(id, country, description);
    const info = flag.getInfo();

    // Check the info matches what we provided
    expect(info.country).toBe(country);
    expect(info.description).toBe(description);
  });
});
