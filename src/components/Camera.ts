/**
 * Camera management class for the game engine.
 * Handles camera positioning, movement, and various camera modes.
 * Integrates with the ECS system to follow entities and handle collisions.
 */
import * as THREE from "three";

export enum CameraMode {
  /** First-person view from player's perspective */
  FirstPerson = "firstPerson",
  // TODO: Follow (Third-person view), Fixed (Static view), Orbit (Around a point)
}

const FIRST_PERSON_HEIGHT = 5;
const FIRST_PERSON_DISTANCE = 10;

export class Camera {
  private camera: THREE.PerspectiveCamera;

  private currentPosition: THREE.Vector3;
  private desiredPosition: THREE.Vector3;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    this.currentPosition = new THREE.Vector3(
      0,
      FIRST_PERSON_HEIGHT,
      FIRST_PERSON_DISTANCE
    );
    this.desiredPosition = new THREE.Vector3(
      0,
      FIRST_PERSON_HEIGHT,
      FIRST_PERSON_DISTANCE
    );

    this.desiredPosition.copy(this.currentPosition);
    this.desiredPosition.y += FIRST_PERSON_HEIGHT;

    this.currentPosition.copy(this.desiredPosition);
    this.camera.position.copy(this.currentPosition);
  }

  getPerspectiveCamera() {
    return this.camera;
  }

  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
