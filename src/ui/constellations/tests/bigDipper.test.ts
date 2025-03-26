import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  bigDipperStars,
  bigDipperPattern,
  positionBigDipperInNorthernSky,
} from "../bigDipper";

describe("Big Dipper Constellation", () => {
  describe("bigDipperStars", () => {
    it("should contain 7 stars", () => {
      expect(bigDipperStars.length).toBe(7);
    });

    it("should include all the main stars with correct names and sizes", () => {
      const expectedStars = [
        { name: "Dubhe", size: 2.0 },
        { name: "Merak", size: 1.8 },
        { name: "Phecda", size: 1.8 },
        { name: "Megrez", size: 1.6 },
        { name: "Alioth", size: 1.9 },
        { name: "Mizar", size: 1.9 },
        { name: "Alkaid", size: 1.7 },
      ];

      expectedStars.forEach((expected) => {
        const star = bigDipperStars.find((s) => s.name === expected.name);
        expect(star).toBeDefined();
        expect(star?.size).toBe(expected.size);
      });
    });

    it("should have correct initial positions for bowl stars", () => {
      const dubhe = bigDipperStars.find((star) => star.name === "Dubhe");
      const merak = bigDipperStars.find((star) => star.name === "Merak");
      const phecda = bigDipperStars.find((star) => star.name === "Phecda");
      const megrez = bigDipperStars.find((star) => star.name === "Megrez");

      expect(dubhe?.position).toEqual(new THREE.Vector3(1.3, 2.5, 0.0));
      expect(merak?.position).toEqual(new THREE.Vector3(1.0, 1.2, 0.0));
      expect(phecda?.position).toEqual(new THREE.Vector3(0.5, 1.0, 0.0));
      expect(megrez?.position).toEqual(new THREE.Vector3(0.4, 2.0, 0.0));
    });

    it("should have correct initial positions for handle stars", () => {
      const alioth = bigDipperStars.find((star) => star.name === "Alioth");
      const mizar = bigDipperStars.find((star) => star.name === "Mizar");
      const alkaid = bigDipperStars.find((star) => star.name === "Alkaid");

      expect(alioth?.position).toEqual(new THREE.Vector3(0.0, 2.0, 0.0));
      expect(mizar?.position).toEqual(new THREE.Vector3(-0.5, 2.0, 0.0));
      expect(alkaid?.position).toEqual(new THREE.Vector3(-1.0, 1.5, 0.0));
    });
  });

  describe("bigDipperPattern", () => {
    it("should define the correct connection pattern", () => {
      // Pattern should draw bowl then handle
      expect(bigDipperPattern).toEqual([0, 1, 2, 3, 0, 3, 4, 5, 6]);
    });

    it("should have valid indices for all stars", () => {
      const maxIndex = bigDipperStars.length - 1;
      bigDipperPattern.forEach((index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThanOrEqual(maxIndex);
      });
    });
  });

  describe("positionBigDipperInNorthernSky", () => {
    it("should apply correct scaling and positioning transformations", () => {
      const baseDistance = 450;
      const positionedStars = positionBigDipperInNorthernSky(baseDistance);

      positionedStars.forEach((star) => {
        // Check scaling factor (0.3 * 0.9 * baseDistance)
        const expectedMaxDistance = baseDistance * 0.9;
        expect(star.position.length()).toBeCloseTo(expectedMaxDistance, 0);

        // Check Y offset (should be higher due to +0.8 before normalization)
        expect(star.position.y).toBeGreaterThan(0);

        // Check Z offset (should be negative due to -0.5 before normalization)
        expect(star.position.z).toBeLessThan(0);
      });
    });

    it("should increase star sizes by 1.5x", () => {
      const positionedStars = positionBigDipperInNorthernSky();

      bigDipperStars.forEach((originalStar, index) => {
        if (originalStar.size) {
          const positionedStar = positionedStars[index];
          expect(positionedStar.size).toBe(originalStar.size * 1.5);
        }
      });
    });

    it("should use default distance when not specified", () => {
      const positionedStars = positionBigDipperInNorthernSky();
      const defaultDistance = 450;
      const expectedDistance = defaultDistance * 0.9; // Account for the 0.9 scaling

      positionedStars.forEach((star) => {
        expect(star.position.length()).toBeCloseTo(expectedDistance, 0);
      });
    });

    it("should maintain relative positions after transformation", () => {
      const positionedStars = positionBigDipperInNorthernSky();

      // Check that the bowl stars maintain their quadrilateral shape
      const bowlStars = positionedStars.slice(0, 4);
      const bowlVectors = bowlStars.map((star) => star.position);

      // Check that the handle stars maintain their curved sequence
      const handleStars = positionedStars.slice(4);
      const handleVectors = handleStars.map((star) => star.position);

      // Verify bowl forms a quadrilateral (simplified check)
      const bowlWidth = bowlVectors[0].distanceTo(bowlVectors[3]);
      const bowlHeight = bowlVectors[1].distanceTo(bowlVectors[0]);
      expect(bowlWidth).toBeGreaterThan(0);
      expect(bowlHeight).toBeGreaterThan(0);

      // Verify handle maintains curve (check sequential distances)
      const handle1to2 = handleVectors[0].distanceTo(handleVectors[1]);
      const handle2to3 = handleVectors[1].distanceTo(handleVectors[2]);
      expect(handle1to2).toBeGreaterThan(0);
      expect(handle2to3).toBeGreaterThan(0);
    });
  });
});
