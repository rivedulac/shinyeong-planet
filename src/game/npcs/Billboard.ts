import * as THREE from "three";

/**
 * Billboard NPC - represents a resume billboard on the planet
 */
export const createBillboardMesh = (title: string): THREE.Group => {
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
    metalness: 0.0,
    emissive: new THREE.Color(0x111111), // Slight self-illumination
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
    metalness: 0.0,
    emissive: new THREE.Color(0x111111), // Slight self-illumination
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.z = -frameDepth / 2;

  // Create support posts
  const postGeometry = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Brown wood-like color
    roughness: 0.9,
    metalness: 0.0,
    emissive: new THREE.Color(0x111111), // Slight self-illumination
  });

  const leftPost = new THREE.Mesh(postGeometry, postMaterial);
  leftPost.position.set(-(boardWidth / 2) - 0.5, -boardHeight / 2 - 2.5, -0.5);

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
    context.fillText(title, canvas.width / 2, canvas.height / 2);

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
};
