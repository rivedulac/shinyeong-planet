import { describe, it, expect } from "vitest";
import { createPersonMesh } from "../Person";
import * as THREE from "three";

describe("Person NPC", () => {
  it("should create a person with correct properties", () => {
    const person = createPersonMesh();

    // Check mesh creation
    expect(person).toBeInstanceOf(THREE.Group);
    expect(person.children.length).toBeGreaterThan(0);
  });
});
