// src/utils/tests/constellationGenerator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as THREE from "three";
import {
  normalizeStarPositions,
  prepareStarBuffers,
  createStarGeometry,
  createStarMaterial,
  createStarPoints,
  generateLinePositions,
  createLineGeometry,
  createLineMaterial,
  createLineSegments,
  createConstellation,
  addConstellationToScene,
  ConstellationStar,
} from "../constellationGenerator";

describe("Constellation Generator", () => {
  // Create a test scene
  let scene: THREE.Scene;

  // Create the Big Dipper star data (Ursa Major)
  const bigDipperStars: ConstellationStar[] = [
    { name: "Alkaid", position: new THREE.Vector3(0.5, 0.8, 0.1), size: 1.2 },
    { name: "Mizar", position: new THREE.Vector3(0.4, 0.6, 0.2), size: 1.5 },
    { name: "Alioth", position: new THREE.Vector3(0.2, 0.5, 0.3), size: 1.3 },
    { name: "Megrez", position: new THREE.Vector3(0.0, 0.5, 0.4), size: 1.0 },
    { name: "Phecda", position: new THREE.Vector3(-0.2, 0.3, 0.2), size: 1.2 },
    { name: "Merak", position: new THREE.Vector3(-0.4, 0.2, 0.1), size: 1.3 },
    { name: "Dubhe", position: new THREE.Vector3(-0.5, 0.3, 0.0), size: 1.6 },
  ];

  // Define the connection pattern for the Big Dipper
  const bigDipperPattern = [0, 1, 2, 3, 4, 5, 6];

  beforeEach(() => {
    // Create a new scene for each test
    scene = new THREE.Scene();
  });

  describe("normalize star positions", () => {
    it("should normalize and scale star positions correctly", () => {
      const distance = 100;
      const normalizedPositions = normalizeStarPositions(
        bigDipperStars,
        distance
      );

      expect(normalizedPositions.length).toBe(bigDipperStars.length);

      // Check that all positions are normalized and scaled
      normalizedPositions.forEach((pos, i) => {
        // The position should be normalized to approximately distance
        const length = pos.length();
        expect(length).toBeCloseTo(distance, 0);

        // Direction should be the same as the original, just normalized
        const originalNorm = bigDipperStars[i].position.clone().normalize();
        const newNorm = pos.clone().normalize();

        expect(newNorm.x).toBeCloseTo(originalNorm.x, 5);
        expect(newNorm.y).toBeCloseTo(originalNorm.y, 5);
        expect(newNorm.z).toBeCloseTo(originalNorm.z, 5);
      });
    });
  });

  describe("prepare star buffers", () => {
    it("should create correct buffer arrays for stars", () => {
      const distance = 100;
      const defaultStarSize = 2.0;
      const defaultStarColor = new THREE.Color(1, 1, 1);

      const normalizedPositions = normalizeStarPositions(
        bigDipperStars,
        distance
      );
      const { positions, colors, sizes } = prepareStarBuffers(
        bigDipperStars,
        normalizedPositions,
        defaultStarSize,
        defaultStarColor
      );

      // Check buffer sizes
      expect(positions.length).toBe(bigDipperStars.length * 3); // x, y, z for each star
      expect(colors.length).toBe(bigDipperStars.length * 3); // r, g, b for each star
      expect(sizes.length).toBe(bigDipperStars.length); // one size per star

      // Check that positions match the normalized positions
      for (let i = 0; i < bigDipperStars.length; i++) {
        expect(positions[i * 3]).toBeCloseTo(normalizedPositions[i].x);
        expect(positions[i * 3 + 1]).toBeCloseTo(normalizedPositions[i].y);
        expect(positions[i * 3 + 2]).toBeCloseTo(normalizedPositions[i].z);
      }

      // Check that sizes match the input
      for (let i = 0; i < bigDipperStars.length; i++) {
        const expectedSize = bigDipperStars[i].size || defaultStarSize;
        expect(sizes[i]).toBeCloseTo(expectedSize);
      }

      // Check default colors
      for (let i = 0; i < bigDipperStars.length; i++) {
        if (!bigDipperStars[i].color) {
          expect(colors[i * 3]).toBe(defaultStarColor.r);
          expect(colors[i * 3 + 1]).toBe(defaultStarColor.g);
          expect(colors[i * 3 + 2]).toBe(defaultStarColor.b);
        }
      }
    });
  });

  describe("create star geometry", () => {
    it("should create a buffer geometry with the correct attributes", () => {
      const positions = new Float32Array([1, 2, 3, 4, 5, 6]);
      const colors = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
      const sizes = new Float32Array([1.5, 2.5]);

      const geometry = createStarGeometry(positions, colors, sizes);

      // Check that the geometry has the correct attributes
      expect(geometry.getAttribute("position")).toBeDefined();
      expect(geometry.getAttribute("color")).toBeDefined();
      expect(geometry.getAttribute("size")).toBeDefined();

      // Check attribute arrays
      const posAttribute = geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      expect(posAttribute.array).toBe(positions);
      expect(posAttribute.itemSize).toBe(3);

      const colorAttribute = geometry.getAttribute(
        "color"
      ) as THREE.BufferAttribute;
      expect(colorAttribute.array).toBe(colors);
      expect(colorAttribute.itemSize).toBe(3);

      const sizeAttribute = geometry.getAttribute(
        "size"
      ) as THREE.BufferAttribute;
      expect(sizeAttribute.array).toBe(sizes);
      expect(sizeAttribute.itemSize).toBe(1);
    });
  });

  describe("create star material", () => {
    it("should create a point material with correct properties", () => {
      const defaultStarSize = 2.5;
      const material = createStarMaterial(defaultStarSize);

      expect(material).toBeInstanceOf(THREE.PointsMaterial);
      expect(material.size).toBe(defaultStarSize);
      expect(material.vertexColors).toBe(true);
      expect(material.transparent).toBe(true);
      expect(material.depthWrite).toBe(false);
      expect(material.blending).toBe(THREE.AdditiveBlending);
      expect(material.sizeAttenuation).toBe(false);
    });
  });

  describe("create star points", () => {
    it("should create a Points object with correct name and components", () => {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial();
      const name = "TestConstellation";

      const points = createStarPoints(geometry, material, name);

      expect(points).toBeInstanceOf(THREE.Points);
      expect(points.geometry).toBe(geometry);
      expect(points.material).toBe(material);
      expect(points.name).toBe(`${name}Stars`);
    });
  });

  describe("generate line positions", () => {
    it("should generate correct line positions using the default pattern", () => {
      const distance = 100;
      const normalizedPositions = normalizeStarPositions(
        bigDipperStars,
        distance
      );
      const { positions } = prepareStarBuffers(
        bigDipperStars,
        normalizedPositions,
        2.0,
        new THREE.Color(1, 1, 1)
      );

      const linePositions = generateLinePositions(positions, bigDipperStars);

      // For n stars without a pattern, we get (n-1) lines with 2 points each
      // Each point has 3 coordinates (x, y, z)
      const expectedLength = (bigDipperStars.length - 1) * 6;
      expect(linePositions.length).toBe(expectedLength);

      // Check that lines connect consecutive stars
      for (let i = 0; i < bigDipperStars.length - 1; i++) {
        // Start point of the line
        expect(linePositions[i * 6]).toBeCloseTo(positions[i * 3]);
        expect(linePositions[i * 6 + 1]).toBeCloseTo(positions[i * 3 + 1]);
        expect(linePositions[i * 6 + 2]).toBeCloseTo(positions[i * 3 + 2]);

        // End point of the line
        expect(linePositions[i * 6 + 3]).toBeCloseTo(positions[(i + 1) * 3]);
        expect(linePositions[i * 6 + 4]).toBeCloseTo(
          positions[(i + 1) * 3 + 1]
        );
        expect(linePositions[i * 6 + 5]).toBeCloseTo(
          positions[(i + 1) * 3 + 2]
        );
      }
    });

    it("should generate correct line positions using a custom pattern", () => {
      const distance = 100;
      const normalizedPositions = normalizeStarPositions(
        bigDipperStars,
        distance
      );
      const { positions } = prepareStarBuffers(
        bigDipperStars,
        normalizedPositions,
        2.0,
        new THREE.Color(1, 1, 1)
      );

      // Use a custom pattern that doesn't connect all stars sequentially
      const customPattern = [0, 3, 6, 5, 4, 3, 2, 1, 0];
      const linePositions = generateLinePositions(
        positions,
        bigDipperStars,
        customPattern
      );

      // For a pattern with n elements, we get (n-1) lines with 2 points each
      // Each point has 3 coordinates (x, y, z)
      const expectedLength = (customPattern.length - 1) * 6;
      expect(linePositions.length).toBe(expectedLength);

      // Check that lines connect according to the pattern
      for (let i = 0; i < customPattern.length - 1; i++) {
        const startIdx = customPattern[i];
        const endIdx = customPattern[i + 1];

        // Start point of the line
        expect(linePositions[i * 6]).toBeCloseTo(positions[startIdx * 3]);
        expect(linePositions[i * 6 + 1]).toBeCloseTo(
          positions[startIdx * 3 + 1]
        );
        expect(linePositions[i * 6 + 2]).toBeCloseTo(
          positions[startIdx * 3 + 2]
        );

        // End point of the line
        expect(linePositions[i * 6 + 3]).toBeCloseTo(positions[endIdx * 3]);
        expect(linePositions[i * 6 + 4]).toBeCloseTo(positions[endIdx * 3 + 1]);
        expect(linePositions[i * 6 + 5]).toBeCloseTo(positions[endIdx * 3 + 2]);
      }
    });
  });

  describe("create line geometry", () => {
    it("should create a buffer geometry with the correct positions", () => {
      const linePositions = [1, 2, 3, 4, 5, 6];
      const geometry = createLineGeometry(linePositions);

      // Check that the geometry has a position attribute
      expect(geometry.getAttribute("position")).toBeDefined();

      // Check that the position attribute has the correct values
      const posAttribute = geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      expect(posAttribute.itemSize).toBe(3);
      expect(posAttribute.count).toBe(linePositions.length / 3);

      // Check that the position values match the input
      const array = posAttribute.array as Float32Array;
      for (let i = 0; i < linePositions.length; i++) {
        expect(array[i]).toBe(linePositions[i]);
      }
    });
  });

  describe("create line material", () => {
    it("should create a line material with correct properties", () => {
      const lineColor = 0xff0000;
      const lineOpacity = 0.7;
      const material = createLineMaterial(lineColor, lineOpacity);

      expect(material).toBeInstanceOf(THREE.LineBasicMaterial);
      expect(material.color.getHex()).toBe(lineColor);
      expect(material.transparent).toBe(true);
      expect(material.opacity).toBe(lineOpacity);
      expect(material.depthWrite).toBe(false);
    });
  });

  describe("create line segments", () => {
    it("should create a LineSegments object with correct name and components", () => {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial();
      const name = "TestConstellation";

      const lines = createLineSegments(geometry, material, name);

      expect(lines).toBeInstanceOf(THREE.LineSegments);
      expect(lines.geometry).toBe(geometry);
      expect(lines.material).toBe(material);
      expect(lines.name).toBe(`${name}Lines`);
    });
  });

  describe("create constellation", () => {
    it("should create a constellation with stars", () => {
      const result = createConstellation(bigDipperStars, {
        name: "BigDipper",
        drawLines: false,
      });

      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.stars.name).toBe("BigDipperStars");
      expect(result.lines).toBeUndefined();
    });
    it("should create a constellation with stars and lines", () => {
      const result = createConstellation(bigDipperStars, {
        name: "BigDipper",
        drawLines: true,
        linePattern: bigDipperPattern,
      });

      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.stars.name).toBe("BigDipperStars");
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);
      expect(result.lines?.name).toBe("BigDipperLines");
    });

    it("should use default options when not provided", () => {
      const result = createConstellation(bigDipperStars);

      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);
      // Default name should be used
      expect(result.stars.name).toBe("constellationStars");
      expect(result.lines?.name).toBe("constellationLines");
    });
  });

  describe("add constellation to scene", () => {
    it("should add constellation objects to the scene", () => {
      // Spy on scene.add
      const addSpy = vi.spyOn(scene, "add");

      const result = addConstellationToScene(scene, bigDipperStars, {
        name: "BigDipper",
        drawLines: true,
      });

      // Check that objects were added to the scene
      expect(addSpy).toHaveBeenCalledWith(result.stars);
      expect(addSpy).toHaveBeenCalledWith(result.lines);

      // Check that the returned objects match what we'd expect
      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);
    });

    it("should only add stars to the scene when drawLines is false", () => {
      // Spy on scene.add
      const addSpy = vi.spyOn(scene, "add");

      const result = addConstellationToScene(scene, bigDipperStars, {
        name: "BigDipper",
        drawLines: false,
      });

      // Check that only stars were added to the scene
      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(addSpy).toHaveBeenCalledWith(result.stars);
      expect(result.lines).toBeUndefined();
    });
  });

  // Integration test - create a complete Big Dipper constellation
  describe("Big Dipper Integration", () => {
    it("should create a complete Big Dipper constellation", () => {
      // Create the Big Dipper with a custom pattern to form the dipper shape
      const pattern = [0, 1, 2, 3, 4, 5, 6]; // Sequential for simplicity

      const result = addConstellationToScene(scene, bigDipperStars, {
        name: "BigDipper",
        distance: 400,
        drawLines: true,
        linePattern: pattern,
        lineColor: 0x4444ff,
        lineOpacity: 0.6,
        defaultStarSize: 2.5,
        defaultStarColor: new THREE.Color().setHSL(0.6, 1.0, 0.9), // Bright blue
      });

      // Verify stars
      expect(result.stars).toBeInstanceOf(THREE.Points);
      expect(result.stars.geometry.getAttribute("position").count).toBe(
        bigDipperStars.length
      );

      // Verify lines
      expect(result.lines).toBeInstanceOf(THREE.LineSegments);
      // Pattern creates n-1 line segments
      expect(result.lines?.geometry.getAttribute("position").count).toBe(
        (pattern.length - 1) * 2
      );

      // Verify objects were added to scene
      expect(scene.children).toContain(result.stars);
      expect(scene.children).toContain(result.lines);

      // Check material properties
      const starMaterial = result.stars.material as THREE.PointsMaterial;
      expect(starMaterial.size).toBe(2.5);

      const lineMaterial = result.lines?.material as THREE.LineBasicMaterial;
      expect(lineMaterial.color.getHex()).toBe(0x4444ff);
      expect(lineMaterial.opacity).toBe(0.6);
    });
  });
});
