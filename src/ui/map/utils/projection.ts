import * as THREE from "three";
import { PLANET_CENTER, PLANET_RADIUS } from "../../../config/constants";

/**
 * Convert a 3D position on the planet surface to latitude and longitude
 * @param position 3D position vector
 * @returns Object containing latitude and longitude in degrees
 */
export const cartesianToLatLong = (
  position: THREE.Vector3
): { lat: number; long: number } => {
  // Calculate relative position from planet center
  const relPos = new THREE.Vector3().subVectors(position, PLANET_CENTER);

  // Calculate distance from center (should be close to PLANET_RADIUS)
  const distance = relPos.length();

  // Normalize the position
  const normalizedPos = relPos.clone().divideScalar(distance);

  // Calculate latitude (from -90 to 90 degrees)
  // Latitude is the angle from the equatorial plane, with the North pole at 90
  const lat = Math.asin(normalizedPos.y) * (180 / Math.PI);

  // Calculate longitude (from -180 to 180 degrees)
  // Longitude is the angle around the planet, with 0 at the meridian
  const long = Math.atan2(normalizedPos.z, normalizedPos.x) * (180 / Math.PI);

  return { lat, long };
};

/**
 * Project a point from the spherical planet to the 2D minimap
 * Uses azimuthal equidistant projection centered on player
 * @param position 3D position to project
 * @param playerPos Player's 3D position (center of projection)
 * @param mapRadius Radius of the minimap in pixels
 * @returns Projected 2D coordinates {x, y} relative to center of minimap, or null if point is not projectable
 */
export const projectToMinimap = (
  position: THREE.Vector3,
  playerPos: THREE.Vector3,
  mapRadius: number
): { x: number; y: number } | null => {
  // Convert positions to lat/long
  const playerLatLong = cartesianToLatLong(playerPos);
  const pointLatLong = cartesianToLatLong(position);

  // Convert to radians
  const playerLatRad = playerLatLong.lat * (Math.PI / 180);
  const playerLongRad = playerLatLong.long * (Math.PI / 180);
  const pointLatRad = pointLatLong.lat * (Math.PI / 180);
  const pointLongRad = pointLatLong.long * (Math.PI / 180);

  // Calculate great circle distance (central angle)
  const cosC =
    Math.sin(playerLatRad) * Math.sin(pointLatRad) +
    Math.cos(playerLatRad) *
      Math.cos(pointLatRad) *
      Math.cos(pointLongRad - playerLongRad);

  // Clamp value to valid range for Math.acos
  const c = Math.acos(Math.max(-1, Math.min(1, cosC)));

  // Calculate bearing
  const y1 = Math.sin(pointLongRad - playerLongRad) * Math.cos(pointLatRad);
  const x1 =
    Math.cos(playerLatRad) * Math.sin(pointLatRad) -
    Math.sin(playerLatRad) *
      Math.cos(pointLatRad) *
      Math.cos(pointLongRad - playerLongRad);
  const bearing = Math.atan2(y1, x1);

  // Map distance and bearing to x,y coordinates
  // Scale by mapRadius, with a max distance of half the planet circumference (PI * PLANET_RADIUS)
  const maxDistance = Math.PI * PLANET_RADIUS;
  const k = c !== 0 ? (mapRadius * c) / maxDistance : 0;

  // Project coordinates - x is positive to the right, y is positive going up
  const x = k * Math.sin(bearing);
  const y = -k * Math.cos(bearing);

  return { x, y };
};

/**
 * Generate latitude and longitude grid lines for the minimap
 * @param playerPosition Player's 3D position (center of projection)
 * @param mapRadius Radius of the minimap in pixels
 * @returns Object containing grid line points
 */
export const generateGridLines = (
  playerPosition: THREE.Vector3,
  mapRadius: number,
  centerX: number = 100,
  centerY: number = 100
) => {
  const latitudeLines: Array<{ points: string }> = [];
  const longitudeLines: Array<{ points: string }> = [];

  // Generate latitude lines (circles around player)
  for (let latOffset = 15; latOffset <= 90; latOffset += 15) {
    // For each latitude offset (15°, 30°, 45°, 60°, 75°, 90°)
    const northPoints: string[] = [];
    const southPoints: string[] = [];

    // Generate points around the player at consistent latitude offset
    for (let longOffset = -180; longOffset <= 180; longOffset += 5) {
      // Get player's lat/long
      const playerLatLong = cartesianToLatLong(playerPosition);

      // Calculate points at offset from player latitude
      // Note: We need to handle wrapping around poles correctly
      const northLat = Math.min(90, playerLatLong.lat + latOffset);
      const southLat = Math.max(-90, playerLatLong.lat - latOffset);

      // Create positions for north and south points at this longitude
      const longRad = (playerLatLong.long + longOffset) * (Math.PI / 180);
      const northLatRad = northLat * (Math.PI / 180);
      const southLatRad = southLat * (Math.PI / 180);

      // Convert lat/long to 3D positions
      const northPos = new THREE.Vector3(
        PLANET_CENTER.x +
          PLANET_RADIUS * Math.cos(northLatRad) * Math.cos(longRad),
        PLANET_CENTER.y + PLANET_RADIUS * Math.sin(northLatRad),
        PLANET_CENTER.z +
          PLANET_RADIUS * Math.cos(northLatRad) * Math.sin(longRad)
      );

      const southPos = new THREE.Vector3(
        PLANET_CENTER.x +
          PLANET_RADIUS * Math.cos(southLatRad) * Math.cos(longRad),
        PLANET_CENTER.y + PLANET_RADIUS * Math.sin(southLatRad),
        PLANET_CENTER.z +
          PLANET_RADIUS * Math.cos(southLatRad) * Math.sin(longRad)
      );

      // Project to minimap
      const northProjection = projectToMinimap(
        northPos,
        playerPosition,
        mapRadius
      );
      const southProjection = projectToMinimap(
        southPos,
        playerPosition,
        mapRadius
      );

      // Add points if projection successful
      if (northProjection) {
        northPoints.push(
          `${centerX + northProjection.x},${centerY + northProjection.y}`
        );
      }

      if (southProjection) {
        southPoints.push(
          `${centerX + southProjection.x},${centerY + southProjection.y}`
        );
      }
    }

    // Add north line if we have enough points
    if (northPoints.length > 1) {
      latitudeLines.push({ points: northPoints.join(" ") });
    }

    // Add south line if we have enough points
    if (southPoints.length > 1) {
      latitudeLines.push({ points: southPoints.join(" ") });
    }
  }

  // Generate longitude lines (lines radiating from player)
  for (let longOffset = 0; longOffset < 360; longOffset += 30) {
    const points: string[] = [];

    // Get player's lat/long
    const playerLatLong = cartesianToLatLong(playerPosition);

    // Create points along this longitude line
    for (let latOffset = 0; latOffset <= 90; latOffset += 5) {
      const northLat = Math.min(90, playerLatLong.lat + latOffset);
      const southLat = Math.max(-90, playerLatLong.lat - latOffset);

      // We need two points at each latitude offset - one north, one south
      const longRad = (playerLatLong.long + longOffset) * (Math.PI / 180);
      const northLatRad = northLat * (Math.PI / 180);
      const southLatRad = southLat * (Math.PI / 180);

      // Convert lat/long to 3D positions
      const northPos = new THREE.Vector3(
        PLANET_CENTER.x +
          PLANET_RADIUS * Math.cos(northLatRad) * Math.cos(longRad),
        PLANET_CENTER.y + PLANET_RADIUS * Math.sin(northLatRad),
        PLANET_CENTER.z +
          PLANET_RADIUS * Math.cos(northLatRad) * Math.sin(longRad)
      );

      const southPos = new THREE.Vector3(
        PLANET_CENTER.x +
          PLANET_RADIUS * Math.cos(southLatRad) * Math.cos(longRad),
        PLANET_CENTER.y + PLANET_RADIUS * Math.sin(southLatRad),
        PLANET_CENTER.z +
          PLANET_RADIUS * Math.cos(southLatRad) * Math.sin(longRad)
      );

      // Project to minimap
      const northProjection = projectToMinimap(
        northPos,
        playerPosition,
        mapRadius
      );
      const southProjection = projectToMinimap(
        southPos,
        playerPosition,
        mapRadius
      );

      // Add points if projection successful
      if (northProjection && northLat !== playerLatLong.lat) {
        points.push(
          `${centerX + northProjection.x},${centerY + northProjection.y}`
        );
      }

      if (southProjection && southLat !== playerLatLong.lat) {
        points.push(
          `${centerX + southProjection.x},${centerY + southProjection.y}`
        );
      }
    }

    // Add longitude line if we have enough points
    if (points.length > 1) {
      longitudeLines.push({ points: points.join(" ") });
    }
  }

  return { latitudeLines, longitudeLines };
};
