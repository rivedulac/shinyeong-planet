import { describe, it, expect, beforeEach, vi } from "vitest";
import { NpcManager } from "../NpcManager";
import { StaticModel } from "../StaticModel";
import * as THREE from "three";
import { INTERACTION_DISTANCE } from "@/config/constants";

// Mock Three.js Scene
const mockScene = {
  add: vi.fn(),
  remove: vi.fn(),
} as unknown as THREE.Scene;

describe("NpcManager", () => {
  let npcManager: NpcManager;

  beforeEach(() => {
    npcManager = new NpcManager(mockScene);
    vi.clearAllMocks();
  });

  describe("initialize default NPCs", () => {
    it("should create and position default NPCs correctly", () => {
      npcManager.initializeDefaultNpcs();
      const npcs = npcManager.getAllNpcs();

      // Check if all default NPCs were created
      expect(npcs.length).toBe(8); // Total number of default NPCs

      // Verify all NPCs were added to the scene
      expect(mockScene.add).toHaveBeenCalledTimes(8);
    });
  });

  it("should add NPCs to the scene", () => {
    const npc1 = new StaticModel("test-npc-1", "test-npc-1");
    const npc2 = new StaticModel("test-npc-2", "test-npc-2");
    npcManager.addNpc(npc1);
    npcManager.addNpc(npc2);

    // Check that the billboard was added to the scene
    expect(mockScene.add).toHaveBeenCalledWith(npc1.getMesh());
    expect(mockScene.add).toHaveBeenCalledWith(npc2.getMesh());
    // Check that we can retrieve the billboard
    expect(npcManager.getNpc("test-npc-1")).toBe(npc1);
    expect(npcManager.getNpc("test-npc-2")).toBe(npc2);
  });

  it("should remove NPCs from the scene", () => {
    // Add and then remove a billboard
    const npc1 = new StaticModel("test-npc-1", "test-npc-1");
    npcManager.addNpc(npc1);
    npcManager.removeNpc(npc1.getId());

    // Check that the billboard was removed from the scene
    expect(mockScene.remove).toHaveBeenCalledWith(npc1.getMesh());

    // Check that the billboard is no longer retrievable
    expect(npcManager.getNpc(npc1.getId())).toBeUndefined();
  });

  it("should clear all NPCs", () => {
    // Add multiple billboards
    const npc1 = new StaticModel("test-npc-1", "test-npc-1");
    const npc2 = new StaticModel("test-npc-2", "test-npc-2");

    npcManager.addNpc(npc1);
    npcManager.addNpc(npc2);

    // Clear all NPCs
    npcManager.clear();

    // Check that both billboards were removed from the scene
    expect(mockScene.remove).toHaveBeenCalledWith(npc1.getMesh());
    expect(mockScene.remove).toHaveBeenCalledWith(npc2.getMesh());

    // Check that we have no NPCs left
    expect(npcManager.getAllNpcs().length).toBe(0);
  });

  it("should get nearby NPCs", () => {
    const npc1 = new StaticModel("test-npc-1", "test-npc-1");
    const npc2 = new StaticModel("test-npc-2", "test-npc-2");
    const npc3 = new StaticModel("test-npc-3", "test-npc-3");
    npc1.getMesh().position.set(INTERACTION_DISTANCE * 2, 0, 0);
    npc2.getMesh().position.set(INTERACTION_DISTANCE * 0.5, 0, 0);
    npc3.getMesh().position.set(INTERACTION_DISTANCE, 0, 0);
    npcManager.addNpc(npc1);
    npcManager.addNpc(npc2);
    npcManager.addNpc(npc3);

    const nearbyNpcs = npcManager.getNearbyNpcs(new THREE.Vector3(0, 0, 0));
    expect(nearbyNpcs.length).toBe(2);
    expect(nearbyNpcs).not.toContain(npc1);
    expect(nearbyNpcs).toContain(npc2);
    expect(nearbyNpcs).toContain(npc3);
  });

  it("should check interactions with nearby NPCs", () => {
    const npc1 = new StaticModel("test-npc-1", "test-npc-1");
    npc1.getMesh().position.set(INTERACTION_DISTANCE * 2, 0, 0);
    const npc2 = new StaticModel("test-npc-2", "test-npc-2");
    npc2.getMesh().position.set(INTERACTION_DISTANCE, 0, 0);
    npcManager.addNpc(npc1);
    npcManager.addNpc(npc2);

    npcManager.checkInteractions(new THREE.Vector3(0, 0, 0));
    expect(npcManager.getInteractingNpc()).toBe(npc2);

    npc1.getMesh().position.set(INTERACTION_DISTANCE * 0.5, 0, 0);
    npcManager.checkInteractions(new THREE.Vector3(0, 0, 0));
    expect(npcManager.getInteractingNpc()).toBe(npc1);
  });
});
