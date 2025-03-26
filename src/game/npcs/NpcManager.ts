import * as THREE from "three";
import { CollisionUtils } from "./CollisionUtils";
import { StaticModel } from "./StaticModel";
import { AnimatedModel } from "./AnimatedModel";
import { defaultNpcs } from "./config/defaultNpcs";
import { NEARBY_DISTANCE } from "@/config/constants";
export class NpcManager {
  private npcs: Map<string, StaticModel> = new Map();
  private scene: THREE.Scene;
  private interactingNpc: StaticModel | null = null;
  private onStartConversation: ((npc: StaticModel) => void) | null = null;
  private onEndConversation: (() => void) | null = null;

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
    // Clear any existing NPCs
    this.clear();

    // Initialize all default NPCs
    defaultNpcs.forEach((npcInit) => {
      const npc = npcInit.create(this.scene);
      this.addNpc(npc);
    });
  }

  /**
   * Add an NPC to the game
   * @param npc The NPC to add
   */
  public addNpc(npc: StaticModel): void {
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
  public getNpc(id: string): StaticModel | undefined {
    return this.npcs.get(id);
  }

  /**
   * Get all NPCs
   */
  public getAllNpcs(): StaticModel[] {
    return Array.from(this.npcs.values());
  }

  public getInteractingNpc(): StaticModel | null {
    return this.interactingNpc;
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
  ): StaticModel[] {
    const nearbyNpcs: StaticModel[] = [];

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
   * Set callback for when player starts conversation with an NPC
   * @param callback The callback function to call when starting a conversation
   */
  public setOnStartConversation(callback: (npc: StaticModel) => void): void {
    this.onStartConversation = callback;
  }

  /**
   * Set callback for when player ends conversation with an NPC
   * @param callback The callback function to call when ending a conversation
   */
  public setOnEndConversation(callback: () => void): void {
    this.onEndConversation = callback;
  }

  /**
   * Check if player is interacting with any NPCs
   * Start or end conversations based on proximity
   * @param playerPosition The position of the player
   */
  public checkInteractions(position: THREE.Vector3): void {
    // Get nearby NPCs
    const nearbyNpcs = this.getNearbyNpcs(position);

    // Find the closest NPC that player can interact with
    let closestNpc: StaticModel | null = null;
    let closestDistance = Infinity;

    for (const npc of nearbyNpcs) {
      // Check if player is close enough to interact AND conversation is enabled
      if (
        npc.getConversationEnabled() &&
        CollisionUtils.checkInteraction(position, npc.getMesh().position)
      ) {
        // Calculate distance
        const distance = position.distanceTo(npc.getMesh().position);

        // Keep track of the closest NPC
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNpc = npc;
        }
      }
    }

    // If we found an NPC to interact with and it's different from the current one
    if (closestNpc && closestNpc !== this.interactingNpc) {
      // End current conversation if there is one
      if (this.interactingNpc && this.onEndConversation) {
        this.onEndConversation();
      }

      // Start new conversation only if it's enabled
      this.interactingNpc = closestNpc;

      if (this.onStartConversation) {
        this.onStartConversation(closestNpc);
      }
    }
    // If we're not close to any NPC but we were interacting with one before
    else if (!closestNpc && this.interactingNpc) {
      // End current conversation
      if (this.onEndConversation) {
        this.onEndConversation();
      }

      this.interactingNpc = null;
    }
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

  /**
   * Update method to be called in the animation loop
   * @param deltaTime Time elapsed since last frame
   */
  public update(deltaTime: number): void {
    // Update all animated NPCs
    this.npcs.forEach((npc) => {
      if (npc instanceof AnimatedModel) {
        npc.update(deltaTime);
      }
    });
  }
}
