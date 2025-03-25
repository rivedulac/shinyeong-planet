import { describe, it, expect } from "vitest";
import { createFlagMesh } from "../Flag";
import * as THREE from "three";

describe("Flag NPC", () => {
  it("should create a flag with correct properties", () => {
    const country = "🇺🇸";
    const description = "Internship";

    const flag = createFlagMesh(country, description);

    // Check mesh creation
    expect(flag).toBeInstanceOf(THREE.Group);
    expect(flag.children.length).toBeGreaterThan(0);
  });
});
