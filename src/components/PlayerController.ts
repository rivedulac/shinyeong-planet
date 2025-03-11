import * as THREE from "three";
import { Camera } from "./Camera";

export interface IPlayerController {
  update(deltaTime: number): void;
  getPosition(): THREE.Vector3;
}

export class PlayerController implements IPlayerController {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private camera: Camera;
  private moveSpeed: number;
  private handleKeyDown: (event: KeyboardEvent) => void = () => {};
  private handleKeyUp: (event: KeyboardEvent) => void = () => {};

  // Input state
  private keys: {
    w: boolean;
    s: boolean;
  };

  constructor(camera: Camera, initialPosition = new THREE.Vector3(0, 0, 0)) {
    this.position = initialPosition.clone();
    this.velocity = new THREE.Vector3();
    this.camera = camera;
    this.moveSpeed = 5; // Units per second

    this.keys = {
      w: false,
      s: false,
    };

    // Set up event listeners for keyboard input
    this.setupInputListeners();
  }

  private setupInputListeners(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
          this.keys.w = true;
          break;
        case "s":
          this.keys.s = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
          this.keys.w = false;
          break;
        case "s":
          this.keys.s = false;
          break;
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Store the functions to be able to remove them later
    this.handleKeyDown = handleKeyDown;
    this.handleKeyUp = handleKeyUp;
  }

  public update(deltaTime: number): void {
    // Reset velocity
    this.velocity.set(0, 0, 0);

    // Get camera's forward direction (ignoring Y component for ground movement)
    const cameraDirection = new THREE.Vector3(0, 0, -1); // Forward is -Z in Three.js
    cameraDirection.normalize();

    // Apply movement based on keys pressed
    if (this.keys.w) {
      // Move forward
      this.velocity.add(cameraDirection.clone().multiplyScalar(this.moveSpeed));
    }

    if (this.keys.s) {
      // Move backward
      this.velocity.add(
        cameraDirection.clone().multiplyScalar(-this.moveSpeed)
      );
    }

    // Apply velocity to position
    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.position.add(movement);

    // Update camera position to follow player
    const cameraPosition = this.camera.getPerspectiveCamera().position;
    cameraPosition.copy(this.position);
    // Keep the camera's height (y value)
    cameraPosition.y = 5;
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
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
