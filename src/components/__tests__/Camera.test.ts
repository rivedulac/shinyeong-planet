import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Camera } from "../Camera";
import * as THREE from "three";
import {
  PLANET_RADIUS,
  FIRST_PERSON_HEIGHT,
  PLANET_CENTER,
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

    it("should initialize with correct position and orientation", () => {
      const perspectiveCamera = camera.getPerspectiveCamera();

      // Check position (North pole)
      expect(perspectiveCamera.position.x).toBe(PLANET_CENTER.x);
      expect(perspectiveCamera.position.y).toBe(
        PLANET_CENTER.y + PLANET_RADIUS + FIRST_PERSON_HEIGHT
      );
      expect(perspectiveCamera.position.z).toBe(PLANET_CENTER.z);

      // Check that up vector is initialized correctly
      const upVector = camera.getUpVector();
      expect(upVector.x).toBeCloseTo(0);
      expect(upVector.y).toBeCloseTo(1);
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
      expect(newDirectionVector.x).toEqual(directionVector.x); // both zero
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
      expect(newUpVector.x).toEqual(upVector.x);
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
      expect(newTangentDirection.length()).toEqual(
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
      // First move forward to get away from north pole (which is a special case)
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

      // Moving backward should bring us closer to the original position (north pole)
      const distanceToNorthPole = Math.abs(
        newPosition.y - (PLANET_CENTER.y + PLANET_RADIUS + FIRST_PERSON_HEIGHT)
      );
      const intermediateToPoleDistance = Math.abs(
        intermediatePosition.y -
          (PLANET_CENTER.y + PLANET_RADIUS + FIRST_PERSON_HEIGHT)
      );

      expect(distanceToNorthPole).toBeLessThan(intermediateToPoleDistance);
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

      // Validate that the camera is looking tangent to the surface
      // by checking that the look direction is reasonably perpendicular to the up vector
      const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(
        newOrientation
      );
      const dotProduct = Math.abs(lookDir.dot(upVector));

      // Dot product should be close to zero if vectors are perpendicular
      expect(dotProduct).toBeLessThan(0.1);
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

  describe("Camera rotation", () => {
    it("should rotate the camera when rotateYaw is called", () => {
      const initialQuaternion = camera
        .getPerspectiveCamera()
        .quaternion.clone();

      // Apply rotation
      camera.rotateYaw(Math.PI / 4); // 45 degrees

      const newQuaternion = camera.getPerspectiveCamera().quaternion;

      // Quaternion should change
      expect(newQuaternion).not.toEqual(initialQuaternion);

      // Position should remain the same
      const position = camera.getPerspectiveCamera().position;
      expect(position.distanceTo(PLANET_CENTER)).toBeCloseTo(
        PLANET_RADIUS + FIRST_PERSON_HEIGHT
      );

      // The up vector should still point away from the planet center
      const upVector = camera.getUpVector();
      const expectedUpVector = new THREE.Vector3()
        .subVectors(position, PLANET_CENTER)
        .normalize();

      expect(upVector.x).toBeCloseTo(expectedUpVector.x);
      expect(upVector.y).toBeCloseTo(expectedUpVector.y);
      expect(upVector.z).toBeCloseTo(expectedUpVector.z);
    });

    it("should return to approximately the same position after rotating a full circle", () => {
      // First move away from the pole to avoid special case
      camera.moveOnPlanet(20);

      // Store initial direction vector
      const initialDirection = camera.calculateDirectionVector(
        camera.getPerspectiveCamera().quaternion
      );

      // Perform a full 360-degree rotation in small steps
      const steps = 8;
      const stepAngle = (2 * Math.PI) / steps;

      for (let i = 0; i < steps; i++) {
        camera.rotateYaw(stepAngle);
      }

      // Get the new direction vector
      const finalDirection = camera.calculateDirectionVector(
        camera.getPerspectiveCamera().quaternion
      );

      // Should be approximately the same direction after a full rotation
      expect(finalDirection.x).toBeCloseTo(initialDirection.x);
      expect(finalDirection.y).toBeCloseTo(initialDirection.y);
      expect(finalDirection.z).toBeCloseTo(initialDirection.z);
    });

    it("should maintain correct orientation when combining yaw rotation and movement", () => {
      // Move slightly to get away from the poles
      camera.moveOnPlanet(10);

      // Apply a 90-degree yaw and then move forward
      camera.rotateYaw(Math.PI / 2);
      const afterRotationPosition = camera
        .getPerspectiveCamera()
        .position.clone();
      camera.moveOnPlanet(10);

      // Position should have changed, but distance from center should remain the same
      expect(camera.getPerspectiveCamera().position).not.toEqual(
        afterRotationPosition
      );
      expect(
        camera.getPerspectiveCamera().position.distanceTo(PLANET_CENTER)
      ).toBeCloseTo(PLANET_RADIUS + FIRST_PERSON_HEIGHT);

      // Camera's up vector should still be pointing away from the planet center
      const upVector = camera.getUpVector();
      const expectedUpVector = new THREE.Vector3()
        .subVectors(camera.getPerspectiveCamera().position, PLANET_CENTER)
        .normalize();

      expect(upVector.dot(expectedUpVector)).toBeCloseTo(1);
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
