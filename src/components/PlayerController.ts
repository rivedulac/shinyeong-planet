import * as THREE from "three";
import { Camera } from "./Camera";

export interface IPlayerController {
  update(deltaTime?: number): void;
  getPosition(): THREE.Vector3;
}

export class PlayerController implements IPlayerController {
  private camera: Camera;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private handleKeyDown: (event: KeyboardEvent) => void = () => {};
  private handleKeyUp: (event: KeyboardEvent) => void = () => {};
  private movementSpeed = 10;
  private rotationSpeed = 1;

  // Input state
  private keys: {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
  };

  constructor(camera: Camera) {
    this.camera = camera;
    this.perspectiveCamera = camera.getPerspectiveCamera();

    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
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
        case "a":
          this.keys.a = true;
          break;
        case "d":
          this.keys.d = true;
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
        case "a":
          this.keys.a = false;
          break;
        case "d":
          this.keys.d = false;
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

  public update(deltaTime: number = 1): void {
    let movementDistance = 0;

    // Apply movement based on keys pressed
    if (this.keys.w) {
      // Move forward
      movementDistance = this.movementSpeed * deltaTime;
    }

    if (this.keys.s) {
      // Move backward
      movementDistance = -this.movementSpeed * deltaTime;
    }

    // Apply rotation (yaw) - rotation around the up vector
    if (this.keys.a) {
      // Rotate left
      this.camera.rotateYaw(this.rotationSpeed * deltaTime);
    }

    if (this.keys.d) {
      // Rotate right
      this.camera.rotateYaw(-this.rotationSpeed * deltaTime);
    }

    // If there's movement to apply, use the Camera's moveOnPlanet method
    if (movementDistance !== 0) {
      this.camera.moveOnPlanet(movementDistance);
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.perspectiveCamera.position.clone();
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
