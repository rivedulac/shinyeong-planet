/**
 * Camera management class for the game engine.
 * Handles camera positioning, movement, and various camera modes.
 */
import * as THREE from "three";
import {
  PLANET_RADIUS,
  FIRST_PERSON_HEIGHT,
  PLANET_CENTER,
  EPSILON,
} from "../config/constants";

export enum CameraMode {
  /** First-person view from player's perspective */
  FirstPerson = "firstPerson",
  // TODO: Follow (Third-person view), Fixed (Static view), Orbit (Around a point)
}

export class Camera {
  private camera: THREE.PerspectiveCamera;

  /** Camera's local up direction */
  private up: THREE.Vector3;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    // Initial position on the north pole of the planet
    this.camera.position.copy(PLANET_CENTER);
    this.camera.position.y += PLANET_RADIUS + FIRST_PERSON_HEIGHT;

    // Calculate the "up" direction based on position (initially pointing along Y)
    this.up = new THREE.Vector3(0, 1, 0);

    // Point the camera tangent to the planet surface
    this.camera.lookAt(0, PLANET_RADIUS + FIRST_PERSON_HEIGHT, -1);
  }

  getPerspectiveCamera() {
    return this.camera;
  }

  getPerspectivePosition(): {
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

  /**
   * Moves the camera forward or backward on the planet surface
   * @param distance Distance to move (positive for forward, negative for backward)
   */
  moveOnPlanet(distance: number): void {
    // Skip if distance is effectively zero
    if (Math.abs(distance) < EPSILON) return;

    // Calculate the up vector and direction vector
    const direction = this.calculateDirectionVector(this.camera.quaternion);
    const upVector = this.calculateUpVector(this.camera.position);

    // Set the camera's up vector to match
    this.up.copy(upVector);

    // Calculate the tangent direction
    const tangentDirection = this.projectOnPlanet(direction, upVector);

    // Calculate the rotation
    const rotationQuaternion = this.calculateRotation(
      distance,
      upVector,
      tangentDirection
    );

    // Apply the rotation to the camera position
    this.applyRotation(rotationQuaternion);

    // Recalculate the up vector based on the new position
    const newUpVector = this.calculateUpVector(this.camera.position);

    // Update both the internal up vector and the camera's up vector
    this.up.copy(newUpVector);
    this.camera.up.copy(newUpVector);

    // Update the camera orientation to look tangent to the surface
    const newLookDirection = tangentDirection.clone();
    newLookDirection.applyQuaternion(rotationQuaternion);

    // Calculate the point to look at
    const lookTarget = new THREE.Vector3();
    lookTarget.addVectors(this.camera.position, newLookDirection);

    // Make the camera look at the target
    this.camera.lookAt(lookTarget);
  }

  public handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Gets the current up vector for the camera (direction from planet center to camera)
   * @returns The normalized up vector
   */
  public getUpVector(): THREE.Vector3 {
    return this.up.clone();
  }

  public calculateDirectionVector(quaternion: THREE.Quaternion): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(quaternion);
    return direction;
  }

  public calculateUpVector(position: THREE.Vector3): THREE.Vector3 {
    const upVector = new THREE.Vector3();
    upVector.subVectors(position, PLANET_CENTER).normalize();
    return upVector;
  }

  /** Projects a direction vector onto the tangent plane of the planet */
  public projectOnPlanet(
    direction: THREE.Vector3,
    upVector: THREE.Vector3
  ): THREE.Vector3 {
    // Calculate the tangent direction by projecting the direction vector onto the tangent plane
    const tangentDirection = new THREE.Vector3();
    tangentDirection.copy(direction);

    // Calculate the component of the direction vector that is parallel to the up vector
    const upComponent = upVector
      .clone()
      .multiplyScalar(direction.dot(upVector));
    tangentDirection.sub(upComponent);

    // Skip if the tangent direction is effectively zero (happens at poles)
    if (tangentDirection.lengthSq() < EPSILON) {
      // At poles, use an axis perpendicular to up (e.g., along Z-axis)
      tangentDirection.set(0, 0, -1);
      const upDot = tangentDirection.dot(upVector);
      tangentDirection.sub(upVector.clone().multiplyScalar(upDot));
    }

    tangentDirection.normalize();

    return tangentDirection;
  }

  /** Calculates the rotation quaternion based on distance, up vector and tangent direction */
  public calculateRotation(
    distance: number,
    upVector: THREE.Vector3,
    tangentDirection: THREE.Vector3
  ): THREE.Quaternion {
    // Calculate the axis of rotation (cross product of up and tangent direction)
    const rotationAxis = new THREE.Vector3();
    rotationAxis.crossVectors(upVector, tangentDirection);

    // Check if rotation axis is valid (can be invalid at poles)
    if (rotationAxis.lengthSq() < EPSILON) {
      // At poles, use an axis perpendicular to up (e.g., along X-axis)
      rotationAxis.set(1, 0, 0);
      // Ensure it's perpendicular to up
      const upDot = rotationAxis.dot(upVector);
      rotationAxis.sub(upVector.clone().multiplyScalar(upDot));
    }
    rotationAxis.normalize();

    const angle = distance / (PLANET_RADIUS + FIRST_PERSON_HEIGHT);

    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(rotationAxis, angle);

    return rotationQuaternion;
  }

  /** Applies a rotation quaternion to the camera position */
  public applyRotation(quaternion: THREE.Quaternion): void {
    const radialVector = new THREE.Vector3();
    radialVector.subVectors(this.camera.position, PLANET_CENTER);
    radialVector.applyQuaternion(quaternion);

    const newPosition = new THREE.Vector3();
    newPosition.addVectors(PLANET_CENTER, radialVector);
    this.camera.position.copy(newPosition);
  }
}
