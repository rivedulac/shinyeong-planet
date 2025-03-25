import * as THREE from "three";

/**
 * Creates a simple human figure using Three.js primitives
 */
export const createPersonMesh = (): THREE.Group => {
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
};
