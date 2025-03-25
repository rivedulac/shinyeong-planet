// src/game/npcs/PersonWithModel.ts
import * as THREE from "three";
import {
  PLANET_CENTER,
  PLANET_RADIUS,
  DEFAULT_PERSON_CONVERSTAION,
  DEFAULT_NPC_RADIUS,
} from "../../config/constants";
import { IConversation } from "./interfaces/IConversation";
import { loadModel as loadModelAsync } from "../../utils/modelLoader";

/**
 * Person NPC - represents a human character on the planet
 * Now with support for GLB models
 */
export class StaticModel {
  private id: string;
  private mesh: THREE.Group;
  private name: string;
  private collisionRadius: number;
  private conversation: IConversation;
  private modelPath: string | undefined;
  private isModelLoaded: boolean = false;
  private scale: number = 0.75;
  private groundOffset: number;

  /**
   * Create a new Person NPC
   * @param id Unique identifier for this NPC
   * @param name Name of the person
   * @param modelPath Path to the GLB model file (optional)
   * @param conversation The conversation data to set
   */
  constructor(
    id: string,
    name: string,
    conversation: IConversation = DEFAULT_PERSON_CONVERSTAION,
    zOffset: number = 0,
    radius: number = DEFAULT_NPC_RADIUS,
    mesh?: THREE.Group,
    modelPath?: string
  ) {
    this.id = id;
    this.name = name;
    this.collisionRadius = radius;
    this.mesh = mesh || new THREE.Group();
    this.modelPath = modelPath;
    // TODO: Optimize. For models that do not need to have a conversation with
    // the player, skip the conversation property
    this.conversation = conversation;
    this.groundOffset = zOffset;

    // If a model path is provided, load it
    if (this.modelPath) {
      this.loadModel();
    }
  }

  public getId(): string {
    return this.id;
  }

  public getMesh(): THREE.Object3D {
    return this.mesh;
  }

  public getConversation(): IConversation {
    return this.conversation;
  }

  public setConversation(conversation: IConversation): void {
    this.conversation = conversation;
  }

  /**
   * Load the GLB model
   */
  private async loadModel(): Promise<void> {
    try {
      if (!this.modelPath) {
        console.error(`No model path provided for NPC ${this.id}`);
        return;
      }

      const result = await loadModelAsync(this.modelPath);

      // Clear any existing children from the mesh group
      while (this.mesh.children.length > 0) {
        const child = this.mesh.children[0];
        this.mesh.remove(child);
      }

      // Add the loaded model to our mesh group
      this.mesh.add(result.scene);

      // Apply default scale
      result.scene.scale.set(this.scale, this.scale, this.scale);

      this.isModelLoaded = true;
      console.log(`Model loaded for ${this.name}`);
    } catch (error) {
      console.error(`Failed to load model for NPC ${this.id}:`, error);
    }
  }

  /** Position the person on the planet surface */
  public setPositionOnPlanet(latitude: number, longitude: number): void {
    // Convert degrees to radians
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;

    // Convert spherical coordinates to Cartesian
    const phi = Math.PI / 2 - latRad; // Convert latitude to phi angle
    const theta = lonRad; // Longitude maps directly to theta

    // Calculate the position on the planet surface
    const x =
      (PLANET_RADIUS + this.groundOffset) * Math.sin(phi) * Math.cos(theta);
    const y = (PLANET_RADIUS + this.groundOffset) * Math.cos(phi);
    const z =
      (PLANET_RADIUS + this.groundOffset) * Math.sin(phi) * Math.sin(theta);

    // Create normal vector (points outward from planet center)
    const normal = new THREE.Vector3(x, y, z).normalize();

    // Add a small offset to ensure the person is standing on the surface
    const surfaceOffset = 0.2; // Just a small offset to prevent z-fighting

    // Position the person on the planet surface with offset
    this.mesh.position.set(
      PLANET_CENTER.x + x + normal.x * surfaceOffset,
      PLANET_CENTER.y + y + normal.y * surfaceOffset,
      PLANET_CENTER.z + z + normal.z * surfaceOffset
    );

    // Reset rotation first
    this.mesh.rotation.set(0, 0, 0);

    // The mesh needs to be oriented so that its Y-axis aligns with the normal vector
    // And its other axes are perpendicular to the normal vector

    // Get the "world up" direction
    const worldUp = new THREE.Vector3(0, 1, 0);

    // Calculate a right vector perpendicular to both normal and world up
    const right = new THREE.Vector3().crossVectors(normal, worldUp).normalize();

    // If we're at or near the poles, the right vector might be very small
    if (right.lengthSq() < 0.01) {
      // At poles, pick an arbitrary right direction
      if (normal.y > 0) {
        // North pole
        right.set(1, 0, 0);
      } else {
        // South pole
        right.set(-1, 0, 0);
      }
    }

    // Recalculate the forward direction that's perpendicular to both right and normal
    const forward = new THREE.Vector3().crossVectors(right, normal).normalize();

    // Create rotation matrix
    const rotMatrix = new THREE.Matrix4().makeBasis(
      right, // x-axis (right)
      normal, // y-axis (up = normal)
      forward // z-axis (forward)
    );

    // Apply the rotation
    this.mesh.setRotationFromMatrix(rotMatrix);

    // Additional rotation to face the right direction
    this.mesh.rotateY(Math.PI);
  }

  /** Get information about this person */
  public getInfo(): { name: string } {
    return {
      name: this.name,
    };
  }

  public getCollisionRadius(): number {
    return this.collisionRadius;
  }

  /**
   * Set the scale of the model
   * @param scale Scale factor
   */
  public setScale(scale: number): void {
    this.scale = scale;

    // Apply scale to the model if it's loaded
    if (this.isModelLoaded && this.mesh.children.length > 0) {
      this.mesh.children[0].scale.set(scale, scale, scale);
    }
  }
}
