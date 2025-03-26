import { IConversation } from "@/game/npcs/interfaces/IConversation";
import * as THREE from "three";

export const PLANET_RADIUS = 30;
export const BACKGROUND_RADIUS = 700;
export const FIRST_PERSON_HEIGHT = 5;
export const PLANET_CENTER = new THREE.Vector3(0, 0, 0);
export const DEFAULT_CAMERA_PITCH = 0.35;

export const EPSILON = 0.0001;

export const PLAYER_RADIUS = 3;
export const DEFAULT_NPC_RADIUS = 2;
export const NEARBY_DISTANCE = 10;
export const INTERACTION_DISTANCE = 10;

export const WELCOME_CONVERSTAION: IConversation = {
  title: "Welcome",
  messages: [
    "Welcome to Shinyeong Planet! 👋",
    "⚙️ Change your name and check your coordinates",
    "🗺️ Toggle the minimap to help navigate the planet.",
    "ℹ️ View control information",
    "⌨️ Toggle virtual keyboard",
    "Feel free to explore the entire planet and get to know me better!",
    "Thank you for visiting Shinyeong Planet. Enjoy your journey!",
  ],
  icon: "📚",
};

export const DEFAULT_BILLBOARD_CONVERSTAION: IConversation = {
  title: "resume",
  messages: ["I will attach my resume later."],
  icon: "📄",
};

export const DEFAULT_FLAG_CONVERSTAION: IConversation = {
  title: "Experience Flag",
  messages: [
    "This flag represents an experience in a specific country.",
    "The year indicates when this experience took place.",
    "You can see more details about what I learned and accomplished here.",
    "I will fill this in later.",
  ],
  icon: "🏳️",
};

export const DEFAULT_PERSON_CONVERSTAION: IConversation = {
  title: "Guide",
  messages: [
    "Welcome to Shinyeong Planet! I'm your guide.",
    "Walk around to explore various experiences and achievements.",
    "Approach objects to interact with them and learn more.",
    "Use WASD to move and arrow keys to look around.",
  ],
  icon: "👤",
};

/** Virtual Controls */

export const VIRTUAL_CONTROLS_GROUP_WIDTH = "10.0rem";
export const VIRTUAL_CONTROLS_GROUP_HEIGHT = "10.0rem";
export const VIRTUAL_CONTROLS_BUTTON_VERTICAL_TOP = "0";
export const VIRTUAL_CONTROLS_BUTTON_VERTICAL_CENTER = "50px";
export const VIRTUAL_CONTROLS_BUTTON_VERTICAL_BOTTOM = "100px";
export const VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER = "70px";
export const VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT = "20px";
export const VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT = "120px";
export const VIRTUAL_CONTROLS_GROUP_POSITION = {
  center: {
    top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_CENTER,
    left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER,
  },
  up: {
    top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_TOP,
    left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER,
  },
  down: {
    top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_BOTTOM,
    left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER,
  },
  left: {
    top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_CENTER,
    left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
  },
  right: {
    top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_CENTER,
    left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
  },
};
export const VIRTUAL_CONTROL_BUTTON_COLOR = {
  pressed: "rgba(233, 69, 96, 0.8)",
  default: "rgba(40, 40, 60, 0.6)",
  center: "rgba(255, 255, 255, 1.0)",
};

export const DISPLAY_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.5)";

export const CORNER_MARGIN = "2%";
export const TINY_FONT_SIZE = "0.75rem";
export const SMALL_FONT_SIZE = "1rem";
export const MEDIUM_FONT_SIZE = "2rem";
export const LARGE_FONT_SIZE = "3rem";
export const FONT_COLOR = "white";

export const TOGGLE_BUTTON_SIZE = "min(40px, 12vw)";
export const TOGGLE_ACTIVE_COLOR = "rgba(83, 52, 131, 0.8)";
export const TOGGLE_INACTIVE_COLOR = "rgba(40, 40, 60, 0.8)";
export const TOGGLE_BORDER_COLOR = "rgba(255, 255, 255, 0.3)";

/** Mini map */

export const MINI_MAP_RADIUS = 90;
export const MINI_MAP_CENTER_X = 100;
export const MINI_MAP_CENTER_Y = 100;
export const MINI_MAP_FLAG_COLOR = "#33cc33"; // Green
export const MINI_MAP_PERSON_COLOR = "#ffcc00"; // Yellow/Gold
export const MINI_MAP_BILLBOARD_COLOR = "#00aaff"; // Blue
export const MINI_MAP_DEFAULT_COLOR = "#ffffff"; // White
export const MINI_MAP_PLAYER_COLOR = "#ff3333"; // Red
export const MINI_MAP_GRID_COLOR = "rgba(255, 255, 255, 0.4)";
export const MINI_MAP_VISIBLE_DISTANCE_THRESHOLD = 0.0;
export const MINI_MAP_NPC_SIZE_SMALL = 4;
export const MINI_MAP_NPC_SIZE_MEDIUM = 5;
export const MINI_MAP_NPC_SIZE_LARGE = 6;

/** Scene */
export const BACKGROUND_COLOR_CODE = 0x00001a;
export const BACKGROUND_COLOR_RGBA = "rgba(0, 0, 26, 1)";

export const BACKGROUND_UPDATE_INTERVAL = 10000; // 10 seconds in milliseconds

export const BACKGROUND_GRADIENTS = {
  dark: [
    new THREE.Color("rgba(10, 10, 30, 1)"), // deep space blue
    new THREE.Color("rgba(25, 25, 112, 1)"), // midnight blue
    new THREE.Color("rgba(18, 18, 18, 1)"), // almost black
    new THREE.Color("rgba(54, 69, 79, 1)"), // dark slate gray
    new THREE.Color("rgba(72, 61, 139, 1)"), // dark slate blue
    new THREE.Color("rgba(47, 79, 79, 1)"), // dark cyan-gray
    new THREE.Color("rgba(0, 0, 0, 1)"), // pure black
    new THREE.Color("rgba(28, 24, 50, 1)"), // galaxy purple
    new THREE.Color("rgba(75, 0, 130, 1)"), // indigo
    new THREE.Color("rgba(44, 44, 84, 1)"), // twilight blue
  ],
  medium: [
    new THREE.Color("rgba(100, 149, 237, 1)"), // cornflower blue
    new THREE.Color("rgba(144, 238, 144, 1)"), // light green
    new THREE.Color("rgba(255, 160, 122, 1)"), // light salmon
    new THREE.Color("rgba(186, 85, 211, 1)"), // medium orchid
    new THREE.Color("rgba(255, 218, 185, 1)"), // peach puff
    new THREE.Color("rgba(205, 133, 63, 1)"), // peru
    new THREE.Color("rgba(147, 112, 219, 1)"), // medium purple
    new THREE.Color("rgba(176, 196, 222, 1)"), // light steel blue
    new THREE.Color("rgba(210, 180, 140, 1)"), // tan
    new THREE.Color("rgba(244, 164, 96, 1)"), // sandy brown
  ],
  pale: [
    new THREE.Color("rgba(255, 192, 203, 1)"),
    new THREE.Color("rgba(135, 206, 235, 1)"),
    new THREE.Color("rgba(173, 216, 230, 1)"),
    new THREE.Color("rgba(255, 182, 193, 1)"),
    new THREE.Color("rgba(255, 255, 224, 1)"),
    new THREE.Color("rgba(221, 160, 221, 1)"),
    new THREE.Color("rgba(144, 238, 144, 1)"),
    new THREE.Color("rgba(255, 228, 225, 1)"),
    new THREE.Color("rgba(240, 248, 255, 1)"),
    new THREE.Color("rgba(255, 250, 240, 1)"),
    new THREE.Color("rgba(224, 255, 255, 1)"),
    new THREE.Color("rgba(250, 235, 215, 1)"),
  ],
};

export type TIME_BASED = "morning" | "day" | "evening" | "night";

export function getDaytimePeriod(date: Date = new Date()): TIME_BASED {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
