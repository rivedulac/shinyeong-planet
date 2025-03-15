import { IConversation } from "@/game/npcs/interfaces/IConversation";
import * as THREE from "three";

export const PLANET_RADIUS = 25;
export const FIRST_PERSON_HEIGHT = 5;
export const PLANET_CENTER = new THREE.Vector3(0, 0, 0);
export const DEFAULT_CAMERA_PITCH = 0.35;

export const EPSILON = 0.0001;

export const PLAYER_RADIUS = 3;
export const FLAG_RADIUS = 2;
export const BILLBOARD_RADIUS = 3;
export const PERSON_RADIUS = 2;
export const NEARBY_DISTANCE = 10;
export const INTERACTION_DISTANCE = 10;

export const DEFAULT_BILLBOARD_CONVERSTAION: IConversation = {
  title: "resume",
  messages: [
    "Welcome to my resume billboard!",
    "This billboard showcases my professional experience and skills.",
    "Feel free to take a look at my qualifications and projects.",
    "I'm always open to new opportunities and collaborations.",
  ],
  icon: "📄",
};

export const DEFAULT_FLAG_CONVERSTAION: IConversation = {
  title: "Experience Flag",
  messages: [
    "This flag represents an experience in a specific country.",
    "The year indicates when this experience took place.",
    "You can see more details about what I learned and accomplished here.",
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
