// src/game/npcs/AnimatedModel.ts
import { StaticModel } from "./StaticModel";
import * as THREE from "three";
import { IConversation } from "./interfaces/IConversation";
import {
  createAnimationMixer,
  playAnimation,
  loadModel,
} from "../../utils/modelLoader";

/**
 * AnimatedModel - extends StaticModel to support animated 3D models
 */
export class AnimatedModel extends StaticModel {
  private animationMixer: THREE.AnimationMixer | null = null;
  private animations: THREE.AnimationClip[] = [];
  private currentAnimation: THREE.AnimationAction | null = null;
  private clock: THREE.Clock;

  /**
   * Create a new AnimatedModel
   * @param id Unique identifier for this NPC
   * @param name Name of the model
   * @param conversationEnabled Whether this model can have conversations
   * @param groundOffset Height offset from the ground
   * @param radius Collision radius
   * @param mesh Optional mesh if already created
   * @param modelPath Path to the GLB model file
   * @param conversation Optional conversation data
   */
  constructor(
    id: string,
    name: string,
    conversationEnabled: boolean = true,
    groundOffset: number = 0,
    radius: number = 2,
    mesh?: THREE.Group,
    modelPath?: string,
    conversation?: IConversation
  ) {
    // Call the parent constructor
    super(id, name, conversationEnabled, groundOffset, radius, mesh, modelPath);

    // Set conversation if provided
    if (conversation) {
      this.setConversation(conversation);
    }

    // Initialize clock for animations
    this.clock = new THREE.Clock();

    // Load model separately if path is provided
    if (modelPath) {
      this.loadAnimatedModel(modelPath);
    }
  }

  /**
   * Load the animated model
   * @param modelPath Path to the model file
   */
  private async loadAnimatedModel(modelPath: string): Promise<void> {
    try {
      // Load the model
      const result = await loadModel(modelPath);

      // Add the model to the mesh
      this.getMesh().add(result.scene);

      // Apply scale
      result.scene.scale.set(this.getScale(), this.getScale(), this.getScale());

      // Set up animations if available
      if (result.animations && result.animations.length > 0) {
        this.setAnimations(result.animations);
        console.log(
          `${result.animations.length} animations loaded for ${this.getName()}`
        );
      }

      console.log(`Animated model loaded for ${this.getName()}`);
    } catch (error) {
      console.error(
        `Failed to load animated model for ${this.getId()}:`,
        error
      );
    }
  }

  /**
   * Set up the animation system after the model is loaded
   * @param animations Animation clips from the loaded model
   */
  public setAnimations(animations: THREE.AnimationClip[]): void {
    this.animations = animations;

    if (animations.length > 0) {
      // Create animation mixer
      this.animationMixer = createAnimationMixer(this.getMesh() as THREE.Group);
    }
  }

  /**
   * Play a specific animation by name
   * @param name Name of the animation to play
   * @param loop Whether to loop the animation (default: true)
   * @param crossFadeDuration Time to blend between animations (in seconds)
   * @returns The animation action that was started, or null if not found/available
   */
  public playAnimation(
    name?: string,
    loop: THREE.AnimationActionLoopStyles = THREE.LoopRepeat,
    crossFadeDuration: number = 0.5
  ): THREE.AnimationAction | null {
    if (!this.animationMixer || this.animations.length === 0) {
      console.warn(`No animations available for ${this.getId()}`);
      return null;
    }

    // Stop current animation with crossfade if one is playing
    if (this.currentAnimation) {
      if (crossFadeDuration > 0) {
        this.currentAnimation.fadeOut(crossFadeDuration);
      } else {
        this.currentAnimation.stop();
      }
    }

    // Play the new animation
    const newAnimation = playAnimation(this.animationMixer, this.animations, {
      name,
      loop,
      clampWhenFinished: loop === THREE.LoopOnce,
      timeScale: 1.0,
    });

    // If we're crossfading, fade in the new animation
    if (newAnimation && crossFadeDuration > 0) {
      newAnimation.reset().fadeIn(crossFadeDuration).play();
    }

    this.currentAnimation = newAnimation;
    return newAnimation;
  }

  /**
   * Stop the current animation
   * @param fadeOutDuration Time to fade out the animation (in seconds)
   */
  public stopAnimation(fadeOutDuration: number = 0.5): void {
    if (this.currentAnimation) {
      if (fadeOutDuration > 0) {
        this.currentAnimation.fadeOut(fadeOutDuration);
      } else {
        this.currentAnimation.stop();
      }
      this.currentAnimation = null;
    }
  }

  /**
   * Pause the current animation
   */
  public pauseAnimation(): void {
    if (this.currentAnimation) {
      this.currentAnimation.paused = true;
    }
  }

  /**
   * Resume the current animation
   */
  public resumeAnimation(): void {
    if (this.currentAnimation) {
      this.currentAnimation.paused = false;
    }
  }

  /**
   * Update the animation mixer with the current delta time
   * This should be called in the game loop
   * @param deltaTime Time elapsed since the last update (in seconds)
   */
  public update(deltaTime?: number): void {
    if (!this.animationMixer) return;

    // If no deltaTime provided, use the internal clock
    const dt = deltaTime !== undefined ? deltaTime : this.clock.getDelta();

    // Update the animation mixer
    this.animationMixer.update(dt);
  }

  /**
   * Get all available animations for this model
   * @returns Array of animation clips
   */
  public getAnimations(): THREE.AnimationClip[] {
    return this.animations;
  }

  /**
   * Get animation names for this model
   * @returns Array of animation names
   */
  public getAnimationNames(): string[] {
    return this.animations.map((clip) => clip.name);
  }

  /**
   * Check if this model has a specific animation
   * @param name Name of the animation to check
   * @returns True if the animation exists, false otherwise
   */
  public hasAnimation(name: string): boolean {
    return this.animations.some((clip) => clip.name === name);
  }

  /**
   * Get the current animation action
   * @returns The current animation action, or null if none is playing
   */
  public getCurrentAnimation(): THREE.AnimationAction | null {
    return this.currentAnimation;
  }
}
