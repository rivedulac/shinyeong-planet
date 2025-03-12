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
  private pitchSpeed = 0.5; // Slower pitch rotation for more natural movement
  private fovAdjustSpeed = 20; // Degrees per second for FOV adjustment

  // Input state
  private keys: {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
    arrowup: boolean;
    arrowdown: boolean;
    plus: boolean; // For increasing FOV
    minus: boolean; // For decreasing FOV
  };

  constructor(camera: Camera) {
    this.camera = camera;
    this.perspectiveCamera = camera.getPerspectiveCamera();

    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
      arrowup: false,
      arrowdown: false,
      plus: false,
      minus: false,
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
        case "arrowup":
          this.keys.arrowup = true;
          break;
        case "arrowdown":
          this.keys.arrowdown = true;
          break;
        case "+":
        case "=": // Same key on most keyboards
          this.keys.plus = true;
          break;
        case "-":
        case "_": // Same key on most keyboards
          this.keys.minus = true;
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
        case "arrowup":
          this.keys.arrowup = false;
          break;
        case "arrowdown":
          this.keys.arrowdown = false;
          break;
        case "+":
        case "=": // Same key on most keyboards
          this.keys.plus = false;
          break;
        case "-":
        case "_": // Same key on most keyboards
          this.keys.minus = false;
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

    // Apply pitch rotation - looking up and down
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
