import * as THREE from "three";

export interface IPlayerController {
  update(deltaTime: number): void;
  getPosition(): THREE.Vector3;
}

export class PlayerController implements IPlayerController {
  private velocity: THREE.Vector3;
  private camera: THREE.PerspectiveCamera;
  private handleKeyDown: (event: KeyboardEvent) => void = () => {};
  private handleKeyUp: (event: KeyboardEvent) => void = () => {};
  private movementSpeed = 0.25;
  private rotationSpeed = 0.05;

  // Input state
  private keys: {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
  };

  constructor(camera: THREE.PerspectiveCamera) {
    this.velocity = new THREE.Vector3();
    this.camera = camera;

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
      console.log("*** handleKeyDown", event.key);
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

  public update(): void {
    // Handle yaw rotation (left/right)
    if (this.keys.a) {
      // Rotate left
      console.log("rotating left");
      this.camera.rotation.y += this.rotationSpeed;
    }

    if (this.keys.d) {
      // Rotate right
      console.log("rotating right");
      this.camera.rotation.y -= this.rotationSpeed;
    }

    this.velocity.set(0, 0, 0);

    // Apply movement based on keys pressed
    if (this.keys.w) {
      // Move forward
      console.log("moving forward");
      this.velocity.x = -Math.sin(this.camera.rotation.y) * this.movementSpeed;
      this.velocity.z = -Math.cos(this.camera.rotation.y) * this.movementSpeed;
    }

    if (this.keys.s) {
      // Move backward
      console.log("moving backward");
      this.velocity.x = Math.sin(this.camera.rotation.y) * this.movementSpeed;
      this.velocity.z = Math.cos(this.camera.rotation.y) * this.movementSpeed;
    }

    if (this.velocity.lengthSq() > 0) {
      this.camera.position.x += this.velocity.x;
      this.camera.position.z += this.velocity.z;
      this.camera.updateMatrix();
      console.log("camera position", this.camera.position);
    } else {
      console.log("no velocity");
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
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
