// CollisionUtils.ts - Utility functions for collision detection

import { PLAYER_RADIUS } from "@/config/constants";
import { INpc } from "./INpc";
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
  static checkCollision(player: THREE.Object3D, npc: INpc): boolean {
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
   * Resolve collision by moving the player away from the NPC
   */
  static resolveNpcCollision(player: THREE.Object3D, npc: INpc): void {
    const direction = this.calculateDirection(
      player.position,
      npc.getMesh().position
    );
    const dx = direction.x;
    const dy = direction.y;
    const dz = direction.z;

    // Move npc1 away from npc2
    player.position.x += dx;
    player.position.y += dy;
    player.position.z += dz;
    player.updateMatrix();
  }
}
