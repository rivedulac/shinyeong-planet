import { PLAYER_RADIUS, INTERACTION_DISTANCE } from "@/config/constants";
import { StaticModel } from "./StaticModel";
import * as THREE from "three";

export class CollisionUtils {
  static calculateDirection(
    position1: THREE.Vector3,
    position2: THREE.Vector3
  ): THREE.Vector3 {
    const dx = position1.x - position2.x;
    const dy = position1.y - position2.y;
    const dz = position1.z - position2.z;
    return new THREE.Vector3(dx, dy, dz);
  }

  /**
   * Check if two NPCs are colliding
   * @returns null if no collision, or collision data if colliding
   */
  static checkCollision(player: THREE.Object3D, npc: StaticModel): boolean {
    // Ensure both NPCs have collision radii defined
    if (!npc.getCollisionRadius()) {
      return false;
    }

    // Calculate displacement vector
    const direction = this.calculateDirection(
      player.position,
      npc.getMesh().position
    );
    const distance = direction.length();

    // Calculate sum of radii
    const radiusSum = npc.getCollisionRadius() + PLAYER_RADIUS;

    // Check if collision is happening
    if (distance >= radiusSum) {
      return false;
    }
    return true;
  }

  /**
   * Check if two NPCs are colliding
   * @returns null if no collision, or collision data if colliding
   */
  static checkInteraction(
    position1: THREE.Vector3,
    position2: THREE.Vector3
  ): boolean {
    // Calculate displacement vector
    const direction = this.calculateDirection(position1, position2);
    const distance = direction.length();
    return distance <= INTERACTION_DISTANCE;
  }
}
