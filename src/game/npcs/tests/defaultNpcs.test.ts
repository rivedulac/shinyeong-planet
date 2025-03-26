import * as THREE from "three";
import { describe, it, expect } from "vitest";
import { defaultNpcs } from "../config/defaultNpcs";
import { StaticModel } from "../StaticModel";
import { AnimatedModel } from "../AnimatedModel";

describe("Default NPCs", () => {
  it("should create all NPCs successfully", () => {
    defaultNpcs.forEach((npcInit) => {
      const npc = npcInit.create(new THREE.Scene());
      expect(npc).toBeInstanceOf(StaticModel);
      expect(npc.getId()).toBeDefined();
      expect(npc.getName()).toBeDefined();
    });
  });

  it("should create cow with correct animation", () => {
    const cowConfig = defaultNpcs[defaultNpcs.length - 1];
    const cow = cowConfig.create(new THREE.Scene());
    expect(cow).toBeInstanceOf(AnimatedModel);
    expect(cow.getId()).toBe("friendly-cow");
    // @ts-ignore - accessing private property for testing
    expect(cow["initialAnimation"]).toBe("Attack_Headbutt");
  });
});
