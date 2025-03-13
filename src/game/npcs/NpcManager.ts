import * as THREE from "three";
import { INpc } from "./INpc";
import { Billboard } from "./Billboard";

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
   * Update all NPCs
   * @param deltaTime Time elapsed since the last update in seconds
   */
  public update(deltaTime: number): void {
    // Update each NPC
    this.npcs.forEach((npc) => {
      npc.update(deltaTime);
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
