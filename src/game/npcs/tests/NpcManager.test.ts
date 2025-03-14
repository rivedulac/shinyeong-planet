import { describe, it, expect, beforeEach, vi } from "vitest";
import { NpcManager } from "../NpcManager";
import { Billboard } from "../Billboard";
import * as THREE from "three";
import { Flag } from "../Flag";
import { Person } from "../Person";
import { INTERACTION_DISTANCE } from "@/config/constants";

describe("NpcManager", () => {
  let mockScene: THREE.Scene;
  let npcManager: NpcManager;

  beforeEach(() => {
    // Create a mock scene
    mockScene = new THREE.Scene();

    // Spy on scene methods
    vi.spyOn(mockScene, "add");
    vi.spyOn(mockScene, "remove");

    // Create NPC manager
    npcManager = new NpcManager(mockScene);
  });

  it("should add NPCs to the scene", () => {
    const billboard = new Billboard("test-billboard");
    const flag = new Flag("test-flag");
    npcManager.addNpc(billboard);
    npcManager.addNpc(flag);

    // Check that the billboard was added to the scene
    expect(mockScene.add).toHaveBeenCalledWith(billboard.getMesh());
    expect(mockScene.add).toHaveBeenCalledWith(flag.getMesh());
    // Check that we can retrieve the billboard
    expect(npcManager.getNpc("test-billboard")).toBe(billboard);
    expect(npcManager.getNpc("test-flag")).toBe(flag);
  });

  it("should initialize default NPCs", () => {
    npcManager.initializeDefaultNpcs();

    // Check that at least one NPC was added to the scene
    expect(mockScene.add).toHaveBeenCalled();

    // Check that we have NPCs
    expect(npcManager.getAllNpcs().length).toBeGreaterThan(0);
  });

  it("should remove NPCs from the scene", () => {
    // Add and then remove a billboard
    const billboard = new Billboard("test-billboard-removal");
    npcManager.addNpc(billboard);
    npcManager.removeNpc(billboard.getId());

    // Check that the billboard was removed from the scene
    expect(mockScene.remove).toHaveBeenCalledWith(billboard.getMesh());

    // Check that the billboard is no longer retrievable
    expect(npcManager.getNpc(billboard.getId())).toBeUndefined();
  });

  it("should clear all NPCs", () => {
    // Add multiple billboards
    const billboard1 = new Billboard("test-billboard-1");
    const billboard2 = new Billboard("test-billboard-2");

    npcManager.addNpc(billboard1);
    npcManager.addNpc(billboard2);

    // Clear all NPCs
    npcManager.clear();

    // Check that both billboards were removed from the scene
    expect(mockScene.remove).toHaveBeenCalledWith(billboard1.getMesh());
    expect(mockScene.remove).toHaveBeenCalledWith(billboard2.getMesh());

    // Check that we have no NPCs left
    expect(npcManager.getAllNpcs().length).toBe(0);
  });

  it("should get nearby NPCs", () => {
    const billboard = new Billboard("test-billboard");
    const flag = new Flag("test-flag");
    const person = new Person("test-person", "Jane Doe");
    person.getMesh().position.set(INTERACTION_DISTANCE * 2, 0, 0);
    npcManager.addNpc(billboard);
    npcManager.addNpc(flag);
    npcManager.addNpc(person);

    const nearbyNpcs = npcManager.getNearbyNpcs(new THREE.Vector3(0, 0, 0));
    expect(nearbyNpcs.length).toBe(2);
    expect(nearbyNpcs).toContain(billboard);
    expect(nearbyNpcs).toContain(flag);
    expect(nearbyNpcs).not.toContain(person);
  });

  it("should check interactions with nearby NPCs", () => {
    const billboard = new Billboard("test-billboard");
    billboard.getMesh().position.set(INTERACTION_DISTANCE * 2, 0, 0);
    const person = new Person("test-person", "Jane Doe");
    person.getMesh().position.set(INTERACTION_DISTANCE, 0, 0);
    npcManager.addNpc(billboard);
    npcManager.addNpc(person);

    npcManager.checkInteractions(new THREE.Vector3(0, 0, 0));
    expect(npcManager.getInteractingNpc()).toBe(person);

    billboard.getMesh().position.set(INTERACTION_DISTANCE * 0.5, 0, 0);
    npcManager.checkInteractions(new THREE.Vector3(0, 0, 0));
    expect(npcManager.getInteractingNpc()).toBe(billboard);
  });
});
