import { describe, it, expect, beforeEach } from "vitest";
import * as THREE from "three";
import {
  normalizeStarPositions,
  prepareStarBuffers,
  createStarMaterial,
  generateLinePositions,
  createConstellation,
  addConstellationToScene,
  ConstellationStar,
} from "../constellationGenerator";

describe("Constellation Generator", () => {
  let scene: THREE.Scene;

  // Updated test data to match real constellation patterns
  const testStars: ConstellationStar[] = [
    { name: "Star1", position: new THREE.Vector3(1.3, 2.5, 0.0), size: 2.0 },
    { name: "Star2", position: new THREE.Vector3(1.0, 1.2, 0.0), size: 1.8 },
    { name: "Star3", position: new THREE.Vector3(0.5, 1.0, 0.0), size: 1.8 },
    { name: "Star4", position: new THREE.Vector3(0.4, 2.0, 0.0), size: 1.6 },
  ];

  // Updated test pattern to match real constellation connections
  const testPattern = [0, 1, 2, 3, 0];

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  describe("normalize star positions", () => {
    it("should normalize and scale star positions correctly", () => {
      const distance = 450; // Updated to match default distance
      const normalizedPositions = normalizeStarPositions(testStars, distance);

      expect(normalizedPositions.length).toBe(testStars.length);

      normalizedPositions.forEach((pos, i) => {
        expect(pos.length()).toBeCloseTo(distance, 0);

        const originalNorm = testStars[i].position.clone().normalize();
        const newNorm = pos.clone().normalize();

        expect(newNorm.x).toBeCloseTo(originalNorm.x, 5);
        expect(newNorm.y).toBeCloseTo(originalNorm.y, 5);
        expect(newNorm.z).toBeCloseTo(originalNorm.z, 5);
      });
    });
  });

  describe("prepare star buffers", () => {
    it("should create correct buffer arrays with default star color", () => {
      const distance = 450;
      const defaultStarSize = 3.5; // Updated to match default
      const defaultStarColor = new THREE.Color().setHSL(0.6, 0.8, 0.9); // Updated to match default

      const normalizedPositions = normalizeStarPositions(testStars, distance);
      const { positions, colors, sizes } = prepareStarBuffers(
        testStars,
        normalizedPositions,
        defaultStarSize,
        defaultStarColor
      );

      expect(positions.length).toBe(testStars.length * 3);
      expect(colors.length).toBe(testStars.length * 3);
      expect(sizes.length).toBe(testStars.length);
    });
  });

  describe("create star material", () => {
    it("should create a point material with updated default properties", () => {
      const defaultStarSize = 3.5; // Updated default size
      const material = createStarMaterial(defaultStarSize);

      expect(material).toBeInstanceOf(THREE.PointsMaterial);
      expect(material.size).toBe(defaultStarSize);
      expect(material.vertexColors).toBe(true);
      expect(material.blending).toBe(THREE.AdditiveBlending);
      expect(material.transparent).toBe(true);
      expect(material.depthWrite).toBe(false);
      expect(material.sizeAttenuation).toBe(false);
    });
  });

  describe("generate line positions", () => {
    it("should generate correct line positions with updated pattern", () => {
      const distance = 450;
      const normalizedPositions = normalizeStarPositions(testStars, distance);
      const { positions } = prepareStarBuffers(
        testStars,
        normalizedPositions,
        3.5,
        new THREE.Color().setHSL(0.6, 0.8, 0.9)
      );

      const linePositions = generateLinePositions(
        positions,
        testStars,
        testPattern
      );

      // Pattern creates a complete shape (5 points, 4 lines)
      expect(linePositions.length).toBe((testPattern.length - 1) * 6);

      // Verify line connections follow the pattern
      for (let i = 0; i < testPattern.length - 1; i++) {
        const startIdx = testPattern[i];
        const endIdx = testPattern[i + 1];

        expect(linePositions[i * 6]).toBeCloseTo(positions[startIdx * 3]);
        expect(linePositions[i * 6 + 1]).toBeCloseTo(
          positions[startIdx * 3 + 1]
        );
        expect(linePositions[i * 6 + 2]).toBeCloseTo(
          positions[startIdx * 3 + 2]
        );

        expect(linePositions[i * 6 + 3]).toBeCloseTo(positions[endIdx * 3]);
        expect(linePositions[i * 6 + 4]).toBeCloseTo(positions[endIdx * 3 + 1]);
        expect(linePositions[i * 6 + 5]).toBeCloseTo(positions[endIdx * 3 + 2]);
      }
    });
  });

  describe("create constellation", () => {
    it("should create a constellation with updated default values", () => {
      const result = createConstellation(testStars);

      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);

      const starMaterial = result.stars.material as THREE.PointsMaterial;
      expect(starMaterial.size).toBe(3.5);

      const lineMaterial = result.lines?.material as THREE.LineBasicMaterial;
      expect(lineMaterial.color.getHex()).toBe(0xb0c4ff); // Updated default color
      expect(lineMaterial.opacity).toBe(0.7); // Updated default opacity
    });
  });

  describe("integration test", () => {
    it("should create a complete constellation with updated defaults", () => {
      const result = addConstellationToScene(scene, testStars, {
        name: "TestConstellation",
        distance: 450,
        drawLines: true,
        linePattern: testPattern,
        lineColor: 0xb0c4ff,
        lineOpacity: 0.7,
        defaultStarSize: 3.5,
        defaultStarColor: new THREE.Color().setHSL(0.6, 0.8, 0.9),
      });

      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);

      const starMaterial = result.stars.material as THREE.PointsMaterial;
      expect(starMaterial.size).toBe(3.5);

      const lineMaterial = result.lines?.material as THREE.LineBasicMaterial;
      expect(lineMaterial.color.getHex()).toBe(0xb0c4ff);
      expect(lineMaterial.opacity).toBe(0.7);

      expect(scene.children).toContain(result.stars);
      expect(scene.children).toContain(result.lines);
    });
  });
});
