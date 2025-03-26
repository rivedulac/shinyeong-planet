// src/ui/constellations/bigDipper.ts

import * as THREE from "three";
import { ConstellationStar } from "./constellationGenerator";

/**
 * Defines the stars of the Big Dipper (part of Ursa Major)
 * The positions are simplified to ensure clear visibility in the game
 */
export const bigDipperStars: ConstellationStar[] = [
  // The bowl stars
  { name: "Dubhe", position: new THREE.Vector3(1.3, 2.5, 0.0), size: 2.0 }, // α UMa - top right of bowl
  { name: "Merak", position: new THREE.Vector3(1.0, 1.2, 0.0), size: 1.8 }, // β UMa - bottom right of bowl
  { name: "Phecda", position: new THREE.Vector3(0.5, 1.0, 0.0), size: 1.8 }, // γ UMa - bottom left of bowl
  { name: "Megrez", position: new THREE.Vector3(0.4, 2.0, 0.0), size: 1.6 }, // δ UMa - top left of bowl

  // The handle stars - forming a curved handle
  { name: "Alioth", position: new THREE.Vector3(0.0, 2.0, 0.0), size: 1.9 }, // ε UMa - first star in handle
  { name: "Mizar", position: new THREE.Vector3(-0.5, 2.0, 0.0), size: 1.9 }, // ζ UMa - middle of handle
  { name: "Alkaid", position: new THREE.Vector3(-1.0, 1.5, 0.0), size: 1.7 }, // η UMa - end of handle
];

/**
 * The connection pattern for the Big Dipper
 * First draws the bowl as a quadrilateral, then the handle
 */
export const bigDipperPattern = [
  // The bowl (complete quadrilateral)
  0, 1, 2, 3, 0,
  // The handle (starting from the connection to the bowl)
  3, 4, 5, 6,
];

/**
 * Positions the Big Dipper constellation prominently in the sky
 * @param baseDistance The distance from the center at which to place the constellation
 * @returns Positioned star array with coordinates adjusted for maximum visibility
 */
export function positionBigDipperInNorthernSky(
  baseDistance: number = 450
): ConstellationStar[] {
  // Apply the rotation and position to each star
  return bigDipperStars.map((star) => {
    // Create a deep copy of the star
    const positionedStar = {
      ...star,
      // Make stars a bit larger to stand out even more
      size: (star.size || 1) * 1.5,
    };

    // Clone position for manipulation
    const position = star.position.clone();

    // Scale position first to ensure proper spacing
    position.multiplyScalar(0.3); // Scale the pattern to be more compact

    // Move the entire constellation to a prominent position in the sky
    position.y += 0.8; // Move up high in the sky
    position.z -= 0.5; // Move slightly toward viewer

    // Now normalize and scale to proper distance
    position.normalize().multiplyScalar(baseDistance * 0.9); // Place it a bit closer

    // Return the positioned star
    positionedStar.position = position;
    return positionedStar;
  });
}
