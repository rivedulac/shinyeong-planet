import * as THREE from "three";
import { INpc, NpcType } from "./interfaces/INpc";
import {
  PLANET_CENTER,
  PLANET_RADIUS,
  PERSON_RADIUS,
  DEFAULT_PERSON_CONVERSTAION,
} from "../../config/constants";
import { IConversation } from "./interfaces/IConversation";

/**
 * Person NPC - represents a human character on the planet
 */
export class Person implements INpc {
  private id: string;
  private mesh: THREE.Group;
  private name: string;
  private collisionRadius: number;
  private conversation: IConversation;
  /**
   * Create a new Person NPC
   * @param id Unique identifier for this NPC
   * @param name Name of the person
   * @param conversation The conversation data to set
   */
  constructor(
    id: string,
    name: string,
    conversation: IConversation = DEFAULT_PERSON_CONVERSTAION
  ) {
    this.id = id;
    this.name = name;
    this.collisionRadius = PERSON_RADIUS;
    this.mesh = this.createPersonMesh();
    this.conversation = conversation;
  }

  public getId(): string {
    return this.id;
  }

  public getType(): NpcType {
    return NpcType.Person;
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

  /** Position the person on the planet surface */
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
    this.mesh.rotateY((Math.PI / 4) * 3);
  }

  /**
   * Creates a simple human figure using Three.js primitives
   */
  private createPersonMesh(): THREE.Group {
    const group = new THREE.Group();

    // Colors
    const skinColor = 0xf0c080;
    const shirtColor = 0x3080e0;
    const pantsColor = 0x303040;
    const shoeColor = 0x000000;

    // Create head
    const headRadius = 0.5;
    const headGeometry = new THREE.SphereGeometry(headRadius, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3.2; // Position head at the top

    // Create torso - note the reversed order of radii (wider at shoulders, narrower at waist)
    const torsoGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 8);
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 2; // Position torso below head

    // Create legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: pantsColor });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0.6, 0);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0.6, 0);

    // Create arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.85, 2.2, 0);
    leftArm.rotation.z = -Math.PI / 6; // Tilt arm slightly outward

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.85, 2.2, 0);
    rightArm.rotation.z = Math.PI / 6; // Tilt arm slightly outward
    // Rotate arm 90 degrees to make it horizontal rather than vertical

    // Create shoes
    const shoeGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.5);
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: shoeColor });

    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.3, 0, 0.1);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.3, 0, 0.1);

    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      eyeMaterial
    );
    leftEye.position.set(-0.2, 3.2, 0.4);

    const rightEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      eyeMaterial
    );
    rightEye.position.set(0.2, 3.2, 0.4);

    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x800000 });
    const mouthLine = new THREE.Shape();
    mouthLine.moveTo(0.1, 0.5);
    mouthLine.lineTo(-0.1, 0.5);
    mouthLine.lineTo(0.0, 0.4);
    mouthLine.closePath();
    const mouthGeometry = new THREE.ShapeGeometry(mouthLine);
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 2.5, 0.45);

    // Add all parts to the group
    group.add(head);
    group.add(torso);
    group.add(leftLeg);
    group.add(rightLeg);
    group.add(leftArm);
    group.add(rightArm);
    group.add(leftShoe);
    group.add(rightShoe);
    group.add(leftEye);
    group.add(rightEye);
    group.add(mouth);

    // Scale the entire model down to be more in proportion to the planet
    group.scale.set(1, 1, 1);

    return group;
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
}
