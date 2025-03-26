import * as THREE from "three";

/**
 * Interface defining a star in a constellation
 */
export interface ConstellationStar {
  name: string;
  // Position will be normalized and then scaled to the appropriate distance
  position: THREE.Vector3;
  // Optional size multiplier to make certain stars more prominent
  size?: number;
  // Optional color override (default stars will use a standard color)
  color?: THREE.Color;
}

/**
 * Options for creating a constellation
 */
export interface ConstellationOptions {
  distance?: number;
  name?: string;
  drawLines?: boolean;
  lineColor?: number;
  lineOpacity?: number;
  defaultStarSize?: number;
  defaultStarColor?: THREE.Color;
  linePattern?: number[];
}

/**
 * Result of creating a constellation
 */
export interface ConstellationResult {
  stars: THREE.Points;
  lines?: THREE.LineSegments;
}

/**
 * Normalizes star positions and scales them to the specified distance
 */
export function normalizeStarPositions(
  stars: ConstellationStar[],
  distance: number
): THREE.Vector3[] {
  return stars.map((star) =>
    star.position.clone().normalize().multiplyScalar(distance)
  );
}

/**
 * Prepares the star data for rendering
 */
export function prepareStarBuffers(
  stars: ConstellationStar[],
  normalizedPositions: THREE.Vector3[],
  defaultStarSize: number,
  defaultStarColor: THREE.Color
): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
} {
  const positions = new Float32Array(stars.length * 3);
  const colors = new Float32Array(stars.length * 3);
  const sizes = new Float32Array(stars.length);

  stars.forEach((star, i) => {
    const position = normalizedPositions[i];

    // Store position
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    // Store color (use specified color or default)
    const color = star.color || defaultStarColor;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // Store size
    sizes[i] = star.size || defaultStarSize;
  });

  return { positions, colors, sizes };
}

/**
 * Creates a geometry for stars with the provided attributes
 */
export function createStarGeometry(
  positions: Float32Array,
  colors: Float32Array,
  sizes: Float32Array
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  return geometry;
}

/**
 * Creates a material for rendering stars
 */
export function createStarMaterial(
  defaultStarSize: number
): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    size: defaultStarSize,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: false, // Keep stars the same size regardless of distance
  });
}

/**
 * Creates the points object for rendering the constellation stars
 */
export function createStarPoints(
  geometry: THREE.BufferGeometry,
  material: THREE.PointsMaterial,
  name: string
): THREE.Points {
  const points = new THREE.Points(geometry, material);
  points.name = `${name}Stars`;
  return points;
}

/**
 * Generates line positions for connecting constellation stars
 */
export function generateLinePositions(
  positions: Float32Array,
  stars: ConstellationStar[],
  linePattern?: number[]
): number[] {
  let linePositions: number[] = [];

  if (linePattern && linePattern.length >= 2) {
    // Use the provided connection pattern
    for (let i = 0; i < linePattern.length - 1; i++) {
      const startIdx = linePattern[i];
      const endIdx = linePattern[i + 1];

      if (startIdx < stars.length && endIdx < stars.length) {
        linePositions.push(
          positions[startIdx * 3],
          positions[startIdx * 3 + 1],
          positions[startIdx * 3 + 2],
          positions[endIdx * 3],
          positions[endIdx * 3 + 1],
          positions[endIdx * 3 + 2]
        );
      }
    }
  } else {
    // Default: connect stars in the order they are provided
    for (let i = 0; i < stars.length - 1; i++) {
      linePositions.push(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
        positions[(i + 1) * 3],
        positions[(i + 1) * 3 + 1],
        positions[(i + 1) * 3 + 2]
      );
    }
  }

  return linePositions;
}

/**
 * Creates a geometry for constellation lines
 */
export function createLineGeometry(
  linePositions: number[]
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(linePositions), 3)
  );
  return geometry;
}

/**
 * Creates a material for rendering constellation lines
 */
export function createLineMaterial(
  lineColor: number,
  lineOpacity: number
): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: lineColor,
    transparent: true,
    opacity: lineOpacity,
    depthWrite: false,
  });
}

/**
 * Creates the line segments for rendering constellation lines
 */
export function createLineSegments(
  geometry: THREE.BufferGeometry,
  material: THREE.LineBasicMaterial,
  name: string
): THREE.LineSegments {
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = `${name}Lines`;
  return lines;
}

/**
 * Creates a constellation using sequential function composition
 *
 * This function composes the smaller functions to create the full constellation.
 */
export function createConstellation(
  stars: ConstellationStar[],
  options: ConstellationOptions = {}
): ConstellationResult {
  // Set defaults for options
  const {
    distance = 450,
    name = "constellation",
    drawLines = true,
    lineColor = 0x4444aa,
    lineOpacity = 0.3,
    defaultStarSize = 2.0,
    defaultStarColor = new THREE.Color().setHSL(0.6, 0.8, 0.9), // Bright blue-white
    linePattern,
  } = options;

  // Create stars through sequential function composition
  const normalizedPositions = normalizeStarPositions(stars, distance);
  const { positions, colors, sizes } = prepareStarBuffers(
    stars,
    normalizedPositions,
    defaultStarSize,
    defaultStarColor
  );

  const starGeometry = createStarGeometry(positions, colors, sizes);
  const starMaterial = createStarMaterial(defaultStarSize);
  const starsObject = createStarPoints(starGeometry, starMaterial, name);

  // Result object
  const result: ConstellationResult = { stars: starsObject };

  // Create connecting lines if requested
  if (drawLines) {
    const linePositions = generateLinePositions(positions, stars, linePattern);
    const lineGeometry = createLineGeometry(linePositions);
    const lineMaterial = createLineMaterial(lineColor, lineOpacity);
    const linesObject = createLineSegments(lineGeometry, lineMaterial, name);

    result.lines = linesObject;
  }

  return result;
}

/**
 * Adds a constellation to the scene
 *
 * This is a convenience function that creates a constellation and adds it to the scene.
 */
export function addConstellationToScene(
  scene: THREE.Scene,
  stars: ConstellationStar[],
  options: ConstellationOptions = {}
): ConstellationResult {
  const constellation = createConstellation(stars, options);

  scene.add(constellation.stars);

  if (constellation.lines) {
    scene.add(constellation.lines);
  }

  return constellation;
}
