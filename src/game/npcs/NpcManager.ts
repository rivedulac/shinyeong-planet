import * as THREE from "three";
import { INpc } from "./interfaces/INpc";
import { createBillboardMesh } from "./Billboard";
import { createFlagMesh } from "./Flag";
import { createPersonMesh } from "./Person";
import {
  NEARBY_DISTANCE,
  GUEST_BOOK_CONVERSTAION,
  DEFAULT_PERSON_CONVERSTAION,
} from "@/config/constants";
import { CollisionUtils } from "./CollisionUtils";
import { StaticModel } from "./StaticModel";
import { models } from "../../../public/assets";

export class NpcManager {
  private npcs: Map<string, INpc> = new Map();
  private scene: THREE.Scene;
  private interactingNpc: INpc | null = null;
  private onStartConversation: ((npc: INpc) => void) | null = null;
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
    // Create a guest book billboard in front of the starting position
    const billboardMesh = createBillboardMesh("Welcome");
    const welcomeBillboard = new StaticModel(
      "welcome-billboard",
      "Welcome",
      GUEST_BOOK_CONVERSTAION,
      7,
      2,
      billboardMesh
    );
    welcomeBillboard.setPositionOnPlanet(37.2, 0);

    // Set up a custom conversation for the guest book
    welcomeBillboard.setConversation(GUEST_BOOK_CONVERSTAION);

    this.addNpc(welcomeBillboard);

    // Create and add a flag NPC
    const exchangeFlagMesh = createFlagMesh("🇫🇷", "Exchange in Paris");
    const exchangeFlag = new StaticModel(
      "exchange-france",
      "Exchange in Paris",
      DEFAULT_PERSON_CONVERSTAION,
      0,
      1,
      exchangeFlagMesh
    );
    exchangeFlag.setPositionOnPlanet(48.86, 2.34);
    this.addNpc(exchangeFlag);

    const internshipFlagMesh = createFlagMesh("🇺🇸", "2020 Internship");
    const internshipFlag = new StaticModel(
      "internship-usa",
      "2020 Internship",
      DEFAULT_PERSON_CONVERSTAION,
      0,
      2,
      internshipFlagMesh
    );
    internshipFlag.setPositionOnPlanet(37.77, -122.43);
    this.addNpc(internshipFlag);

    const experienceFlagMesh = createFlagMesh("🇰🇷", "2021~ SWE");
    const experienceFlag = new StaticModel(
      "experience-korea",
      "2021~ SWE",
      DEFAULT_PERSON_CONVERSTAION,
      0,
      2,
      experienceFlagMesh
    );
    experienceFlag.setPositionOnPlanet(37.53, 127.02);
    this.addNpc(experienceFlag);

    // Create and add a person NPC
    const personMesh = createPersonMesh();
    const person = new StaticModel(
      "guide-person",
      "Jane",
      DEFAULT_PERSON_CONVERSTAION,
      0,
      2,
      personMesh
    );
    person.setPositionOnPlanet(85.9, 20.1);
    this.addNpc(person);

    // Create and add an animated person NPC
    const alien = new StaticModel(
      "alien",
      "Jane Doe",
      DEFAULT_PERSON_CONVERSTAION,
      -0.5,
      2.5,
      undefined,
      models.alien
    );
    alien.setPositionOnPlanet(22.9, -20.1);
    this.addNpc(alien);

    const iss = new StaticModel(
      "iss",
      "ISS",
      DEFAULT_PERSON_CONVERSTAION,
      100,
      5,
      undefined,
      models.iss
    );
    iss.setPositionOnPlanet(71.6, 11.5);
    this.addNpc(iss);

    const earth = new StaticModel(
      "earth",
      "Earth",
      DEFAULT_PERSON_CONVERSTAION,
      100,
      10,
      undefined,
      models.earth
    );
    earth.setScale(0.05);
    earth.setPositionOnPlanet(71.6, 71.6);
    this.addNpc(earth);

    const astronaut = new StaticModel(
      "astronaut",
      "Astronaut",
      DEFAULT_PERSON_CONVERSTAION,
      40,
      2,
      undefined,
      models.astronaut
    );
    astronaut.setPositionOnPlanet(57.3, -28.6);
    astronaut.setScale(2);
    astronaut.getMesh().rotation.y = -Math.PI / 4;
    this.addNpc(astronaut);
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

  public getInteractingNpc(): INpc | null {
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
   * Set callback for when player starts conversation with an NPC
   * @param callback The callback function to call when starting a conversation
   */
  public setOnStartConversation(callback: (npc: INpc) => void): void {
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
    let closestNpc: INpc | null = null;
    let closestDistance = Infinity;

    for (const npc of nearbyNpcs) {
      // Check if player is close enough to interact
      if (CollisionUtils.checkInteraction(position, npc.getMesh().position)) {
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

      // Start new conversation
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
