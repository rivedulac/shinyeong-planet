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
  DEFAULT_CAMERA_PITCH,
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

  /** Maximum pitch angle in radians (to prevent over-rotation) */
  private maxPitchAngle: number = Math.PI / 4; // 45 degrees

  /** Current pitch angle */
  private currentPitch: number = 0;

  /** Default, min and max FOV values in degrees */
  private defaultFOV: number = 75;
  private minFOV: number = 45;
  private maxFOV: number = 120;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      this.defaultFOV, // More realistic vertical FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    // Initialize position at the equator (longitude 0) instead of North Pole
    // At equator, the position is (PLANET_CENTER.x + PLANET_RADIUS, PLANET_CENTER.y, PLANET_CENTER.z)
    this.camera.position.set(
      PLANET_CENTER.x + PLANET_RADIUS + FIRST_PERSON_HEIGHT,
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    // Calculate the "up" direction based on position (radially outward from planet center)
    this.up = new THREE.Vector3()
      .subVectors(this.camera.position, PLANET_CENTER)
      .normalize();

    // Point the camera tangent to the planet's surface (looking forward along the equator toward Z)
    const target = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y + PLANET_RADIUS,
      PLANET_CENTER.z
    );

    // Set the camera's up vector before setting orientation
    this.camera.up.copy(this.up);

    // Now look at the target
    this.camera.lookAt(target);

    // Ensure the camera's world matrix is updated
    this.camera.updateMatrixWorld(true);

    // Apply a slight downward tilt for better visual orientation
    this.currentPitch = -DEFAULT_CAMERA_PITCH;
    this.applyStoredPitch();
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

    // Reapply pitch if we had any
    if (Math.abs(this.currentPitch) > EPSILON) {
      this.applyStoredPitch();
    }
  }

  /**
   * Moves the camera sideways (strafing) on the planet surface
   * @param distance Distance to strafe (positive for right, negative for left)
   */
  // TODO: Deprecate this method
  public strafeOnPlanet(distance: number): void {
    // Skip if distance is effectively zero
    if (Math.abs(distance) < EPSILON) return;

    // Calculate the up vector and right vector
    const upVector = this.calculateUpVector(this.camera.position);
    const rightVector = this.calculateRightVector(this.camera.quaternion);

    // Calculate the rotation axis (cross product of up and right)
    const rotationAxis = new THREE.Vector3().crossVectors(
      upVector,
      rightVector
    );

    // Ensure rotation axis is valid
    if (rotationAxis.lengthSq() < EPSILON) {
      // Fallback to a default rotation axis if needed
      rotationAxis.set(1, 0, 0);
    }
    rotationAxis.normalize();

    // Calculate the angle of rotation based on distance and planet curvature
    const angle = distance / (PLANET_RADIUS + FIRST_PERSON_HEIGHT);

    // Create rotation quaternion
    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(rotationAxis, angle);

    // Apply the rotation to the camera position
    this.applyRotation(rotationQuaternion);

    // Recalculate the up vector based on the new position
    const newUpVector = this.calculateUpVector(this.camera.position);

    // Update both the internal up vector and the camera's up vector
    this.up.copy(newUpVector);
    this.camera.up.copy(newUpVector);

    // Reapply pitch if we had any
    if (Math.abs(this.currentPitch) > EPSILON) {
      this.applyStoredPitch();
    }
  }

  /**
   * Rotates the camera around its up vector (yaw)
   * @param angle The angle to rotate in radians
   */
  public rotateYaw(angle: number): void {
    if (Math.abs(angle) < EPSILON) return;

    // Get the current up vector (from planet center to camera)
    const upVector = this.calculateUpVector(this.camera.position);

    // Create a rotation quaternion around the up vector
    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(upVector, angle);

    // Get the current forward direction
    const forward = this.calculateDirectionVector(this.camera.quaternion);

    // Rotate the forward direction
    forward.applyQuaternion(rotationQuaternion);

    // Project the rotated forward direction onto the tangent plane
    const tangentDirection = this.projectOnPlanet(forward, upVector);

    // Calculate the new point to look at
    const lookTarget = new THREE.Vector3();
    lookTarget.addVectors(this.camera.position, tangentDirection);

    // Update the camera's up vector (should still be the same as before)
    this.camera.up.copy(upVector);

    // Make the camera look at the new target
    this.camera.lookAt(lookTarget);

    // Reapply pitch if we had any
    if (Math.abs(this.currentPitch) > EPSILON) {
      this.applyStoredPitch();
    }
  }

  /**
   * Rotates the camera around its right vector (pitch)
   * @param angle The angle to rotate in radians
   */
  public rotatePitch(angle: number): void {
    if (Math.abs(angle) < EPSILON) return;

    // Update the current pitch angle and clamp it within limits
    this.currentPitch += angle;

    // Clamp the pitch to prevent over-rotation
    this.currentPitch = Math.max(
      -this.maxPitchAngle,
      Math.min(this.maxPitchAngle, this.currentPitch)
    );

    this.applyStoredPitch();
  }

  /**
   * Applies the stored pitch angle to the camera
   * This is needed to maintain pitch when moving or rotating
   */
  private applyStoredPitch(): void {
    // Get the current up vector and forward direction
    const upVector = this.up.clone();

    // Get the base forward direction (projected on tangent plane)
    const baseForward = this.calculateDirectionVector(this.camera.quaternion);
    const tangentDirection = this.projectOnPlanet(baseForward, upVector);

    // Calculate the right vector (perpendicular to both up and tangent direction)
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(tangentDirection, upVector).normalize();

    // Create a rotation quaternion around the right vector
    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(rightVector, this.currentPitch);

    // Apply the rotation to the forward direction
    const pitchedDirection = tangentDirection.clone();
    pitchedDirection.applyQuaternion(rotationQuaternion);

    // Calculate the new point to look at
    const lookTarget = new THREE.Vector3();
    lookTarget.addVectors(this.camera.position, pitchedDirection);

    // Make the camera look at the new target
    this.camera.lookAt(lookTarget);
  }

  /**
   * Adjusts the camera's field of view
   * @param amount Amount to change FOV by (in degrees)
   */
  public adjustFOV(amount: number): void {
    // Update FOV
    const newFOV = this.camera.fov + amount;

    // Clamp FOV between min and max values
    this.camera.fov = Math.max(this.minFOV, Math.min(this.maxFOV, newFOV));

    // Update the projection matrix to apply the changes
    this.camera.updateProjectionMatrix();
  }

  /**
   * Sets the camera's field of view directly
   * @param fov New FOV value in degrees
   */
  public setFOV(fov: number): void {
    // Clamp FOV between min and max values
    this.camera.fov = Math.max(this.minFOV, Math.min(this.maxFOV, fov));

    // Update the projection matrix to apply the changes
    this.camera.updateProjectionMatrix();
  }

  /**
   * Gets the current FOV value
   * @returns Current FOV in degrees
   */
  public getFOV(): number {
    return this.camera.fov;
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

  /**
   * Calculate the right vector based on the current camera orientation
   * This vector will be used for strafing movement
   */
  public calculateRightVector(quaternion: THREE.Quaternion): THREE.Vector3 {
    // Create a right vector pointing perpendicular to the forward and up vectors
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(quaternion);

    // Get the up vector for the current position
    const upVector = this.calculateUpVector(this.camera.position);

    // Project the right vector onto the tangent plane of the planet
    const rightComponent = right.clone();
    const upComponent = upVector.clone().multiplyScalar(right.dot(upVector));
    rightComponent.sub(upComponent);

    // If the projected right vector is too small (near poles), use a different approach
    if (rightComponent.lengthSq() < EPSILON) {
      // At poles, use a fallback right vector
      const fallbackRight = new THREE.Vector3(0, 0, 1);
      const fallbackRightComponent = fallbackRight.clone();
      const fallbackUpComponent = upVector
        .clone()
        .multiplyScalar(fallbackRight.dot(upVector));
      fallbackRightComponent.sub(fallbackUpComponent);
      rightComponent.copy(fallbackRightComponent);
    }

    return rightComponent.normalize();
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
