import { describe, it, expect, beforeEach } from "vitest";
import { CollisionUtils } from "../CollisionUtils";
import { INpc, NpcType } from "../INpc";
import * as THREE from "three";
import { INTERACTION_DISTANCE } from "@/config/constants";

// Create a mock NPC implementation for testing
class MockNpc implements INpc {
  id: string;
  mesh: THREE.Object3D;
  collisionRadius: number;
  isCollidingWith: Set<string>;

  constructor(id: string, position: THREE.Vector3, collisionRadius: number) {
    this.id = id;
    this.mesh = new THREE.Object3D();
    this.mesh.position.copy(position);
    this.collisionRadius = collisionRadius;
    this.isCollidingWith = new Set<string>();
  }

  getMesh(): THREE.Object3D {
    return this.mesh;
  }

  setPositionOnPlanet(): void {
    // No-op for test
  }

  getType(): NpcType {
    return NpcType.Billboard; // Arbitrary type for testing
  }

  getId(): string {
    return this.id;
  }

  getCollisionRadius(): number {
    return this.collisionRadius;
  }

  getIsCollidingWith(): Set<string> {
    return this.isCollidingWith;
  }

  addIsCollidingWith(id: string): void {
    this.isCollidingWith.add(id);
  }

  removeIsCollidingWith(id: string): void {
    this.isCollidingWith.delete(id);
  }
}

describe("CollisionUtils", () => {
  let player: THREE.Object3D;
  let npc: MockNpc;

  beforeEach(() => {
    player = new THREE.Object3D();
    npc = new MockNpc("npc1", new THREE.Vector3(10, 0, 0), 3);
  });

  describe("calculateDirection", () => {
    it("should calculate the direction vector from npc2 to npc1", () => {
      const direction = CollisionUtils.calculateDirection(
        player.position,
        npc.getMesh().position
      );
      expect(direction.x).toBe(-10); // npc1.x - npc2.x = 0 - 10 = -10
      expect(direction.y).toBe(0);
      expect(direction.z).toBe(0);
    });

    it("should calculate direction with different positions", () => {
      player.position.set(5, 5, 5);
      npc.getMesh().position.set(2, 3, 4);

      const direction = CollisionUtils.calculateDirection(
        player.position,
        npc.getMesh().position
      );
      expect(direction.x).toBe(3); // 5 - 2 = 3
      expect(direction.y).toBe(2); // 5 - 3 = 2
      expect(direction.z).toBe(1); // 5 - 4 = 1
    });

    it("should return a zero vector when NPCs are at the same position", () => {
      npc.getMesh().position.copy(player.position);

      const direction = CollisionUtils.calculateDirection(
        player.position,
        npc.getMesh().position
      );
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(0);
      expect(direction.z).toBe(0);
      expect(direction.length()).toBe(0);
    });
  });

  describe("checkCollision", () => {
    it("should return false when NPCs do not have collision radii", () => {
      // Create an NPC without collision radii
      const npcWithoutRadius = new MockNpc(
        "npcWithoutRadius",
        new THREE.Vector3(0, 0, 0),
        0
      );

      expect(CollisionUtils.checkCollision(player, npcWithoutRadius)).toBe(
        false
      );
    });

    it("should return false when NPCs are not colliding", () => {
      // 10 units apart, with radii 3 and 3, so they don't collide (10 > 3+3)
      expect(CollisionUtils.checkCollision(player, npc)).toBe(false);
    });

    it("should return true when NPCs are colliding", () => {
      // Move npc closer to npc1 so they collide
      npc.getMesh().position.set(3, 0, 0); // Distance is now 3, which is < 3+3

      expect(CollisionUtils.checkCollision(player, npc)).toBe(true);
    });

    it("should return true when NPCs are exactly touching", () => {
      // Position npc so they're exactly touching (distance = sum of radii)
      npc.getMesh().position.set(6, 0, 0); // Distance is 6, which is = 3+3

      expect(CollisionUtils.checkCollision(player, npc)).toBe(false);
    });

    it("should handle 3D collisions correctly", () => {
      // Position NPC in 3D space
      npc.getMesh().position.set(1, 1, 1);

      // distance = sqrt(1² + 1² + 1²) = sqrt(3) ≈ 1.73
      // sum of radii = 5 + 3 = 8
      // collision since 1.73 < 8
      expect(CollisionUtils.checkCollision(player, npc)).toBe(true);

      // Move player slightly further so they don't collide
      npc.getMesh().position.set(5, 5, 5);
      // distance = sqrt(5² + 5² + 5²) = sqrt(75) ≈ 8.66
      // no collision since 8.66 > 8
      expect(CollisionUtils.checkCollision(player, npc)).toBe(false);
    });
  });

  describe("checkInteraction", () => {
    it("should return true when NPCs are interacting", () => {
      npc.getMesh().position.set(3, 0, 0);
      expect(
        CollisionUtils.checkInteraction(player.position, npc.getMesh().position)
      ).toBe(true);
    });

    it("should return false when NPCs are not interacting", () => {
      npc.getMesh().position.set(INTERACTION_DISTANCE * 2, 0, 0);
      expect(
        CollisionUtils.checkInteraction(player.position, npc.getMesh().position)
      ).toBe(false);
    });
  });
});
