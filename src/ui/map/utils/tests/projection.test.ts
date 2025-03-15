import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  cartesianToLatLong,
  projectToMinimap,
  generateGridLines,
} from "../projection";
import { PLANET_CENTER, PLANET_RADIUS } from "../../../../config/constants";

describe("Cartesian to LatLong conversion", () => {
  it("should convert North Pole correctly", () => {
    const northPolePosition = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y + PLANET_RADIUS,
      PLANET_CENTER.z
    );

    const { lat, long } = cartesianToLatLong(northPolePosition);

    expect(lat).toBeCloseTo(90); // North pole is at 90 degrees latitude
    expect(Math.abs(long)).toBeCloseTo(0); // Longitude is arbitrary at pole
  });

  it("should convert South Pole correctly", () => {
    const southPolePosition = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y - PLANET_RADIUS,
      PLANET_CENTER.z
    );

    const { lat, long } = cartesianToLatLong(southPolePosition);

    expect(lat).toBeCloseTo(-90); // South pole is at -90 degrees latitude
    expect(Math.abs(long)).toBeCloseTo(0); // Longitude is arbitrary at pole
  });

  it("should convert Equator at 0° longitude correctly", () => {
    const equatorPosition = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS,
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    const { lat, long } = cartesianToLatLong(equatorPosition);

    expect(lat).toBeCloseTo(0); // Equator is at 0 degrees latitude
    expect(long).toBeCloseTo(0); // 0 degrees longitude
  });

  it("should convert Equator at 90° longitude correctly", () => {
    const equatorPosition = new THREE.Vector3(
      PLANET_CENTER.x,
      PLANET_CENTER.y,
      PLANET_CENTER.z + PLANET_RADIUS
    );

    const { lat, long } = cartesianToLatLong(equatorPosition);

    expect(lat).toBeCloseTo(0); // Equator is at 0 degrees latitude
    expect(long).toBeCloseTo(90); // 90 degrees longitude
  });
});

describe("Azimuthal equidistant projection", () => {
  const playerPosition = new THREE.Vector3(
    PLANET_CENTER.x,
    PLANET_CENTER.y + PLANET_RADIUS, // Player at North Pole
    PLANET_CENTER.z
  );

  const mapRadius = 100; // 100 pixel radius minimap

  it("should project player position to center of map", () => {
    const projection = projectToMinimap(
      playerPosition,
      playerPosition,
      mapRadius
    );

    expect(projection?.x).toBeCloseTo(0);
    expect(projection?.y).toBeCloseTo(0);
  });

  it("should project equator points correctly", () => {
    // Point on equator at 0° longitude (directly south of north pole)
    const equatorPoint = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS,
      PLANET_CENTER.y,
      PLANET_CENTER.z
    );

    const projection = projectToMinimap(
      equatorPoint,
      playerPosition,
      mapRadius
    );

    // Should be projected to the bottom of the map (south)
    expect(projection?.x).toBeCloseTo(0);
    expect(projection?.y).toBeGreaterThan(0); // South is +y in SVG coordinates
  });

  it("should project points at intermediate latitudes", () => {
    // Point at 45° latitude, 0° longitude
    const midLatPoint = new THREE.Vector3(
      PLANET_CENTER.x + PLANET_RADIUS * Math.cos(Math.PI / 4),
      PLANET_CENTER.y + PLANET_RADIUS * Math.sin(Math.PI / 4),
      PLANET_CENTER.z
    );

    const projection = projectToMinimap(midLatPoint, playerPosition, mapRadius);

    // Should be projected between center and bottom
    expect(projection?.x).toBeCloseTo(0);
    expect(projection?.y).toBeGreaterThan(0);
    expect(projection?.y).toBeLessThan(mapRadius);
  });
});

describe("Grid line generation", () => {
  const playerPosition = new THREE.Vector3(
    PLANET_CENTER.x,
    PLANET_CENTER.y + PLANET_RADIUS, // Player at North Pole
    PLANET_CENTER.z
  );

  const mapRadius = 100; // 100 pixel radius minimap

  it("should generate latitude and longitude lines", () => {
    const { latitudeLines, longitudeLines } = generateGridLines(
      playerPosition,
      mapRadius
    );

    // Should have some latitude lines
    expect(latitudeLines.length).toBeGreaterThan(0);

    // Should have some longitude lines
    expect(longitudeLines.length).toBeGreaterThan(0);

    // Each line should have a points string
    expect(latitudeLines[0].points).toBeDefined();
    expect(longitudeLines[0].points).toBeDefined();
  });
});
