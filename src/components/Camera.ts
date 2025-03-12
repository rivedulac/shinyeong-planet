/**
 * Camera management class for the game engine.
 * Handles camera positioning, movement, and various camera modes.
 */
import * as THREE from "three";

export enum CameraMode {
  /** First-person view from player's perspective */
  FirstPerson = "firstPerson",
  // TODO: Follow (Third-person view), Fixed (Static view), Orbit (Around a point)
}

const FIRST_PERSON_HEIGHT = 5;

export class Camera {
  private camera: THREE.PerspectiveCamera;
  private position: THREE.Vector3;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    this.position = new THREE.Vector3(0, FIRST_PERSON_HEIGHT, 0);
    this.camera.position.copy(this.position);
    this.camera.rotation.set(0, 0, 0);

    // Point camera in -Z direction (Three.js default forward direction)
    this.camera.lookAt(0, FIRST_PERSON_HEIGHT, -1);
  }

  getPerspectiveCamera() {
    return this.camera;
  }

  getPerspective(): {
    position: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
  } {
    return {
      position: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },
      rotation: {
        pitch: this.camera.rotation.x,
        yaw: this.camera.rotation.y,
        roll: this.camera.rotation.z,
      },
    };
  }

  public setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.camera.position.copy(this.position);
  }

  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
