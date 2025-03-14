import { IConversation } from "@/game/npcs/IConversation";
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
