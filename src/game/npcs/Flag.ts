import * as THREE from "three";

/**
 * Flag NPC - represents a country flag with location, year, and description
 */
export const createFlagMesh = (
  country: string,
  description: string
): THREE.Group => {
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
    map: createFlagTexture(country, description),
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
};

/**
 * Create a texture for the flag with all information
 */
const createFlagTexture = (
  country: string,
  description: string
): THREE.Texture => {
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
  ctx.fillText(country, canvas.width / 2, 180);

  // Draw year and description on the bottom row
  ctx.font = "bold 60px Arial";
  ctx.fillText(description, canvas.width / 2, 240);

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
};
