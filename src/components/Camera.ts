/**
 * Camera management class for the game engine.
 * Handles camera positioning, movement, and various camera modes.
 */
import * as THREE from "three";
import {
  PLANET_RADIUS,
  FIRST_PERSON_HEIGHT,
  PLANET_CENTER,
} from "../config/constants";

export enum CameraMode {
  /** First-person view from player's perspective */
  FirstPerson = "firstPerson",
  // TODO: Follow (Third-person view), Fixed (Static view), Orbit (Around a point)
}

export class Camera {
  private camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    this.camera.position.copy(PLANET_CENTER);
    this.camera.position.y += PLANET_RADIUS + FIRST_PERSON_HEIGHT;
    this.camera.lookAt(0, PLANET_RADIUS + FIRST_PERSON_HEIGHT, -1);
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

  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
