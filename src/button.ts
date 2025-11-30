import type { TgpuRoot, TgpuUniform } from 'typegpu';
import * as std from 'typegpu/std';
import {
  squashXProperties,
  squashZProperties,
  wiggleXProperties,
} from './constants.ts';
import { SwitchState } from './dataTypes.ts';
import { Spring } from './spring.ts';

export class ButtonBehavior {
  #root: TgpuRoot;

  stateUniform: TgpuUniform<typeof SwitchState>;

  // State
  pressed = false;

  // Derived physical state
  #inputPos: number;
  #velocity: number;
  #squashXSpring: Spring;
  #squashZSpring: Spring;
  #wiggleXSpring: Spring;

  #accX: number | null;
  #accZ: number | null;

  constructor(root: TgpuRoot) {
    this.#root = root;

    this.#inputPos = 0;
    this.#velocity = 0;
    this.#squashXSpring = new Spring(squashXProperties);
    this.#squashZSpring = new Spring(squashZProperties);
    this.#wiggleXSpring = new Spring(wiggleXProperties);

    this.#accX = 0;
    this.#accZ = 0;

    this.stateUniform = this.#root.createUniform(SwitchState);
  }

  async init() {
    window.addEventListener('devicemotion', (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      this.#accX = acc.x ?? 0;
      this.#accZ = acc.z ?? 0;
    });
  }

  update(dt: number) {
    if (dt <= 0) return;

    // Button behavior: pressed = squish down, released = bounce back
    const targetPos = this.pressed ? 0 : 1;
    const acceleration = 100;

    // Apply force towards target
    if (this.#inputPos < targetPos) {
      this.#velocity += acceleration * dt;
    } else if (this.#inputPos > targetPos) {
      this.#velocity -= acceleration * dt;
    }

    // Anticipating movement when pressed
    if (this.pressed && this.#inputPos < 0.1) {
      this.#squashXSpring.velocity = 5;
      this.#squashZSpring.velocity = 5;
      this.#wiggleXSpring.velocity = Math.random() * 2 - 2;
    }

    // Update position
    this.#inputPos = this.#inputPos + this.#velocity * dt;

    // Add wiggle based on velocity
    if (Math.abs(this.#velocity) > 0.1) {
      this.#wiggleXSpring.velocity = this.#velocity * -0.1;
    }

    // Bounce at extremes
    if (this.#inputPos > 1) {
      this.#inputPos = 1;
      this.#velocity = 0; //-this.#velocity * 0.3; // Bounce back
      this.#squashXSpring.velocity = 5;
      this.#squashZSpring.velocity = 5;
      this.#wiggleXSpring.velocity = 5;
    }
    if (this.#inputPos < 0) {
      this.#inputPos = 0;
      this.#velocity = 0; //-this.#velocity * 0.3; // Bounce back
      this.#squashXSpring.velocity = -5;
      this.#squashZSpring.velocity = 5;
      this.#wiggleXSpring.velocity = 8;
    }

    this.#inputPos = std.saturate(this.#inputPos);

    // Damping
    this.#velocity *= 0.95;

    // Spring dynamics
    this.#squashXSpring.update(dt);
    this.#squashZSpring.update(dt);
    this.#wiggleXSpring.update(dt);

    this.#updateGPUBuffer();
  }

  #updateGPUBuffer() {
    this.stateUniform.write({
      posX: this.#inputPos * (this.#accX ?? 0) / -3,
      posY: this.#inputPos,
      posZ: this.#inputPos * (this.#accZ ?? 0) / -3,

      squashX: this.#squashXSpring.value,
      squashZ: this.#squashZSpring.value,
      wiggleX: this.#wiggleXSpring.value,
    });
  }
}
