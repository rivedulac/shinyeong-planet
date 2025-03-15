import { describe, it, expect } from "vitest";
import { Person } from "../Person";
import { NpcType } from "../interfaces/INpc";
import * as THREE from "three";
import {
  PLANET_RADIUS,
  PLANET_CENTER,
  DEFAULT_PERSON_CONVERSTAION,
} from "../../../config/constants";

describe("Person NPC", () => {
  it("should create a person with correct properties", () => {
    const id = "test-person";
    const name = "John Doe";

    const person = new Person(id, name);

    // Check ID and type
    expect(person.getId()).toBe(id);
    expect(person.getType()).toBe(NpcType.Person);
    expect(person.getConversation()).toBe(DEFAULT_PERSON_CONVERSTAION);

    // Check mesh creation
    const mesh = person.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.children.length).toBeGreaterThan(0);
  });

  it("should position correctly on the planet surface", () => {
    const person = new Person("test-positioning", "John Doe");

    // Position at the north pole (latitude = PI/2, longitude = 0)
    person.setPositionOnPlanet(Math.PI / 2, 0);

    // Calculate expected position with a small offset
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y + PLANET_RADIUS + 0.2, // Surface + small offset
      PLANET_CENTER.z
    );

    // The person should be at the planet surface (with small offset)
    const mesh = person.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should position correctly at the equator", () => {
    const person = new Person("test-positioning-equator", "John Doe");

    // Position at the equator (latitude = 0, longitude = 0)
    person.setPositionOnPlanet(0, 0);

    // Calculate expected position with a small offset
    const expectedPos = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS + 0.2, // Surface + small offset
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    // The person should be at the planet surface (with small offset)
    const mesh = person.getMesh();
    expect(mesh.position.x).toBeCloseTo(expectedPos.x);
    expect(mesh.position.y).toBeCloseTo(expectedPos.y);
    expect(mesh.position.z).toBeCloseTo(expectedPos.z);
  });

  it("should create a person with default values if not provided", () => {
    const person = new Person("test-defaults", "John Doe");

    const info = person.getInfo();
    expect(info.name).toBe("John Doe");

    // Check mesh creation still works
    const mesh = person.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.children.length).toBeGreaterThan(0);
  });

  it("should return correct person information", () => {
    const id = "test-info";
    const name = "Alice";

    const person = new Person(id, name);
    const info = person.getInfo();

    // Check the info matches what we provided
    expect(info.name).toBe(name);
  });
});
