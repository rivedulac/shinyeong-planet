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

  /** Camera's local up direction */
  private up: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  /** Direction from the planet center to the camera's position on the planet surface */
  private planetNormal: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    // Initial position on the surface of the planet (north pole)
    this.setPositionRelativeToPlanet(0, Math.PI / 2);
  }

  /**
   * Sets the camera position and orientation relative to the planet surface
   * Please refer to screenshots/planet-system.png for the coordinate system
   * @param longitude Longitude angle in radians (0 to 2π)
   * @param latitude Latitude angle in radians (-π/2 to π/2)
   */
  public setPositionRelativeToPlanet(
    longitude: number,
    latitude: number
  ): void {
    // Calculate position on the sphere
    const phi = latitude; // latitude (-π/2 to π/2)
    const theta = longitude; // longitude (0 to 2π)

    // Calculate position on the sphere using spherical coordinates
    const x = PLANET_RADIUS * Math.cos(phi) * Math.sin(theta);
    const y = PLANET_RADIUS * Math.sin(phi);
    const z = PLANET_RADIUS * Math.cos(phi) * Math.cos(theta);

    // Set position slightly above the planet surface
    this.planetNormal.set(x, y, z).normalize();

    // Position camera at surface + height along the normal
    this.camera.position
      .copy(PLANET_CENTER)
      .add(
        this.planetNormal
          .clone()
          .multiplyScalar(PLANET_RADIUS + FIRST_PERSON_HEIGHT)
      );

    // Set camera orientation
    // "Up" is away from the planet center (aligned with planetNormal)
    this.up.copy(this.planetNormal);
    this.camera.up.copy(this.up);

    // Look tangent to the surface
    const lookTarget = new THREE.Vector3().copy(this.camera.position);

    // Default forward direction based on longitude (tangent to the surface)
    const forward = new THREE.Vector3(
      -Math.cos(phi) * Math.cos(theta),
      0,
      Math.cos(phi) * Math.sin(theta)
    ).normalize();

    // Adjust forward direction to be perpendicular to up
    const right = new THREE.Vector3()
      .crossVectors(forward, this.up)
      .normalize();
    forward.crossVectors(this.up, right).normalize();

    lookTarget.add(forward);
    this.camera.lookAt(lookTarget);
  }

  /**
   * Moves the camera along the planet surface
   * @param forwardAmount Amount to move forward (tangent to the surface)
   * @param rightAmount Amount to move right (tangent to the surface)
   */
  public moveOnPlanet(forwardAmount: number, rightAmount: number): void {
    // Get current forward and right vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.camera.quaternion
    );
    forward.projectOnPlane(this.up).normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      this.camera.quaternion
    );
    right.projectOnPlane(this.up).normalize();

    // Calculate the movement vector
    const movement = new THREE.Vector3()
      .addScaledVector(forward, forwardAmount)
      .addScaledVector(right, rightAmount);

    // Move the camera
    this.camera.position.add(movement);

    // Project back to the surface + height
    const directionToCenter = this.camera.position
      .clone()
      .sub(PLANET_CENTER)
      .normalize();
    this.planetNormal.copy(directionToCenter);
    this.up.copy(directionToCenter);
    this.camera.up.copy(this.up);

    // Set the correct height from the planet surface
    this.camera.position
      .copy(PLANET_CENTER)
      .add(
        directionToCenter.multiplyScalar(PLANET_RADIUS + FIRST_PERSON_HEIGHT)
      );
  }

  /**
   * Rotates the camera on its current position
   * @param yawAmount Amount to rotate horizontally (in radians)
   * @param pitchAmount Amount to rotate vertically (in radians)
   */
  public rotate(yawAmount: number, pitchAmount: number): void {
    // Yaw rotation (around the up vector)
    if (yawAmount !== 0) {
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(
        this.up,
        yawAmount
      );
      this.camera.quaternion.premultiply(yawQuat);
    }

    // Pitch rotation (around the right vector)
    if (pitchAmount !== 0) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
        this.camera.quaternion
      );
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        right,
        pitchAmount
      );
      this.camera.quaternion.premultiply(pitchQuat);
    }
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
