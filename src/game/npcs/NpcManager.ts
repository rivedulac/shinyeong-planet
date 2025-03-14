import * as THREE from "three";
import { INpc } from "./INpc";
import { Billboard } from "./Billboard";
import { Flag } from "./Flag";
import { NEARBY_DISTANCE } from "@/config/constants";

export class NpcManager {
  private npcs: Map<string, INpc> = new Map();
  private scene: THREE.Scene;

  /**
   * Create a new NPC Manager
   * @param scene The Three.js scene to add NPCs to
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize default NPCs in the game
   */
  public initializeDefaultNpcs(): void {
    // Create and add a billboard NPC
    const billboard = new Billboard("resume-billboard", "My Resume");

    // Position the billboard at latitude 0 (equator), longitude 0 (prime meridian)
    billboard.setPositionOnPlanet(0, 0);

    this.addNpc(billboard);

    // Create and add a flag NPC
    const flag = new Flag("experience-usa", "🇺🇸", "2020 Internship");

    // Position the flag at latitude 0 (equator), longitude 0 (prime meridian)
    flag.setPositionOnPlanet(0.2, 0.5);

    this.addNpc(flag);
  }

  /**
   * Add an NPC to the game
   * @param npc The NPC to add
   */
  public addNpc(npc: INpc): void {
    const id = npc.getId();

    // Add to our internal map
    this.npcs.set(id, npc);

    // Add the NPC's mesh to the scene
    this.scene.add(npc.getMesh());
  }

  /**
   * Remove an NPC from the game
   * @param id The ID of the NPC to remove
   */
  public removeNpc(id: string): void {
    const npc = this.npcs.get(id);
    if (npc) {
      // Remove from scene
      this.scene.remove(npc.getMesh());

      // Remove from our map
      this.npcs.delete(id);
    }
  }

  /**
   * Get an NPC by ID
   * @param id The ID of the NPC to get
   */
  public getNpc(id: string): INpc | undefined {
    return this.npcs.get(id);
  }

  /**
   * Get all NPCs
   */
  public getAllNpcs(): INpc[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Find NPCs that are within a certain distance of a position
   * This helps optimize collision detection by only checking nearby NPCs
   *
   * @param position The position to check from
   * @param maxDistance The maximum distance to consider an NPC "nearby" (defaults to NEARBY_DISTANCE)
   * @returns Array of nearby NPCs
   */
  public getNearbyNpcs(
    position: THREE.Vector3,
    maxDistance: number = NEARBY_DISTANCE
  ): INpc[] {
    const nearbyNpcs: INpc[] = [];

    // Calculate squared max distance for more efficient comparison
    const maxDistanceSquared = maxDistance * maxDistance;

    // Check each NPC
    for (const npc of this.npcs.values()) {
      const npcPosition = npc.getMesh().position;

      // Calculate squared distance (faster than actual distance)
      const dx = position.x - npcPosition.x;
      const dy = position.y - npcPosition.y;
      const dz = position.z - npcPosition.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;

      // If NPC is within range, add it to the nearby list
      if (distanceSquared <= maxDistanceSquared) {
        nearbyNpcs.push(npc);
      }
    }

    return nearbyNpcs;
  }

  /**
   * Update all NPCs
   * @param deltaTime Time elapsed since the last update in seconds
   */
  public update(deltaTime: number): void {
    // Update each NPC
    this.npcs.forEach((npc) => {
      npc.update?.(deltaTime);
    });
  }

  /**
   * Clear all NPCs
   */
  public clear(): void {
    // Remove all NPCs from the scene
    this.npcs.forEach((npc) => {
      this.scene.remove(npc.getMesh());
    });

    // Clear the map
    this.npcs.clear();
  }
}
