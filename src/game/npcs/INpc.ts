import * as THREE from "three";
import { IConversation } from "./IConversation";

/**
 * Interface for all NPC types in the game
 */
export interface INpc {
  /**
   * Get the Three.js mesh representing this NPC
   */
  getMesh(): THREE.Object3D;

  /**
   * Update the NPC's state based on game time
   * @param deltaTime Time elapsed since the last update in seconds
   */
  update?(deltaTime: number): void;

  /**
   * Set the position of the NPC on the planet surface
   * @param latitude The latitude in radians (0 at equator, π/2 at north pole)
   * @param longitude The longitude in radians (0 to 2π)
   */
  setPositionOnPlanet(latitude: number, longitude: number): void;

  /**
   * Get the type of this NPC
   */
  getType(): NpcType;

  /**
   * Get the unique ID of this NPC
   */
  getId(): string;

  /**
   * Get the collision radius of this NPC
   */
  getCollisionRadius(): number;

  /**
   * Get conversation data for this NPC
   * If not implemented, default conversation data will be used based on NPC type
   */
  getConversation?(): IConversation;

  /**
   * Set conversation data for this NPC
   * @param conversation The conversation data to set
   */
  setConversation?(conversation: IConversation): void;

  /**
   * Get custom info about this NPC to display in the conversation
   * This is specific to each NPC type
   */
  getInfo?(): Record<string, any>;
}

/**
 * Types of NPCs in the game
 */
export enum NpcType {
  Billboard = "Billboard",
  Flag = "Flag",
  Person = "Person",
}
