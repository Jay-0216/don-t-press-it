import type { ExperiencePhase } from "./state";
import type { Effects } from "./effects";

export interface EventContext {
  clicks: number;
  phase: ExperiencePhase;
  effects: Effects;
  say: (text: string, duration?: number) => void;
  whisper: (text: string, duration?: number) => void;
  setTitle: (title: string, duration?: number) => void;
}

interface EventDefinition {
  id: string;
  minClicks: number;
  maxClicks?: number;
  weight: number;
  cooldown: number;
  phases?: ExperiencePhase[];
  run: (ctx: EventContext) => Promise<void> | void;
}

const eventPool: EventDefinition[] = [
  { id: "morph", minClicks: 3, weight: 7, cooldown: 2, run: ({ effects }) => effects.morph() },
  { id: "dodge", minClicks: 5, weight: 4, cooldown: 5, run: ({ effects }) => effects.dodge() },
  { id: "shake", minClicks: 7, weight: 4, cooldown: 5, run: ({ effects }) => effects.shake(false) },
  { id: "vanish", minClicks: 9, weight: 3, cooldown: 7, run: ({ effects }) => effects.vanishButton() },
  { id: "squeeze", minClicks: 12, weight: 3, cooldown: 8, run: ({ effects }) => effects.squeeze() },
  { id: "grain", minClicks: 14, weight: 3, cooldown: 7, run: ({ effects }) => effects.grainBurst() },
  { id: "wash", minClicks: 16, weight: 2, cooldown: 9, run: ({ effects }) => effects.redWash() },
  { id: "fall", minClicks: 20, weight: 2, cooldown: 10, run: ({ effects }) => effects.fall() },
  { id: "curtains", minClicks: 24, weight: 2, cooldown: 12, phases: ["unstable", "aware", "hostile"], run: ({ effects }) => effects.curtains() },
  { id: "perspective", minClicks: 27, weight: 2, cooldown: 10, run: ({ effects }) => effects.perspectiveFlip() },
  { id: "tear", minClicks: 32, weight: 2, cooldown: 13, phases: ["unstable", "aware", "hostile"], run: ({ effects }) => effects.tear() },
  { id: "invert", minClicks: 38, weight: 1, cooldown: 16, phases: ["aware", "hostile"], run: ({ effects }) => effects.invertWorld() },
  { id: "storm", minClicks: 42, weight: 2, cooldown: 15, phases: ["aware", "hostile"], run: ({ effects }) => effects.textStorm(["NO", "STOP", "WHY", "DON'T", "AGAIN?", "PLEASE", "ENOUGH", "NO", "STOP"]) },
  { id: "blackout", minClicks: 46, weight: 2, cooldown: 14, phases: ["aware", "hostile"], run: ({ effects }) => effects.blackout(2600) },
  { id: "meltdown", minClicks: 60, weight: 1, cooldown: 28, phases: ["hostile"], run: ({ effects }) => effects.meltdown() },
];

export class EventDirector {
  private lastTriggered = new Map<string, number>();
  private busy = false;

  async maybeRun(ctx: EventContext): Promise<void> {
    if (this.busy) return;

    const chance = Math.min(0.72, 0.28 + ctx.clicks * 0.007);
    if (Math.random() > chance) return;

    const eligible = eventPool.filter((event) => {
      if (ctx.clicks < event.minClicks) return false;
      if (event.maxClicks !== undefined && ctx.clicks > event.maxClicks) return false;
      if (event.phases && !event.phases.includes(ctx.phase)) return false;
      const last = this.lastTriggered.get(event.id) ?? -999;
      return ctx.clicks - last >= event.cooldown;
    });

    if (eligible.length === 0) return;

    const totalWeight = eligible.reduce((sum, event) => sum + event.weight, 0);
    let pick = Math.random() * totalWeight;
    let chosen = eligible[0]!;
    for (const event of eligible) {
      pick -= event.weight;
      if (pick <= 0) {
        chosen = event;
        break;
      }
    }

    this.busy = true;
    this.lastTriggered.set(chosen.id, ctx.clicks);
    try {
      await chosen.run(ctx);
    } finally {
      window.setTimeout(() => {
        this.busy = false;
      }, 180);
    }
  }
}
