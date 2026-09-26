import { animate, stagger } from "motion";
import { impactSound } from "./audio";

export interface FxDom {
  shell: HTMLElement;
  stage: HTMLElement;
  button: HTMLButtonElement;
  headline: HTMLElement;
  veil: HTMLElement;
  wash: HTMLElement;
  grain: HTMLElement;
  leftCurtain: HTMLElement;
  rightCurtain: HTMLElement;
  tearA: HTMLElement;
  tearB: HTMLElement;
  floatingText: HTMLElement;
}

export interface ShapePreset {
  name: string;
  width: string;
  height: string;
  radius: string;
  clipPath?: string;
  rotate: number;
}

export const SHAPES: ShapePreset[] = [
  { name: "squircle", width: "70%", height: "70%", radius: "31%", rotate: 0 },
  { name: "island", width: "94%", height: "23%", radius: "999px", rotate: 0 },
  { name: "dot", width: "24%", height: "24%", radius: "50%", rotate: 0 },
  { name: "capsule", width: "30%", height: "91%", radius: "999px", rotate: 0 },
  { name: "panel", width: "91%", height: "49%", radius: "25%", rotate: 0 },
  { name: "pebble", width: "80%", height: "60%", radius: "58% 42% 52% 48% / 47% 56% 44% 53%", rotate: -8 },
  { name: "diamond", width: "68%", height: "68%", radius: "20%", clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)", rotate: 0 },
  { name: "hex", width: "86%", height: "61%", radius: "0", clipPath: "polygon(17% 0,83% 0,100% 50%,83% 100%,17% 100%,0 50%)", rotate: 0 },
  { name: "slab", width: "96%", height: "32%", radius: "10%", rotate: 0 },
  { name: "ticket", width: "86%", height: "56%", radius: "18%", clipPath: "polygon(0 0,100% 0,100% 35%,92% 50%,100% 65%,100% 100%,0 100%,0 65%,8% 50%,0 35%)", rotate: 0 },
  { name: "blade", width: "88%", height: "24%", radius: "8%", clipPath: "polygon(5% 0,100% 0,95% 100%,0 100%)", rotate: -13 },
  { name: "tile", width: "58%", height: "58%", radius: "14%", rotate: 17 },
];

const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function duration(value: number): number {
  return prefersReducedMotion ? 0.01 : value;
}

export class Effects {
  private dom: FxDom;
  private currentShape = 0;

  constructor(dom: FxDom, initialShape = 0) {
    this.dom = dom;
    this.currentShape = Math.max(0, Math.min(SHAPES.length - 1, initialShape));
    this.applyShape(SHAPES[this.currentShape]!, false);
  }

  get shapeIndex(): number {
    return this.currentShape;
  }

  async press(): Promise<void> {
    await animate(
      this.dom.button,
      { scale: [1, 0.93, 1], y: [-4, 2, -4] },
      { duration: duration(0.24), easing: [0.22, 1, 0.36, 1] },
    ).finished;
  }

  async morph(forceIndex?: number): Promise<void> {
    let next = forceIndex ?? Math.floor(Math.random() * SHAPES.length);
    if (next === this.currentShape) next = (next + 1) % SHAPES.length;
    this.currentShape = next;
    const preset = SHAPES[next]!;

    await animate(
      this.dom.button,
      { scaleX: [1, 0.7, 1.08, 1], scaleY: [1, 1.22, 0.93, 1], rotate: [0, preset.rotate * 1.35, preset.rotate] },
      { duration: duration(0.72), easing: [0.16, 1, 0.3, 1] },
    ).finished;
    this.applyShape(preset, true);
  }

  async dodge(): Promise<void> {
    const x = (Math.random() * 2 - 1) * Math.min(innerWidth * 0.28, 160);
    const y = (Math.random() * 2 - 1) * Math.min(innerHeight * 0.13, 90);
    await animate(
      this.dom.stage,
      { x: [0, x, x * 0.9, 0], y: [0, y, y * 0.9, 0] },
      { duration: duration(1.65), times: [0, 0.18, 0.74, 1], easing: [0.16, 1, 0.3, 1] },
    ).finished;
  }

  async shake(strong = false): Promise<void> {
    impactSound(strong ? 2 : 1);
    const amp = strong ? 18 : 8;
    await animate(
      this.dom.shell,
      {
        x: [0, -amp, amp * 0.8, -amp * 0.7, amp * 0.55, 0],
        y: [0, amp * 0.35, -amp * 0.28, amp * 0.2, -amp * 0.12, 0],
        rotate: [0, -0.8, 0.6, -0.45, 0.25, 0],
      },
      { duration: duration(strong ? 1.2 : 0.78), easing: "ease-in-out" },
    ).finished;
  }

  async blackout(ms = 2200): Promise<void> {
    impactSound(1.4);
    const seconds = ms / 1000;
    await animate(
      this.dom.veil,
      { opacity: [0, 1, 1, 0] },
      { duration: duration(seconds), times: [0, 0.12, 0.78, 1], easing: "ease-in-out" },
    ).finished;
  }

  async redWash(): Promise<void> {
    await animate(
      this.dom.wash,
      { opacity: [0, 0.72, 0.42, 0] },
      { duration: duration(2.4), times: [0, 0.18, 0.72, 1], easing: "ease-in-out" },
    ).finished;
  }

  async grainBurst(): Promise<void> {
    await animate(
      this.dom.grain,
      { opacity: [0, 0.58, 0.28, 0.5, 0] },
      { duration: duration(2.1), easing: "linear" },
    ).finished;
  }

  async curtains(): Promise<void> {
    impactSound(1.8);
    await Promise.all([
      animate(this.dom.leftCurtain, { x: ["-102%", "0%", "0%", "-102%"] }, { duration: duration(2.7), times: [0, 0.23, 0.69, 1], easing: [0.16, 1, 0.3, 1] }).finished,
      animate(this.dom.rightCurtain, { x: ["102%", "0%", "0%", "102%"] }, { duration: duration(2.7), times: [0, 0.23, 0.69, 1], easing: [0.16, 1, 0.3, 1] }).finished,
    ]);
  }

  async tear(): Promise<void> {
    impactSound(1.3);
    await Promise.all([
      animate(this.dom.tearA, { x: ["-110%", "-8%", "-4%", "-110%"], rotate: [-3, -3, -2, -3] }, { duration: duration(2.3), times: [0, 0.2, 0.78, 1], easing: [0.16, 1, 0.3, 1] }).finished,
      animate(this.dom.tearB, { x: ["110%", "8%", "4%", "110%"], rotate: [3, 3, 2, 3] }, { duration: duration(2.3), times: [0, 0.2, 0.78, 1], easing: [0.16, 1, 0.3, 1] }).finished,
    ]);
  }

  async squeeze(): Promise<void> {
    impactSound(1.2);
    await animate(
      this.dom.shell,
      { scaleX: [1, 0.76, 1.06, 1], scaleY: [1, 1.14, 0.96, 1], borderRadius: ["0px", "44px", "16px", "0px"] },
      { duration: duration(1.85), easing: [0.16, 1, 0.3, 1] },
    ).finished;
  }

  async fall(): Promise<void> {
    impactSound(1.6);
    const amount = Math.min(innerHeight * 0.34, 260);
    await animate(
      this.dom.button,
      { y: [-4, amount, amount - 48, amount, -4], rotate: [0, 8, -5, 2, 0], scaleY: [1, 0.82, 1.08, 0.92, 1] },
      { duration: duration(2.15), times: [0, 0.42, 0.58, 0.72, 1], easing: [0.18, 0.9, 0.2, 1] },
    ).finished;
  }

  async perspectiveFlip(): Promise<void> {
    await animate(
      this.dom.shell,
      { rotateY: [0, 18, -12, 4, 0], rotateX: [0, -8, 6, -2, 0], scale: [1, 0.95, 1.02, 1] },
      { duration: duration(2.2), easing: [0.16, 1, 0.3, 1] },
    ).finished;
  }

  async vanishButton(): Promise<void> {
    await animate(
      this.dom.button,
      { opacity: [1, 0, 0, 1], scale: [1, 0.72, 0.72, 1] },
      { duration: duration(2), times: [0, 0.18, 0.72, 1], easing: "ease-in-out" },
    ).finished;
  }

  async invertWorld(): Promise<void> {
    await animate(
      document.documentElement,
      { filter: ["invert(0) hue-rotate(0deg)", "invert(1) hue-rotate(180deg)", "invert(1) hue-rotate(180deg)", "invert(0) hue-rotate(0deg)"] },
      { duration: duration(2.35), times: [0, 0.18, 0.76, 1], easing: "ease-in-out" },
    ).finished;
  }

  async textStorm(words: string[]): Promise<void> {
    const nodes = words.slice(0, 10).map((word, index) => {
      const node = document.createElement("span");
      node.className = "floating-word";
      node.textContent = word;
      node.style.left = `${7 + ((index * 17) % 83)}%`;
      node.style.top = `${-12 - (index % 3) * 8}%`;
      node.style.rotate = `${-16 + (index % 5) * 8}deg`;
      this.dom.floatingText.appendChild(node);
      return node;
    });

    await animate(
      nodes,
      { y: [0, innerHeight * 1.22], opacity: [0, 0.8, 0.72, 0], rotate: [0, 18] },
      { delay: stagger(0.08), duration: duration(2.9), easing: [0.25, 0.72, 0.35, 1] },
    ).finished;
    nodes.forEach((node) => node.remove());
  }

  async meltdown(): Promise<void> {
    impactSound(2.4);
    await Promise.all([
      this.redWash(),
      this.grainBurst(),
      this.shake(true),
      this.morph(),
    ]);
    await Promise.all([this.tear(), this.squeeze()]);
  }

  private applyShape(preset: ShapePreset, animateTransition: boolean): void {
    const style = this.dom.button.style;
    style.width = preset.width;
    style.height = preset.height;
    style.borderRadius = preset.radius;
    style.clipPath = preset.clipPath ?? "none";
    style.setProperty("--shape-rotate", `${preset.rotate}deg`);

    if (!animateTransition) {
      style.transition = "none";
      requestAnimationFrame(() => style.removeProperty("transition"));
    }
  }
}
