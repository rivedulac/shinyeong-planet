import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Camera } from "../../core/Camera";
import * as THREE from "three";
import {
  PLANET_RADIUS,
  FIRST_PERSON_HEIGHT,
  PLANET_CENTER,
  DEFAULT_CAMERA_PITCH,
  EPSILON,
} from "../../config/constants";

// Create a mock window object
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  requestAnimationFrame: vi.fn((cb) => {
    cb(0);
    return 0;
  }),
  dispatchEvent: vi.fn(),
};

// Set up the global window object
vi.stubGlobal("window", mockWindow);

describe("Camera", () => {
  let camera: Camera;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize Camera
    camera = new Camera();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize a PerspectiveCamera with correct parameters", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();

      expect(perspectiveCamera.fov).toBe(75);
      expect(perspectiveCamera.aspect).toBe(
        window.innerWidth / window.innerHeight
      );
      expect(perspectiveCamera.near).toBe(0.1);
      expect(perspectiveCamera.far).toBe(1000);
    });

    it("should initialize with correct position at the equator", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();

      // Check position (now at the equator, longitude 0)
      expect(perspectiveCamera.position.x).toBe(
        PLANET_CENTER.x + PLANET_RADIUS + FIRST_PERSON_HEIGHT
      );
      expect(perspectiveCamera.position.y).toBe(PLANET_CENTER.y);
      expect(perspectiveCamera.position.z).toBe(PLANET_CENTER.z);

      // Check that up vector is initialized correctly for equator position (pointing along X axis)
      const upVector = camera.getUpVector();
      expect(upVector.x).toBeCloseTo(1);
      expect(upVector.y).toBeCloseTo(0);
      expect(upVector.z).toBeCloseTo(0);
    });
  });

  describe("Calculate vectors", () => {
    it("should update direction vector given a quaternion", () => {
      const directionVector = camera.calculateDirectionVector(
        camera.getPerspectiveCamera().quaternion
      );
      camera.getPerspectiveCamera().position.y += 50;
      camera.getPerspectiveCamera().position.z += 50;
      camera.moveOnPlanet(50);
      const newDirectionVector = camera.calculateDirectionVector(
        camera.getPerspectiveCamera().quaternion
      );
      expect(newDirectionVector.x).not.toEqual(directionVector.x);
      expect(newDirectionVector.y).not.toEqual(directionVector.y);
      expect(newDirectionVector.z).not.toEqual(directionVector.z);
    });

    it("should update up vector given a position", () => {
      const upVector = camera.calculateUpVector(
        camera.getPerspectiveCamera().position
      );
      camera.getPerspectiveCamera().position.y += 50;
      camera.getPerspectiveCamera().position.z += 50;
      const newUpVector = camera.calculateUpVector(
        camera.getPerspectiveCamera().position
      );
      expect(newUpVector.x).not.toEqual(upVector.x);
      expect(newUpVector.y).not.toEqual(upVector.y);
      expect(newUpVector.z).not.toEqual(upVector.z);
    });

    it("should update up vector and project on planet given direction vector", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();
      const initialDirectionVector = camera.calculateDirectionVector(
        perspectiveCamera.quaternion
      );
      const initialUpVector = camera.calculateUpVector(
        perspectiveCamera.position
      );
      const intialTangentDirection = camera.projectOnPlanet(
        initialDirectionVector,
        initialUpVector
      );
      perspectiveCamera.position.y += 50;
      perspectiveCamera.position.z += 50;
      perspectiveCamera.quaternion.x += 0.5;
      perspectiveCamera.quaternion.y += 0.5;
      const newDirectionVector = camera.calculateDirectionVector(
        perspectiveCamera.quaternion
      );
      const newUpVector = camera.calculateUpVector(perspectiveCamera.position);
      const newTangentDirection = camera.projectOnPlanet(
        newDirectionVector,
        newUpVector
      );

      expect(newDirectionVector).not.toEqual(initialDirectionVector);
      expect(newUpVector).not.toEqual(initialUpVector);
      expect(newTangentDirection.length()).toBeCloseTo(
        intialTangentDirection.length()
      );
      expect(newTangentDirection.x).not.toEqual(intialTangentDirection.x);
      expect(newTangentDirection.y).not.toEqual(intialTangentDirection.y);
      expect(newTangentDirection.z).not.toEqual(intialTangentDirection.z);
    });

    /* Fix for the quaternion calculation test */
    it("should calculate rotation quaternion given distance, up vector, and tangent direction", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();

      // Get initial vectors
      const initialDirectionVector = camera.calculateDirectionVector(
        perspectiveCamera.quaternion
      );
      const initialUpVector = camera.calculateUpVector(
        perspectiveCamera.position
      );
      const initialTangentDirection = camera.projectOnPlanet(
        initialDirectionVector,
        initialUpVector
      );

      // Calculate rotation quaternion with initial vectors
      const rotationQuaternion = camera.calculateRotation(
        10,
        initialUpVector,
        initialTangentDirection
      );

      // Make a significant change to position and orientation
      perspectiveCamera.position.set(
        perspectiveCamera.position.x + 10,
        perspectiveCamera.position.y - 10,
        perspectiveCamera.position.z + 15
      );

      // Need to change quaternion in a way that will result in different direction
      perspectiveCamera.rotation.set(0.5, 0.3, 0.1);
      perspectiveCamera.updateMatrix();

      // Calculate new vectors with the changed position and orientation
      const newDirectionVector = camera.calculateDirectionVector(
        perspectiveCamera.quaternion
      );
      const newUpVector = camera.calculateUpVector(perspectiveCamera.position);
      const newTangentDirection = camera.projectOnPlanet(
        newDirectionVector,
        newUpVector
      );

      // Calculate new rotation quaternion with different vectors
      const newRotationQuaternion = camera.calculateRotation(
        10, // Same distance
        newUpVector, // Different up vector
        newTangentDirection // Different tangent direction
      );

      // Both quaternions should be normalized (length ≈ 1)
      expect(rotationQuaternion.length()).toBeCloseTo(1);
      expect(newRotationQuaternion.length()).toBeCloseTo(1);

      // The quaternions should be different
      // Check individual components instead of the entire quaternion
      expect(
        newRotationQuaternion.x !== rotationQuaternion.x ||
          newRotationQuaternion.y !== rotationQuaternion.y ||
          newRotationQuaternion.z !== rotationQuaternion.z ||
          newRotationQuaternion.w !== rotationQuaternion.w
      ).toBe(true);
    });
  });

  describe("Move on planet", () => {
    it("should move forward on planet surface when moveOnPlanet is called with positive distance", () => {
      const initialPosition = camera.getPerspectiveCamera().position.clone();

      // Apply a noticeable movement distance
      camera.moveOnPlanet(20);

      const newPosition = camera.getPerspectiveCamera().position;

      // Position should change
      expect(newPosition).not.toEqual(initialPosition);

      // Distance from planet center should remain constant
      const distanceFromCenter = newPosition.distanceTo(PLANET_CENTER);
      expect(distanceFromCenter).toBeCloseTo(
        PLANET_RADIUS + FIRST_PERSON_HEIGHT
      );
    });

    it("should update up vector when moving on the planet", () => {
      // Get initial up vector
      const initialUpVector = camera.getUpVector().clone();

      // Move a significant distance
      camera.moveOnPlanet(30);

      // Get new up vector
      const newUpVector = camera.getUpVector();

      // Up vector should have changed
      expect(newUpVector).not.toEqual(initialUpVector);

      // Up vector should still be normalized
      expect(newUpVector.length()).toBeCloseTo(1);

      // Up vector should point from planet center to camera position
      const expectedUpVector = new THREE.Vector3()
        .subVectors(camera.getPerspectiveCamera().position, PLANET_CENTER)
        .normalize();

      expect(newUpVector.x).toBeCloseTo(expectedUpVector.x);
      expect(newUpVector.y).toBeCloseTo(expectedUpVector.y);
      expect(newUpVector.z).toBeCloseTo(expectedUpVector.z);
    });

    it("should move backward on planet surface when moveOnPlanet is called with negative distance", () => {
      // First move forward to get away from the initial position
      camera.moveOnPlanet(20);
      const intermediatePosition = camera
        .getPerspectiveCamera()
        .position.clone();

      // Now move backward
      camera.moveOnPlanet(-10);
      const newPosition = camera.getPerspectiveCamera().position;

      // Position should change
      expect(newPosition).not.toEqual(intermediatePosition);

      // Distance from planet center should remain constant
      const distanceFromCenter = newPosition.distanceTo(PLANET_CENTER);
      expect(distanceFromCenter).toBeCloseTo(
        PLANET_RADIUS + FIRST_PERSON_HEIGHT
      );

      // Moving backward should bring us closer to the original position
      const distanceToOriginalPosition = newPosition.distanceTo(
        new THREE.Vector3(
          PLANET_CENTER.x + PLANET_RADIUS + FIRST_PERSON_HEIGHT,
          PLANET_CENTER.y,
          PLANET_CENTER.z
        )
      );
      const intermediateToOriginalDistance = intermediatePosition.distanceTo(
        new THREE.Vector3(
          PLANET_CENTER.x + PLANET_RADIUS + FIRST_PERSON_HEIGHT,
          PLANET_CENTER.y,
          PLANET_CENTER.z
        )
      );

      expect(distanceToOriginalPosition).toBeLessThan(
        intermediateToOriginalDistance
      );
    });

    it("should update camera orientation when moving on the planet", () => {
      const initialOrientation = camera
        .getPerspectiveCamera()
        .quaternion.clone();

      // Move forward
      camera.moveOnPlanet(20);

      const newOrientation = camera.getPerspectiveCamera().quaternion;

      // Orientation should change
      expect(newOrientation).not.toEqual(initialOrientation);

      // Camera up vector should match the direction from planet center to camera
      const upVector = camera.getUpVector();
      const cameraUp = camera.getPerspectiveCamera().up;

      expect(cameraUp.x).toBeCloseTo(upVector.x);
      expect(cameraUp.y).toBeCloseTo(upVector.y);
      expect(cameraUp.z).toBeCloseTo(upVector.z);

      // Validate that the camera is looking down a bit to the surface
      // by checking that the look direction is reasonably perpendicular to the up vector
      const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(
        newOrientation
      );
      const dotProduct = Math.abs(lookDir.dot(upVector));

      // Dot product should be close to zero if vectors are perpendicular
      expect(dotProduct).toBeCloseTo(DEFAULT_CAMERA_PITCH, 1);
    });

    it("should return to approximately the same position after moving a full circle", () => {
      // Calculate the distance needed for a full circle
      // Circumference = 2πr
      const radius = PLANET_RADIUS + FIRST_PERSON_HEIGHT;
      const fullCircleDistance = 2 * Math.PI * radius;

      // Store initial position
      const initialPosition = camera.getPerspectiveCamera().position.clone();

      // Move in small increments to complete a full circle
      const steps = 40; // Using more steps for better accuracy
      const stepDistance = fullCircleDistance / steps;

      for (let i = 0; i < steps; i++) {
        camera.moveOnPlanet(stepDistance);
      }

      // Get final position
      const finalPosition = camera.getPerspectiveCamera().position;

      // Should be approximately back at the starting point
      expect(finalPosition.x).toBeCloseTo(initialPosition.x);
      expect(finalPosition.y).toBeCloseTo(initialPosition.y);
      expect(finalPosition.z).toBeCloseTo(initialPosition.z);
    });
  });

  describe("Strafe on planet", () => {
    let camera: Camera;

    beforeEach(() => {
      camera = new Camera();
    });

    describe("Calculate right vector", () => {
      it("should calculate right vector correctly at initial position", () => {
        const perspectiveCamera = camera.getPerspectiveCamera();
        const rightVector = camera.calculateRightVector(
          perspectiveCamera.quaternion
        );

        // At initial position on the equator, right vector should be approximately (0, 0, 1)
        // This is because we're facing the +Z direction with +X to our right
        expect(Math.abs(rightVector.x)).toBeLessThan(EPSILON);
        expect(Math.abs(rightVector.y)).toBeCloseTo(1);
        expect(Math.abs(rightVector.z)).toBeLessThan(EPSILON);
      });

      it("should return a normalized right vector", () => {
        const perspectiveCamera = camera.getPerspectiveCamera();
        const rightVector = camera.calculateRightVector(
          perspectiveCamera.quaternion
        );

        // Length of a normalized vector should be very close to 1
        expect(rightVector.length()).toBeCloseTo(1);
      });

      it("should calculate right vector after rotation", () => {
        const perspectiveCamera = camera.getPerspectiveCamera();
        const initialRightVector = camera.calculateRightVector(
          perspectiveCamera.quaternion
        );

        // Rotate the camera
        camera.rotateYaw(Math.PI / 4);

        const rightVector = camera.calculateRightVector(
          perspectiveCamera.quaternion
        );

        // Right vector should still be normalized
        expect(rightVector.length()).toBeCloseTo(1);

        // Right vector should be different from initial vector
        expect(rightVector).not.toEqual(initialRightVector);
      });
    });

    describe("strafeOnPlanet", () => {
      it("should move sideways on the planet surface", () => {
        const initialPosition = camera.getPerspectiveCamera().position.clone();

        // Strafe a noticeable distance
        camera.strafeOnPlanet(10);

        const newPosition = camera.getPerspectiveCamera().position;

        // Position should change
        expect(newPosition).not.toEqual(initialPosition);

        // Distance from planet center should remain constant
        const distanceFromCenter = newPosition.distanceTo(PLANET_CENTER);
        expect(distanceFromCenter).toBeCloseTo(
          PLANET_RADIUS + FIRST_PERSON_HEIGHT
        );
      });

      it("should handle small strafe distances", () => {
        const initialPosition = camera.getPerspectiveCamera().position.clone();

        // Strafe a very small distance
        camera.strafeOnPlanet(EPSILON / 2);

        const newPosition = camera.getPerspectiveCamera().position;

        // Position should remain essentially the same
        expect(newPosition.x).toBeCloseTo(initialPosition.x);
        expect(newPosition.y).toBeCloseTo(initialPosition.y);
        expect(newPosition.z).toBeCloseTo(initialPosition.z);
      });

      it("should maintain orientation after strafing", () => {
        // First, rotate the camera
        camera.rotateYaw(Math.PI / 4);

        const initialOrientation = camera
          .getPerspectiveCamera()
          .quaternion.clone();

        // Strafe
        camera.strafeOnPlanet(10);

        const newOrientation = camera.getPerspectiveCamera().quaternion;

        // Orientation should remain very close
        const orientationSimilarity = initialOrientation.dot(newOrientation);

        // Allow a bit more tolerance for orientation changes
        expect(orientationSimilarity).toBeGreaterThan(0.9);
      });

      it("should support both positive and negative strafe", () => {
        // First reset camera to a more stable position by moving forward a bit
        camera.moveOnPlanet(5);
        const resetPosition = camera.getPerspectiveCamera().position.clone();

        // Strafe right
        camera.strafeOnPlanet(10);
        const rightPosition = camera.getPerspectiveCamera().position.clone();

        // Reset position
        camera.getPerspectiveCamera().position.copy(resetPosition);

        // Strafe left
        camera.strafeOnPlanet(-10);
        const leftPosition = camera.getPerspectiveCamera().position;

        // Left and right strafe should be somewhat symmetrical
        const rightDistance = resetPosition.distanceTo(rightPosition);
        const leftDistance = resetPosition.distanceTo(leftPosition);

        // Allow some small variation in distance
        expect(Math.abs(rightDistance - leftDistance)).toBeLessThan(1);
      });
    });

    describe("FOV control", () => {
      it("should initialize with the default FOV value", () => {
        expect(camera.getFOV()).toBe(75);
      });

      it("should adjust FOV within the allowed range", () => {
        const initialFOV = camera.getFOV();

        // Decrease FOV (zoom in)
        camera.adjustFOV(-10);
        expect(camera.getFOV()).toBe(initialFOV - 10);

        // Increase FOV (zoom out)
        camera.adjustFOV(15);
        expect(camera.getFOV()).toBe(initialFOV + 5);
      });

      it("should not allow FOV to exceed maximum value", () => {
        // Set FOV to maximum allowed value
        camera.setFOV(120);
        expect(camera.getFOV()).toBe(120);

        // Try to exceed maximum
        camera.adjustFOV(10);
        expect(camera.getFOV()).toBe(120); // Should remain at maximum
      });

      it("should not allow FOV to go below minimum value", () => {
        // Set FOV to minimum allowed value
        camera.setFOV(45);
        expect(camera.getFOV()).toBe(45);

        // Try to go below minimum
        camera.adjustFOV(-10);
        expect(camera.getFOV()).toBe(45); // Should remain at minimum
      });

      it("should clamp FOV when setting to values outside the allowed range", () => {
        // Try setting above maximum
        camera.setFOV(200);
        expect(camera.getFOV()).toBe(120); // Should clamp to maximum

        // Try setting below minimum
        camera.setFOV(30);
        expect(camera.getFOV()).toBe(45); // Should clamp to minimum
      });
    });

    it("should update aspect ratio when handleResize is called", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();
      const spyUpdateProjectionMatrix = vi.spyOn(
        perspectiveCamera,
        "updateProjectionMatrix"
      );

      // Call handleResize
      const newWidth = 1280;
      const newHeight = 720;
      camera.handleResize(newWidth, newHeight);

      // Verify camera aspect was updated
      expect(perspectiveCamera.aspect).toBe(newWidth / newHeight);
      expect(spyUpdateProjectionMatrix).toHaveBeenCalled();
    });
  });
});
