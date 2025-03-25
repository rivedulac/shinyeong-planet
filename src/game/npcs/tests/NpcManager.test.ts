import { describe, it, expect, beforeEach, vi } from "vitest";
import { NpcManager } from "../NpcManager";
import { Billboard } from "../Billboard";
import * as THREE from "three";
import { Flag } from "../Flag";
import { Person } from "../Person";
import { INTERACTION_DISTANCE } from "@/config/constants";
import { INpc } from "../interfaces/INpc";
import { PLANET_CENTER, PLANET_RADIUS } from "@/config/constants";
import { NpcType } from "../interfaces/INpc";

// Mock Three.js Scene
const mockScene = {
  add: vi.fn(),
  remove: vi.fn(),
} as unknown as THREE.Scene;

// Helper function to check positions (now using degrees and accounting for offsets)
const checkNpcPosition = (
  npc: INpc,
  expectedLat: number,
  expectedLon: number
) => {
  const position = npc.getMesh().position;
  const latRad = (expectedLat * Math.PI) / 180;
  const lonRad = (expectedLon * Math.PI) / 180;

  // Convert to Cartesian coordinates
  const phi = Math.PI / 2 - latRad;
  const theta = lonRad;

  // Determine the surface offset based on NPC type
  let surfaceOffset = 0;
  switch (npc.getType()) {
    case NpcType.Billboard:
      surfaceOffset = 7; // Billboard's offset
      break;
    case NpcType.Person:
      surfaceOffset = 0.2; // Person's offset
      break;
    case NpcType.Flag:
      surfaceOffset = 0; // Flag has no offset
      break;
    default:
      surfaceOffset = 0.2; // Default small offset for other types
  }

  const radius = PLANET_RADIUS + surfaceOffset;

  const expectedX = radius * Math.sin(phi) * Math.cos(theta);
  const expectedY = radius * Math.cos(phi);
  const expectedZ = radius * Math.sin(phi) * Math.sin(theta);

  // Allow for some floating point imprecision
  const tolerance = 0.001;

  expect(Math.abs(position.x - (PLANET_CENTER.x + expectedX))).toBeLessThan(
    tolerance
  );
  expect(Math.abs(position.y - (PLANET_CENTER.y + expectedY))).toBeLessThan(
    tolerance
  );
  expect(Math.abs(position.z - (PLANET_CENTER.z + expectedZ))).toBeLessThan(
    tolerance
  );
};

describe("NpcManager", () => {
  let npcManager: NpcManager;

  beforeEach(() => {
    npcManager = new NpcManager(mockScene);
    vi.clearAllMocks();
  });

  describe("initializeDefaultNpcs", () => {
    it("should create and position default NPCs correctly", () => {
      npcManager.initializeDefaultNpcs();
      const npcs = npcManager.getAllNpcs();

      // Check if all default NPCs were created
      expect(npcs.length).toBe(8); // Total number of default NPCs

      // Find NPCs by their IDs
      const guestBook = npcs.find((npc) => npc.getId() === "guest-book");
      const billboard = npcs.find((npc) => npc.getId() === "resume-billboard");
      const flag = npcs.find((npc) => npc.getId() === "experience-usa");
      const person = npcs.find((npc) => npc.getId() === "guide-person");
      const alien = npcs.find((npc) => npc.getId() === "alien");
      const iss = npcs.find((npc) => npc.getId() === "iss");
      const earth = npcs.find((npc) => npc.getId() === "earth");
      const astronaut = npcs.find((npc) => npc.getId() === "astronaut");

      // Verify each NPC exists
      expect(guestBook).toBeDefined();
      expect(billboard).toBeDefined();
      expect(flag).toBeDefined();
      expect(person).toBeDefined();
      expect(alien).toBeDefined();
      expect(iss).toBeDefined();
      expect(earth).toBeDefined();
      expect(astronaut).toBeDefined();

      // Check positions (now using degrees)
      if (guestBook) checkNpcPosition(guestBook, 37.2, 0);
      if (billboard) checkNpcPosition(billboard, 85.9, -85.9);
      if (flag) checkNpcPosition(flag, -85.9, -85.9);
      if (person) checkNpcPosition(person, 85.9, 20.1);

      // Verify all NPCs were added to the scene
      expect(mockScene.add).toHaveBeenCalledTimes(8);
    });
  });

  describe("NPC positioning edge cases", () => {
    it("should handle positioning at the poles", () => {
      npcManager.initializeDefaultNpcs();
      const npcs = npcManager.getAllNpcs();

      // Test positioning at North Pole (90°)
      const northPoleNpc = npcs[0];
      northPoleNpc.setPositionOnPlanet(90, 0);
      checkNpcPosition(northPoleNpc, 90, 0);

      // Test positioning at South Pole (-90°)
      const southPoleNpc = npcs[0];
      southPoleNpc.setPositionOnPlanet(-90, 0);
      checkNpcPosition(southPoleNpc, -90, 0);
    });

    it("should handle positioning at the equator", () => {
      npcManager.initializeDefaultNpcs();
      const npcs = npcManager.getAllNpcs();

      // Test positioning at equator (0°)
      const equatorNpc = npcs[0];
      equatorNpc.setPositionOnPlanet(0, 0);
      checkNpcPosition(equatorNpc, 0, 0);

      // Test positioning at equator with different longitude
      equatorNpc.setPositionOnPlanet(0, 180);
      checkNpcPosition(equatorNpc, 0, 180);
    });

    it("should handle positioning at arbitrary angles", () => {
      npcManager.initializeDefaultNpcs();
      const npcs = npcManager.getAllNpcs();

      const testNpc = npcs[0];
      testNpc.setPositionOnPlanet(45, 45);
      checkNpcPosition(testNpc, 45, 45);
    });
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
