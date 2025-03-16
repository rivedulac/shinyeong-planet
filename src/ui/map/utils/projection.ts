import * as THREE from "three";
import {
  MINI_MAP_VISIBLE_DISTANCE_THRESHOLD,
  PLANET_CENTER,
  PLANET_RADIUS,
} from "../../../config/constants";

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
 * Convert latitude and longitude to a 3D position on the planet surface
 * @param lat Latitude in degrees (-90 to 90)
 * @param long Longitude in degrees (-180 to 180)
 * @returns 3D vector position
 */
export const latLongToCartesian = (
  lat: number,
  long: number
): THREE.Vector3 => {
  // Convert to radians
  const latRad = lat * (Math.PI / 180);
  const longRad = long * (Math.PI / 180);

  // Calculate 3D position
  return new THREE.Vector3(
    PLANET_CENTER.x + PLANET_RADIUS * Math.cos(latRad) * Math.cos(longRad),
    PLANET_CENTER.y + PLANET_RADIUS * Math.sin(latRad),
    PLANET_CENTER.z + PLANET_RADIUS * Math.cos(latRad) * Math.sin(longRad)
  );
};

/**
 * Check if a point on the planet is visible from the player's position
 * @param position Position to check
 * @param playerPos Player's position
 * @param threshold Optional visibility threshold (-1 to 1, default 0)
 * @returns True if the point is on the visible hemisphere
 */
export const isPointVisible = (
  position: THREE.Vector3,
  playerPos: THREE.Vector3,
  threshold: number = 0
): boolean => {
  // Get direction vectors from planet center
  const playerDir = new THREE.Vector3()
    .subVectors(playerPos, PLANET_CENTER)
    .normalize();
  const pointDir = new THREE.Vector3()
    .subVectors(position, PLANET_CENTER)
    .normalize();

  // Calculate dot product of the two direction vectors
  // If dot product > threshold, the point is considered visible
  const dotProduct = playerDir.dot(pointDir);

  // For standard hemisphere visibility, threshold should be 0
  // Negative threshold values will show more than a hemisphere
  // Positive threshold values will show less than a hemisphere
  return dotProduct > threshold;
};

/**
 * Project a point from the spherical planet to the 2D minimap
 * Uses azimuthal equidistant projection centered on player
 * @param position 3D position to project
 * @param playerPos Player's 3D position (center of projection)
 * @param mapRadius Radius of the minimap in pixels
 * @returns Projected 2D coordinates {x, y} relative to center of minimap,
 *   or null if point is not projectable or visible
 */
export const projectToMinimap = (
  position: THREE.Vector3,
  playerPos: THREE.Vector3,
  mapRadius: number
): { x: number; y: number } | null => {
  try {
    // First check if the point is on the visible hemisphere with a more
    // permissive threshold. This allows us to see slightly more than a
    // hemisphere for better visualization.
    if (
      !isPointVisible(position, playerPos, MINI_MAP_VISIBLE_DISTANCE_THRESHOLD)
    ) {
      return null; // Point is not visible, don't project it
    }

    // Safety check - ensure neither position is at planet center
    // (would cause NaN)
    const posDistanceFromCenter = position.distanceTo(PLANET_CENTER);
    const playerDistanceFromCenter = playerPos.distanceTo(PLANET_CENTER);

    if (posDistanceFromCenter < 0.01 || playerDistanceFromCenter < 0.01) {
      console.warn("Position too close to planet center, can't project");
      return { x: 0, y: 0 }; // Default to center
    }

    // Convert positions to lat/long
    const playerLatLong = cartesianToLatLong(playerPos);
    const pointLatLong = cartesianToLatLong(position);

    // Convert to radians
    const playerLatRad = playerLatLong.lat * (Math.PI / 180);
    const playerLongRad = playerLatLong.long * (Math.PI / 180);
    const pointLatRad = pointLatLong.lat * (Math.PI / 180);
    const pointLongRad = pointLatLong.long * (Math.PI / 180);

    // If positions are extremely close, just return center point
    if (
      Math.abs(playerLatRad - pointLatRad) < 0.001 &&
      Math.abs(playerLongRad - pointLongRad) < 0.001
    ) {
      return { x: 0, y: 0 };
    }

    // Calculate great circle distance (central angle)
    const cosC =
      Math.sin(playerLatRad) * Math.sin(pointLatRad) +
      Math.cos(playerLatRad) *
        Math.cos(pointLatRad) *
        Math.cos(pointLongRad - playerLongRad);

    // Safer acos calculation with clamping
    const c = Math.acos(Math.max(-1, Math.min(1, cosC)));

    // Get the direction vectors for scaling calculation
    const playerDir = new THREE.Vector3()
      .subVectors(playerPos, PLANET_CENTER)
      .normalize();
    const pointDir = new THREE.Vector3()
      .subVectors(position, PLANET_CENTER)
      .normalize();
    const dotProduct = playerDir.dot(pointDir);

    // Calculate a dynamic scale factor based on distance from center of
    // view. This helps manage distortion at the edges
    let scaleFactor = 1.0;

    // For points approaching the edge, compress them to avoid extreme
    // stretching. Use a smoother scaling that gradually compresses as
    // we approach the edge.
    if (dotProduct < 0) {
      // For points beyond 90 degrees from view center (dotProduct < 0)
      // Apply stronger compression
      scaleFactor = 0.7 + (dotProduct + 0.3) * 1.0; // Gradual scaling
    } else if (dotProduct < 0.5) {
      // For points between 60-90 degrees from view center
      // Apply mild compression
      scaleFactor = 0.9 + dotProduct * 0.2; // Mild scaling
    }

    // Calculate bearing (azimuth angle from player to point)
    const y1 = Math.sin(pointLongRad - playerLongRad) * Math.cos(pointLatRad);
    const x1 =
      Math.cos(playerLatRad) * Math.sin(pointLatRad) -
      Math.sin(playerLatRad) *
        Math.cos(pointLatRad) *
        Math.cos(pointLongRad - playerLongRad);
    const bearing = Math.atan2(y1, x1);

    // Map distance and bearing to x,y coordinates
    // Use a smaller value for maxDistance to expand the projection
    // to fill more of the map radius (Math.PI/1.8 gives ~90% fill for
    // a hemisphere)
    const maxDistance = Math.PI / 1.8;
    let k = c !== 0 ? (mapRadius * c * scaleFactor) / maxDistance : 0;

    // Ensure points don't go beyond map radius
    k = Math.min(k, mapRadius * 0.95);

    // Project coordinates - x is positive to the right, y is positive
    // going down (SVG coordinate system)
    const x = k * Math.sin(bearing);
    const y = -k * Math.cos(bearing);

    // Validate output - if we get NaN, return null
    if (isNaN(x) || isNaN(y)) {
      console.warn("Projection produced NaN values");
      return { x: 0, y: 0 }; // Default to center
    }

    return { x, y };
  } catch (error) {
    console.error("Error in projection:", error);
    return { x: 0, y: 0 }; // Default to center in case of error
  }
};

/**
 * Generate absolute latitude and longitude grid lines for the minimap
 * @param playerPosition Player's 3D position (center of projection)
 * @param mapRadius Radius of the minimap in pixels
 * @param centerX X-coordinate of the map center in SVG coordinates
 * @param centerY Y-coordinate of the map center in SVG coordinates
 * @returns Object containing grid line points
 */
export const generateGridLines = (
  playerPosition: THREE.Vector3,
  mapRadius: number,
  centerX: number = 100,
  centerY: number = 100
) => {
  const latitudeLines: Array<{ points: string; label: string }> = [];
  const longitudeLines: Array<{ points: string; label: string }> = [];
  const poleMarkers: Array<{
    x: number;
    y: number;
    isPole: boolean;
    isNorth: boolean;
  }> = [];

  // Get player's lat/long
  const playerLatLong = cartesianToLatLong(playerPosition);

  // Calculate player's facing direction in terms of longitude
  // This helps us determine which longitude lines to prioritize
  const playerLong = playerLatLong.long;

  // Generate more dense latitude lines for better coverage
  const latitudeSteps = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];

  for (const lat of latitudeSteps) {
    const segments: Array<Array<string>> = [];
    let currentSegment: Array<string> = [];
    let lastProjection: { x: number; y: number } | null = null;

    // Generate points along this latitude at different longitudes
    // Higher resolution for smoother lines
    for (let long = -180; long <= 180; long += 2) {
      // Increased resolution further
      // Calculate 3D position for this lat/long
      const pos = latLongToCartesian(lat, long);

      // Project this position to the minimap
      // The projection function already handles visibility checking
      const projection = projectToMinimap(pos, playerPosition, mapRadius);

      if (projection) {
        const point = `${centerX + projection.x},${centerY + projection.y}`;

        // Check if there's a large jump in projection (might indicate
        // crossing the visibility boundary)
        if (lastProjection) {
          const dx = projection.x - lastProjection.x;
          const dy = projection.y - lastProjection.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If there's a large jump, start a new segment
          if (distance > mapRadius / 3) {
            if (currentSegment.length > 1) {
              segments.push([...currentSegment]);
              currentSegment = [];
            }
          }
        }

        currentSegment.push(point);
        lastProjection = projection;
      } else {
        // If we had points in the current segment and now hit an invisible
        // point, store the segment and start a new one
        if (currentSegment.length > 1) {
          segments.push([...currentSegment]);
          currentSegment = [];
        }
        lastProjection = null;
      }
    }

    // Add the last segment if it has points
    if (currentSegment.length > 1) {
      segments.push(currentSegment);
    }

    // Add all segments as separate polylines
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].length > 1) {
        latitudeLines.push({
          points: segments[i].join(" "),
          label:
            lat === 0 ? "Equator" : `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`,
        });
      }
    }
  }

  // Generate longitude lines at regular intervals
  // Use more lines and finer resolution for better detail
  const relativeLongs = [
    -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45,
    60, 75, 90, 105, 120, 135, 150, 165, 180,
  ];

  // Convert relative longitudes to absolute
  for (const relLong of relativeLongs) {
    // Calculate absolute longitude
    let absLong = (playerLong + relLong) % 360;
    if (absLong > 180) absLong -= 360;
    if (absLong < -180) absLong += 360;

    const segments: Array<Array<string>> = [];
    let currentSegment: Array<string> = [];
    let lastProjection: { x: number; y: number } | null = null;

    // Generate points along this longitude at different latitudes
    for (let lat = -85; lat <= 85; lat += 2) {
      // Higher resolution for smoother lines
      // Calculate 3D position for this lat/long
      const pos = latLongToCartesian(lat, absLong);

      // Project this position to the minimap
      const projection = projectToMinimap(pos, playerPosition, mapRadius);

      if (projection) {
        const point = `${centerX + projection.x},${centerY + projection.y}`;

        // Check if there's a large jump in projection
        if (lastProjection) {
          const dx = projection.x - lastProjection.x;
          const dy = projection.y - lastProjection.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If there's a large jump, start a new segment
          if (distance > mapRadius / 3) {
            if (currentSegment.length > 1) {
              segments.push([...currentSegment]);
              currentSegment = [];
            }
          }
        }

        currentSegment.push(point);
        lastProjection = projection;
      } else {
        // If we had points in the current segment and now hit an invisible
        // point, store the segment and start a new one
        if (currentSegment.length > 1) {
          segments.push([...currentSegment]);
          currentSegment = [];
        }
        lastProjection = null;
      }
    }

    // Add the last segment if it has points
    if (currentSegment.length > 1) {
      segments.push(currentSegment);
    }

    // Add all segments as separate polylines
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].length > 1) {
        // Determine if this is approximately the Prime Meridian
        const isPrimeMeridian = Math.abs(absLong) < 5;

        longitudeLines.push({
          points: segments[i].join(" "),
          label: isPrimeMeridian
            ? "Prime Meridian"
            : `${Math.round(Math.abs(absLong))}°${absLong > 0 ? "E" : "W"}`,
        });
      }
    }
  }

  // Add North and South Pole markers only if they're visible
  const northPolePos = latLongToCartesian(90, 0);
  const southPolePos = latLongToCartesian(-90, 0);

  // Use the same visibility threshold as in projectToMinimap for consistency
  if (
    isPointVisible(
      northPolePos,
      playerPosition,
      MINI_MAP_VISIBLE_DISTANCE_THRESHOLD
    )
  ) {
    const northPoleProjection = projectToMinimap(
      northPolePos,
      playerPosition,
      mapRadius
    );

    if (northPoleProjection && northPolePos.distanceTo(playerPosition) > 1) {
      poleMarkers.push({
        x: centerX + northPoleProjection.x,
        y: centerY + northPoleProjection.y,
        isPole: true,
        isNorth: true,
      });
    }
  }

  if (
    isPointVisible(
      southPolePos,
      playerPosition,
      MINI_MAP_VISIBLE_DISTANCE_THRESHOLD
    )
  ) {
    const southPoleProjection = projectToMinimap(
      southPolePos,
      playerPosition,
      mapRadius
    );

    if (southPoleProjection && southPolePos.distanceTo(playerPosition) > 1) {
      poleMarkers.push({
        x: centerX + southPoleProjection.x,
        y: centerY + southPoleProjection.y,
        isPole: true,
        isNorth: false,
      });
    }
  }

  return { latitudeLines, longitudeLines, poleMarkers };
};
