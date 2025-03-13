import * as THREE from "three";
import { INpc, NpcType } from "./INpc";
import { PLANET_CENTER, PLANET_RADIUS } from "../../config/constants";

/**
 * Flag NPC - represents a country flag with location, year, and description
 */
export class Flag implements INpc {
  private id: string;
  private mesh: THREE.Group;
  private country: string;
  private description: string;

  /**
   * Create a new Flag NPC
   * @param id Unique identifier for this NPC
   * @param country The country flag emoji
   * @param location The city/state name
   * @param year The year of experience
   * @param description Short description text
   */
  constructor(
    id: string,
    country: string = "🇺🇸",
    description: string = "Internship"
  ) {
    this.id = id;
    this.country = country;
    this.description = description;
    this.mesh = this.createFlagMesh();
  }

  public getId(): string {
    return this.id;
  }

  public getType(): NpcType {
    return NpcType.Flag;
  }

  public getMesh(): THREE.Object3D {
    return this.mesh;
  }

  // @ts-ignore: TBD for animation
  public update(deltaTime: number): void {
    // Will be used for future animations if needed
  }

  /** Position the flag on the planet surface */
  public setPositionOnPlanet(latitude: number, longitude: number): void {
    // Convert spherical coordinates to Cartesian
    const phi = Math.PI / 2 - latitude; // Convert latitude to phi angle
    const theta = longitude; // Longitude maps directly to theta

    // Calculate the position on the planet surface
    const x = PLANET_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = PLANET_RADIUS * Math.cos(phi);
    const z = PLANET_RADIUS * Math.sin(phi) * Math.sin(theta);

    // Create normal vector (points outward from planet center)
    const normal = new THREE.Vector3(x, y, z).normalize();

    // Position the flag directly on the planet surface (no offset)
    this.mesh.position.set(
      PLANET_CENTER.x + x,
      PLANET_CENTER.y + y,
      PLANET_CENTER.z + z
    );

    // Reset rotation first
    this.mesh.rotation.set(0, 0, 0);

    // The mesh needs to be oriented so that its Y-axis aligns with the normal vector
    // And its other axes are perpendicular to the normal vector

    // Get the "world up" direction
    const worldUp = new THREE.Vector3(0, 1, 0);

    // Create a rotation matrix that aligns the local Y-axis with the normal vector
    // This makes the pole stand perpendicular to the planet surface

    // First, calculate a right vector perpendicular to both normal and world up
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
  }

  /**
   * Create the flag mesh with flag pole and the actual flag
   */
  private createFlagMesh(): THREE.Group {
    const group = new THREE.Group();

    // Create flag pole
    const poleHeight = 10; // Pole height
    const poleRadius = 0.15;
    const poleGeometry = new THREE.CylinderGeometry(
      poleRadius,
      poleRadius * 1.2,
      poleHeight,
      8
    );
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown wood-like color
      roughness: 0.9,
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);

    // Position the pole so it extends upward from the surface
    pole.position.set(0, poleHeight / 2, 0);

    // Create the actual flag
    const flagWidth = 5;
    const flagHeight = 3;
    const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight, 8, 8);
    const flagMaterial = new THREE.MeshStandardMaterial({
      map: this.createFlagTexture(),
      side: THREE.DoubleSide,
      transparent: true,
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);

    // Position flag on the side of the pole
    // Offset by half flag width so the left edge touches the pole
    flag.position.set(flagWidth / 2, poleHeight * 0.85, 0);

    // Add a small base/stand for the pole
    const baseRadius = 0.4;
    const baseHeight = 0.2;
    const baseGeometry = new THREE.CylinderGeometry(
      baseRadius,
      baseRadius,
      baseHeight,
      8
    );
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Darker brown
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.1, 0); // Just above the surface

    // Add all elements to the group
    group.add(base);
    group.add(pole);
    group.add(flag);

    return group;
  }

  /**
   * Create a texture for the flag with all information
   */
  private createFlagTexture(): THREE.Texture {
    // Create a canvas to draw on
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context for canvas");
      return new THREE.Texture();
    }

    // Fill background with a light color
    ctx.fillStyle = "rgba(240, 240, 255, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a slight border
    ctx.strokeStyle = "rgba(50, 50, 50, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Draw country flag emoji and location on the top row
    ctx.font = "bold 240px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(this.country, canvas.width / 2, 180);

    // Draw year and description on the bottom row
    ctx.font = "bold 60px Arial";
    ctx.fillText(this.description, canvas.width / 2, 240);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Get the flag's information
   * @returns Object containing the flag's data
   */
  public getInfo(): {
    country: string;
    description: string;
  } {
    return {
      country: this.country,
      description: this.description,
    };
  }
}
