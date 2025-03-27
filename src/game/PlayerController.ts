import * as THREE from "three";
import { Camera } from "../core/Camera";
import { CollisionUtils } from "./npcs/CollisionUtils";
import { NpcManager } from "./npcs/NpcManager";

export class PlayerController {
  private camera: Camera;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private handleKeyDown: (event: KeyboardEvent) => void = () => {};
  private handleKeyUp: (event: KeyboardEvent) => void = () => {};
  private movementSpeed = 10;
  private rotationSpeed = 1;
  private pitchSpeed = 0.5;
  private fovAdjustSpeed = 20;
  private npcManager: NpcManager | null = null;

  private movement: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    plus: boolean;
    minus: boolean;
  };

  public triggerMovement(movement: string, isPressed: boolean): void {
    switch (movement) {
      case "forward":
        this.movement.forward = isPressed;
        break;
      case "backward":
        this.movement.backward = isPressed;
        break;
      case "left":
        this.movement.left = isPressed;
        break;
      case "right":
        this.movement.right = isPressed;
        break;
      case "up":
        this.movement.up = isPressed;
        break;
      case "down":
        this.movement.down = isPressed;
        break;
      case "plus":
        this.movement.plus = isPressed;
        break;
      case "minus":
        this.movement.minus = isPressed;
        break;
    }
  }

  constructor(camera: Camera) {
    this.camera = camera;
    this.perspectiveCamera = camera.getPerspectiveCamera();

    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      plus: false,
      minus: false,
    };

    // Initialize key handlers
    this.handleKeyDown = (event: KeyboardEvent): void => {
      switch (event.key) {
        case "ArrowUp":
          this.movement.forward = true;
          break;
        case "ArrowDown":
          this.movement.backward = true;
          break;
        case "ArrowLeft":
          this.movement.left = true;
          break;
        case "ArrowRight":
          this.movement.right = true;
          break;
      }
    };

    this.handleKeyUp = (event: KeyboardEvent): void => {
      switch (event.key) {
        case "ArrowUp":
          this.movement.forward = false;
          break;
        case "ArrowDown":
          this.movement.backward = false;
          break;
        case "ArrowLeft":
          this.movement.left = false;
          break;
        case "ArrowRight":
          this.movement.right = false;
          break;
      }
    };

    // Add event listeners
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  public setNpcManager(npcManager: NpcManager): void {
    this.npcManager = npcManager;
  }

  public update(deltaTime: number = 1): void {
    let movementDistance = 0;

    // Apply movement based on keys pressed
    if (this.movement.forward) {
      // Move forward
      movementDistance = this.movementSpeed * deltaTime;
    }

    if (this.movement.backward) {
      // Move backward
      movementDistance = -this.movementSpeed * deltaTime;
    }

    // Apply left/right rotation (yaw)
    if (this.movement.left) {
      // Rotate left
      this.camera.rotateYaw(this.rotationSpeed * deltaTime);
    }

    if (this.movement.right) {
      // Rotate right
      this.camera.rotateYaw(-this.rotationSpeed * deltaTime);
    }

    // Apply up/down rotation (pitch) - looking up and down
    if (this.movement.up) {
      // Look up (positive angle to look up)
      this.camera.rotatePitch(this.pitchSpeed * deltaTime);
    }

    if (this.movement.down) {
      // Look down (negative angle to look down)
      this.camera.rotatePitch(-this.pitchSpeed * deltaTime);
    }

    // Handle FOV adjustments
    if (this.movement.plus) {
      // Decrease FOV (zoom in)
      this.camera.adjustFOV(-this.fovAdjustSpeed * deltaTime);
    }

    if (this.movement.minus) {
      // Increase FOV (zoom out)
      this.camera.adjustFOV(this.fovAdjustSpeed * deltaTime);
    }

    // Apply movements
    const originalPosition = this.perspectiveCamera.position.clone();

    // First move forward/backward
    if (movementDistance !== 0) {
      this.camera.moveOnPlanet(movementDistance);
    }

    // Check for collisions after movement
    if (this.checkCollisions()) {
      this.perspectiveCamera.position.copy(originalPosition);
    }
  }

  /**
   * Gets the direction vector that the player/camera is looking at
   * @returns A normalized direction vector
   */
  public getLookDirection(): THREE.Vector3 {
    // Get the camera's rotation (Euler angles)
    const rotation = this.getRotation();

    // Create a direction vector pointing forward (0,0,-1) in camera space
    const direction = new THREE.Vector3(0, 0, -1);

    // Create a quaternion from the rotation
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);

    // Apply the quaternion to the direction vector to transform it to world space
    direction.applyQuaternion(quaternion);

    return direction.normalize();
  }

  /**
   * Check for collisions with nearby NPCs and resolve them
   * Now using the optimized nearby check for better performance
   */
  public checkCollisions(): boolean {
    if (!this.npcManager) return false;

    const nearbyNpcs = this.npcManager.getNearbyNpcs(
      this.perspectiveCamera.position
    );

    for (const npc of nearbyNpcs) {
      if (CollisionUtils.checkCollision(this.perspectiveCamera, npc)) {
        return true;
      }
    }
    return false;
  }

  public getPosition(): THREE.Vector3 {
    return this.perspectiveCamera.position.clone();
  }

  public getRotation(): THREE.Euler {
    return this.perspectiveCamera.rotation.clone();
  }

  // Cleanup method to remove event listeners
  public dispose(): void {
    if (this.handleKeyDown) {
      window.removeEventListener("keydown", this.handleKeyDown);
    }
    if (this.handleKeyUp) {
      window.removeEventListener("keyup", this.handleKeyUp);
    }
  }
}
