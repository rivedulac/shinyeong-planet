import * as THREE from "three";
import { INpc, NpcType } from "./interfaces/INpc";
import { IConversation } from "./interfaces/IConversation";
import {
  BILLBOARD_RADIUS,
  DEFAULT_BILLBOARD_CONVERSTAION,
  PLANET_CENTER,
  PLANET_RADIUS,
} from "../../config/constants";

/**
 * Billboard NPC - represents a resume billboard on the planet
 */
export class Billboard implements INpc {
  private id: string;
  private mesh: THREE.Group;
  private title: string;
  private conversation: IConversation;
  private collisionRadius: number;

  /**
   * Create a new Billboard NPC
   * @param id Unique identifier for this NPC
   * @param title Text to display on the billboard
   */
  constructor(
    id: string,
    title: string = "Resume",
    conversation: IConversation = DEFAULT_BILLBOARD_CONVERSTAION
  ) {
    this.id = id;
    this.title = title;
    this.collisionRadius = BILLBOARD_RADIUS;
    this.mesh = this.createBillboardMesh();
    this.conversation = conversation;
  }

  public getId(): string {
    return this.id;
  }

  public getType(): NpcType {
    return NpcType.Billboard;
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
   * Get billboard information
   */
  public getInfo(): { title: string } {
    return {
      title: this.title,
    };
  }

  /** Put the billboard to stand on the planet */
  public setPositionOnPlanet(latitude: number, longitude: number): void {
    // Convert spherical coordinates to Cartesian
    const phi = Math.PI / 2 - latitude; // Convert latitude to phi angle (0 = north pole, π = south pole)
    const theta = longitude; // Longitude maps directly to theta

    // Calculate the position on the planet surface
    const x = PLANET_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = PLANET_RADIUS * Math.cos(phi);
    const z = PLANET_RADIUS * Math.sin(phi) * Math.sin(theta);

    // Create normal vector (points outward from planet center)
    const normal = new THREE.Vector3(x, y, z).normalize();

    // Add an offset to raise the billboard above the surface
    // Half the height of the billboard + posts (4 + 3 = ~7 units)
    const surfaceOffset = 7;

    // Position the billboard on the planet surface with offset
    this.mesh.position.set(
      PLANET_CENTER.x + x + normal.x * surfaceOffset,
      PLANET_CENTER.y + y + normal.y * surfaceOffset,
      PLANET_CENTER.z + z + normal.z * surfaceOffset
    );

    // Reset rotation first
    this.mesh.rotation.set(0, 0, 0);

    // Look at the planet center first, then rotate 180° to face outward
    this.mesh.lookAt(PLANET_CENTER);
    this.mesh.rotateY(Math.PI);

    // Determine which way is "up" for the billboard
    // The board should be perpendicular to the surface normal
    // and upright relative to the local "up" direction on the planet

    // Get the "world up" direction
    const worldUp = new THREE.Vector3(0, 1, 0);

    // Calculate the right vector (perpendicular to both normal and world up)
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

    // Recalculate the "up" direction to ensure it's perpendicular to both normal and right
    const up = new THREE.Vector3().crossVectors(right, normal).normalize();

    // Apply a rotation to make the billboard stand upright
    // Create a rotation matrix from these orthogonal vectors
    const mtx = new THREE.Matrix4().makeBasis(
      right,
      up,
      normal.clone().negate()
    );

    // Apply the rotation
    this.mesh.setRotationFromMatrix(mtx);

    // Rotate the billboard 90 degrees around the X axis to face outward properly
    this.mesh.rotateX(-Math.PI / 2);
    this.mesh.rotateY(-Math.PI / 2);
  }

  private createBillboardMesh(): THREE.Group {
    const group = new THREE.Group();

    // Create billboard board
    const boardWidth = 10;
    const boardHeight = 8;
    const boardThickness = 0.2;

    const boardGeometry = new THREE.BoxGeometry(
      boardWidth,
      boardHeight,
      boardThickness
    );
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);

    // Add a frame around the billboard
    const frameThickness = 0.5;
    const frameDepth = 0.3;

    const frameGeometry = new THREE.BoxGeometry(
      boardWidth + frameThickness * 2,
      boardHeight + frameThickness * 2,
      frameDepth
    );
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown wood-like color
      roughness: 0.8,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = -frameDepth / 2;

    // Create support posts
    const postGeometry = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown wood-like color
      roughness: 0.9,
    });

    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(
      -(boardWidth / 2) - 0.5,
      -boardHeight / 2 - 2.5,
      -0.5
    );

    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(boardWidth / 2 + 0.5, -boardHeight / 2 - 2.5, -0.5);

    // Create text for the billboard
    // In a real application, we would use a TextGeometry or a sprite with canvas
    // For simplicity, we'll use a simple plane with a color for the title background
    const titleBackGeometry = new THREE.PlaneGeometry(boardWidth - 1, 1.2);
    const titleBackMaterial = new THREE.MeshBasicMaterial({
      color: 0x4682b4, // Steel blue
    });
    const titleBack = new THREE.Mesh(titleBackGeometry, titleBackMaterial);
    titleBack.position.z = boardThickness / 2 + 0.01;
    titleBack.position.y = boardHeight / 2 - 1;

    // Create a canvas to display the title text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      // Set canvas size
      canvas.width = 512;
      canvas.height = 128;

      // Clear canvas
      context.fillStyle = "#4682b4"; // Match the background color
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Add text
      context.font = "bold 60px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "white";
      context.fillText(this.title, canvas.width / 2, canvas.height / 2);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      // Apply the texture to the title background
      titleBackMaterial.map = texture;
      titleBackMaterial.needsUpdate = true;
    }

    // Add everything to the group
    group.add(board);
    group.add(frame);
    group.add(leftPost);
    group.add(rightPost);
    group.add(titleBack);

    return group;
  }

  public getCollisionRadius(): number {
    return this.collisionRadius;
  }
}
