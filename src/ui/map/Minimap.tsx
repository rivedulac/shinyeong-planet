import React, { useState, useEffect } from "react";
import * as THREE from "three";
import {
  generateGridLines,
  projectToMinimap,
  isPointVisible,
} from "./utils/projection";
import {
  MINI_MAP_RADIUS,
  MINI_MAP_CENTER_X,
  MINI_MAP_CENTER_Y,
  MINI_MAP_PERSON_COLOR,
  MINI_MAP_BILLBOARD_COLOR,
  MINI_MAP_DEFAULT_COLOR,
  MINI_MAP_FLAG_COLOR,
  MINI_MAP_GRID_COLOR,
  MINI_MAP_PLAYER_COLOR,
  MINI_MAP_VISIBLE_DISTANCE_THRESHOLD,
  PLANET_CENTER,
  MINI_MAP_NPC_SIZE_MEDIUM,
  MINI_MAP_NPC_SIZE_SMALL,
  MINI_MAP_NPC_SIZE_LARGE,
} from "../../config/constants";
import { NpcType } from "@/game/npcs/interfaces/INpc";
import { useTranslation } from "react-i18next";

interface MinimapProps {
  playerPosition?: THREE.Vector3;
  playerRotation?: number;
  playerLookDirection?: THREE.Vector3;
  npcs?: Array<{
    type: string;
    position: THREE.Vector3;
    id: string;
  }>;
}

/**
 * A minimap component that displays a top-down view of the visible hemisphere
 * with latitude and longitude lines
 */
const Minimap: React.FC<MinimapProps> = ({
  playerPosition,
  playerRotation,
  playerLookDirection,
  npcs,
}) => {
  const [gridLines, setGridLines] = useState<{
    latitudeLines: Array<{ points: string; label: string }>;
    longitudeLines: Array<{ points: string; label: string }>;
    poleMarkers: Array<{
      x: number;
      y: number;
      isNorth: boolean;
      isPole: boolean;
    }>;
  }>({ latitudeLines: [], longitudeLines: [], poleMarkers: [] });

  const [projectedNpcs, setProjectedNpcs] = useState<
    Array<{
      id: string;
      type: string;
      x: number;
      y: number;
    }>
  >([]);

  const { t } = useTranslation();

  // Calculate relative rotation from planet surface
  const calculateRelativeRotation = (
    position: THREE.Vector3,
    lookDirection?: THREE.Vector3
  ): number => {
    if (!position) {
      return 0;
    }

    // Calculate vector from planet center to player position (the "up" vector at player position)
    const playerRadialVector = new THREE.Vector3()
      .subVectors(position, PLANET_CENTER)
      .normalize();

    // The up vector at the player's position (radial from center to position)
    const upVector = playerRadialVector.clone();

    // Calculate the east vector at the player's position
    // East is perpendicular to both the up vector and the world's north
    const worldNorth = new THREE.Vector3(0, 1, 0);
    let eastVector = new THREE.Vector3()
      .crossVectors(worldNorth, upVector)
      .normalize();

    // Handle special case: if player is at poles, east vector might be degenerate
    if (eastVector.lengthSq() < 0.001) {
      // Choose an arbitrary east direction (along world x-axis)
      eastVector.set(1, 0, 0);
    }

    // Calculate north vector using cross product (up x east = north)
    // This gives us the local north on the tangent plane at the player's position
    const northVector = new THREE.Vector3()
      .crossVectors(upVector, eastVector)
      .normalize();

    // Determine the player's forward direction
    let playerForwardTangent: THREE.Vector3;

    if (lookDirection) {
      // If we have the look direction, project it onto the tangent plane
      // by removing the component parallel to the up vector
      const upComponent = upVector
        .clone()
        .multiplyScalar(lookDirection.dot(upVector));
      playerForwardTangent = new THREE.Vector3()
        .subVectors(lookDirection, upComponent)
        .normalize();
    } else {
      // If there is no look direction, assume player is facing north
      playerForwardTangent = northVector.clone();
      return 0; // No rotation
    }

    // Now find the angle between the north vector and player's forward tangent vector
    const dotProduct = northVector.dot(playerForwardTangent);
    const determinant = new THREE.Vector3()
      .crossVectors(northVector, playerForwardTangent)
      .dot(upVector);

    // Calculate the angle and convert to degrees
    const angleRadians = Math.atan2(determinant, dotProduct);
    return angleRadians * (180 / Math.PI);
  };

  // Update projections when player position changes
  useEffect(() => {
    // Skip if no player position is provided
    if (!playerPosition) return;

    // Generate grid lines with absolute coordinates
    const newGridLines = generateGridLines(
      playerPosition,
      MINI_MAP_RADIUS,
      MINI_MAP_CENTER_X,
      MINI_MAP_CENTER_Y
    );

    setGridLines(newGridLines);

    // Project NPCs to minimap - only those on the visible hemisphere
    if (npcs && npcs.length > 0) {
      const newProjectedNpcs = npcs
        .map((npc) => {
          // Use the same visibility threshold as in the projection function
          if (
            !isPointVisible(
              npc.position,
              playerPosition,
              MINI_MAP_VISIBLE_DISTANCE_THRESHOLD
            )
          ) {
            return null;
          }

          const projection = projectToMinimap(
            npc.position,
            playerPosition,
            MINI_MAP_RADIUS
          );

          // Skip if projection is null
          if (!projection) return null;

          return {
            id: npc.id,
            type: npc.type,
            x: MINI_MAP_CENTER_X + projection.x,
            y: MINI_MAP_CENTER_Y + projection.y,
          };
        })
        .filter((npc): npc is NonNullable<typeof npc> => npc !== null);

      setProjectedNpcs(newProjectedNpcs);
    }
  }, [playerPosition, npcs]);

  // Get color for NPC type
  const getNpcColor = (type: string): string => {
    switch (type) {
      case NpcType.Flag:
        return MINI_MAP_FLAG_COLOR; // Green
      case NpcType.Person:
        return MINI_MAP_PERSON_COLOR; // Yellow/Gold
      case NpcType.Billboard:
        return MINI_MAP_BILLBOARD_COLOR; // Blue
      default:
        return MINI_MAP_DEFAULT_COLOR; // White fallback
    }
  };

  // Get size for NPC marker based on type
  const getNpcSize = (type: string): number => {
    switch (type) {
      case NpcType.Flag:
        return MINI_MAP_NPC_SIZE_MEDIUM; // Square
      case NpcType.Person:
        return MINI_MAP_NPC_SIZE_SMALL; // Slightly smaller
      case NpcType.Billboard:
        return MINI_MAP_NPC_SIZE_LARGE; // Larger
      default:
        return MINI_MAP_NPC_SIZE_SMALL;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(255, 255, 255, 0.5)",
        backgroundColor: "rgba(0, 0, 15, 0.7)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={{ display: "block" }}
      >
        {/* Planet background circle representing visible hemisphere */}
        <circle
          cx={MINI_MAP_CENTER_X}
          cy={MINI_MAP_CENTER_Y}
          r={MINI_MAP_RADIUS + 5}
          fill="rgba(26, 26, 46, 0.9)"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* Circular grid boundary */}
        <circle
          cx={MINI_MAP_CENTER_X}
          cy={MINI_MAP_CENTER_Y}
          r={MINI_MAP_RADIUS}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.3"
        />

        {/* Latitude grid lines (parallels) */}
        {gridLines.latitudeLines.map((line, index) => (
          <g key={`lat-${index}`}>
            <polyline
              points={line.points}
              stroke={MINI_MAP_GRID_COLOR}
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            />
            {/* Only show Equator label */}
            {line.label === "Equator" && (
              <text
                x={MINI_MAP_CENTER_X + 35}
                y={MINI_MAP_CENTER_Y}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="6"
                opacity="0.9"
              >
                {line.label}
              </text>
            )}
          </g>
        ))}

        {/* Longitude grid lines (meridians) */}
        {gridLines.longitudeLines.map((line, index) => (
          <g key={`long-${index}`}>
            <polyline
              points={line.points}
              stroke={MINI_MAP_GRID_COLOR}
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            />
            {/* Only show Prime Meridian label */}
            {line.label === "Prime Meridian" && (
              <text
                x={MINI_MAP_CENTER_X}
                y={MINI_MAP_CENTER_Y + 35}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="6"
                opacity="0.9"
              >
                {line.label}
              </text>
            )}
          </g>
        ))}

        {/* Compass direction indicators */}
        <text
          x={MINI_MAP_CENTER_X}
          y="15"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {t("compass.north")}
        </text>
        <text
          x={MINI_MAP_CENTER_X}
          y="195"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {t("compass.south")}
        </text>
        <text
          x="10"
          y={MINI_MAP_CENTER_Y}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {t("compass.west")}
        </text>
        <text
          x="190"
          y={MINI_MAP_CENTER_Y}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {t("compass.east")}
        </text>

        {/* Pole markers */}
        {gridLines.poleMarkers.map((pole, index) => (
          <g key={`pole-${index}`}>
            <circle
              cx={pole.x}
              cy={pole.y}
              r="3"
              fill={pole.isNorth ? "#ffffff" : "#aaaaaa"}
              stroke="#000000"
              strokeWidth="0.5"
            />
            <text
              x={pole.x}
              y={pole.isNorth ? pole.y - 5 : pole.y + 10}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8"
              fontWeight="bold"
            >
              {pole.isNorth ? "N" : "S"}
            </text>
          </g>
        ))}

        {/* NPCs */}
        {projectedNpcs.map((npc) => {
          const size = getNpcSize(npc.type);
          return (
            <rect
              key={npc.id}
              x={npc.x - size / 2}
              y={npc.y - size / 2}
              width={size}
              height={size}
              fill={getNpcColor(npc.type)}
              stroke="#000000"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Player position marker - triangle pointing in movement direction */}
        <polygon
          points={`${MINI_MAP_CENTER_X},${MINI_MAP_CENTER_Y - 6} ${
            MINI_MAP_CENTER_X - 4
          },${MINI_MAP_CENTER_Y + 6} ${MINI_MAP_CENTER_X + 4},${
            MINI_MAP_CENTER_Y + 6
          }`}
          fill={MINI_MAP_PLAYER_COLOR}
          stroke="#000000"
          strokeWidth="0.5"
          transform={`rotate(${
            playerPosition
              ? calculateRelativeRotation(
                  playerPosition,
                  playerLookDirection,
                  playerRotation
                )
              : 0
          }, ${MINI_MAP_CENTER_X}, ${MINI_MAP_CENTER_Y})`}
        />

        {/* Add a small center dot to mark exact player position */}
        <circle
          cx={MINI_MAP_CENTER_X}
          cy={MINI_MAP_CENTER_Y}
          r="1"
          fill="#ffffff"
          stroke="none"
        />
      </svg>
    </div>
  );
};

export default Minimap;
