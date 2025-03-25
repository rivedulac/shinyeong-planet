import { describe, it, expect } from "vitest";
import { createBillboardMesh } from "../Billboard";
import * as THREE from "three";

describe("Billboard NPC", () => {
  it("should create a billboard with correct properties", () => {
    const title = "My Resume";
    const billboard = createBillboardMesh(title);

    // Check mesh creation
    expect(billboard).toBeInstanceOf(THREE.Group);
    expect(billboard.children.length).toBeGreaterThan(0);
  });
});
