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
  private strafeSpeed = 8; // Slightly slower than forward/backward movement
  private rotationSpeed = 1;
  private pitchSpeed = 0.5;
  private fovAdjustSpeed = 20;
  private npcManager: NpcManager | null = null;

  // Input state
  private keys: {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
    arrowleft: boolean;
    arrowright: boolean;
    arrowup: boolean;
    arrowdown: boolean;
    plus: boolean;
    minus: boolean;
  };

  // Virtual input methods for external components to trigger
  public triggerKeyDown(key: string): void {
    this.updateKeyState(key.toLowerCase(), true);
  }

  public triggerKeyUp(key: string): void {
    this.updateKeyState(key.toLowerCase(), false);
  }

  constructor(camera: Camera) {
    this.camera = camera;
    this.perspectiveCamera = camera.getPerspectiveCamera();

    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
      arrowleft: false,
      arrowright: false,
      arrowup: false,
      arrowdown: false,
      plus: false,
      minus: false,
    };

    // Set up event listeners for keyboard input
    this.setupInputListeners();
  }

  public setNpcManager(npcManager: NpcManager): void {
    this.npcManager = npcManager;
  }

  // Helper method to update key state (used by both keyboard and virtual inputs)
  private updateKeyState(key: string, isPressed: boolean): void {
    switch (key) {
      case "w":
      case "ㅈ":
        this.keys.w = isPressed;
        break;
      case "s":
      case "ㄴ":
        this.keys.s = isPressed;
        break;
      case "a":
      case "ㅁ":
        this.keys.a = isPressed;
        break;
      case "d":
      case "ㅇ":
        this.keys.d = isPressed;
        break;
      case "arrowleft":
        this.keys.arrowleft = isPressed;
        break;
      case "arrowright":
        this.keys.arrowright = isPressed;
        break;
      case "arrowup":
        this.keys.arrowup = isPressed;
        break;
      case "arrowdown":
        this.keys.arrowdown = isPressed;
        break;
      case "+":
      case "=": // Same key on most keyboards
        this.keys.plus = isPressed;
        break;
      case "-":
      case "_": // Same key on most keyboards
        this.keys.minus = isPressed;
        break;
    }
  }

  private setupInputListeners(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.updateKeyState(event.key.toLowerCase(), true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      this.updateKeyState(event.key.toLowerCase(), false);
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Store the functions to be able to remove them later
    this.handleKeyDown = handleKeyDown;
    this.handleKeyUp = handleKeyUp;
  }

  public update(deltaTime: number = 1): void {
    let movementDistance = 0;
    let strafeDistance = 0;

    // Apply movement based on keys pressed
    if (this.keys.w) {
      // Move forward
      movementDistance = this.movementSpeed * deltaTime;
    }

    if (this.keys.s) {
      // Move backward
      movementDistance = -this.movementSpeed * deltaTime;
    }

    // Apply strafe movement
    if (this.keys.a) {
      // Strafe left
      strafeDistance = -this.strafeSpeed * deltaTime;
    }

    if (this.keys.d) {
      // Strafe right
      strafeDistance = this.strafeSpeed * deltaTime;
    }

    // Apply left/right rotation (yaw)
    if (this.keys.arrowleft) {
      // Rotate left
      this.camera.rotateYaw(this.rotationSpeed * deltaTime);
    }

    if (this.keys.arrowright) {
      // Rotate right
      this.camera.rotateYaw(-this.rotationSpeed * deltaTime);
    }

    // Apply up/down rotation (pitch) - looking up and down
    if (this.keys.arrowup) {
      // Look up (positive angle to look up)
      this.camera.rotatePitch(this.pitchSpeed * deltaTime);
    }

    if (this.keys.arrowdown) {
      // Look down (negative angle to look down)
      this.camera.rotatePitch(-this.pitchSpeed * deltaTime);
    }

    // Handle FOV adjustments
    if (this.keys.plus) {
      // Decrease FOV (zoom in)
      this.camera.adjustFOV(-this.fovAdjustSpeed * deltaTime);
    }

    if (this.keys.minus) {
      // Increase FOV (zoom out)
      this.camera.adjustFOV(this.fovAdjustSpeed * deltaTime);
    }

    // Apply movements
    const originalPosition = this.perspectiveCamera.position.clone();

    // First move forward/backward
    if (movementDistance !== 0) {
      this.camera.moveOnPlanet(movementDistance);
    }

    // Then strafe
    if (strafeDistance !== 0) {
      this.camera.strafeOnPlanet(strafeDistance);
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
