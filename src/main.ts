import "./styles.css";
import { animate } from "motion";
import { chirp, pressSound } from "./audio";
import { createCounterStore } from "./counter";
import { Effects } from "./effects";
import { EventDirector } from "./events";
import { loadState, phaseFor, remember, saveState } from "./state";

function required<T extends Element>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing required element: ${selector}`);
  return node;
}

const shell = required<HTMLElement>("#app");
const stage = required<HTMLElement>("#stage");
const button = required<HTMLButtonElement>("#button");
const headline = required<HTMLElement>("#headline");
const count = required<HTMLElement>("#count");
const whisperNode = required<HTMLElement>("#whisper");

const effects = new Effects(
  {
    shell,
    stage,
    button,
    headline,
    veil: required<HTMLElement>("#veil"),
    wash: required<HTMLElement>("#wash"),
    grain: required<HTMLElement>("#grain"),
    leftCurtain: required<HTMLElement>("#leftCurtain"),
    rightCurtain: required<HTMLElement>("#rightCurtain"),
    tearA: required<HTMLElement>("#tearA"),
    tearB: required<HTMLElement>("#tearB"),
    floatingText: required<HTMLElement>("#floatingText"),
  },
  loadState().lastShape,
);

const state = loadState();
const director = new EventDirector();
const counterStore = createCounterStore();
let displayedCount = 18_392;
let messageToken = 0;
let whisperToken = 0;
let idleToken = 0;

void counterStore.get().then((value) => { displayedCount = value; count.textContent = value.toLocaleString(); });

function say(text: string, duration = 760): void {
  const token = ++messageToken;
  void animate(headline, { opacity: [1, 0], y: [0, 5] }, { duration: 0.12 }).finished.then(async () => {
    if (token !== messageToken) return;
    headline.textContent = text;
    await animate(headline, { opacity: [0, 1], y: [4, 0] }, { duration: 0.16 }).finished;
    window.setTimeout(() => {
      if (token !== messageToken) return;
      void animate(headline, { opacity: [1, 0] }, { duration: 0.12 }).finished.then(() => {
        if (token !== messageToken) return;
        headline.textContent = "DON'T PRESS IT.";
        void animate(headline, { opacity: [0, 1] }, { duration: 0.14 });
      });
    }, duration);
  });
}

function whisper(text: string, duration = 720): void {
  const token = ++whisperToken;
  whisperNode.textContent = text;
  void animate(whisperNode, { opacity: [0, 1], y: [3, 0] }, { duration: 0.15 });
  window.setTimeout(() => {
    if (token !== whisperToken) return;
    void animate(whisperNode, { opacity: [1, 0], y: [0, -2] }, { duration: 0.2 });
  }, duration);
}

function setTitle(title: string, duration = 1200): void {
  const previous = document.title;
  document.title = title;
  window.setTimeout(() => {
    document.title = previous;
  }, duration);
}

function context() {
  return {
    clicks: state.clicks,
    phase: phaseFor(state.clicks),
    effects,
    say,
    whisper,
    setTitle,
  } as const;
}

const milestoneActions = new Map<number, () => void | Promise<void>>([
  [1, () => say("I SAID DON'T.")],
  [2, () => say("SERIOUSLY?")],
  [3, async () => effects.morph()],
  [4, () => say("YOU'RE VERY GOOD AT LISTENING.")],
  [5, async () => effects.dodge()],
  [7, () => say("FINE.")],
  [8, async () => { await effects.shake(false); whisper("you missed the instruction."); }],
  [10, () => say("WHY.")],
  [12, async () => effects.squeeze()],
  [15, () => whisper("someone else just pressed it.", 820)],
  [18, async () => effects.morph()],
  [20, () => whisper("3 didn't.", 680)],
  [25, async () => effects.textStorm(["NO", "STOP", "WHY", "DON'T", "AGAIN?", "PLEASE"])],
  [30, async () => { await effects.blackout(2500); say("BETTER.", 650); }],
  [36, () => say("CAN YOU?")],
  [40, async () => { await effects.tear(); whisper("something moved.", 720); }],
  [50, async () => { say("OKAY. THAT IS ENOUGH.", 900); await effects.curtains(); }],
  [60, async () => { say("ENOUGH.", 700); await effects.meltdown(); }],
]);

async function handlePress(): Promise<void> {
  state.clicks += 1;
  state.lastSeenAt = Date.now();
  displayedCount = await counterStore.increment();
  count.textContent = displayedCount.toLocaleString();
  pressSound();
  if (navigator.vibrate) navigator.vibrate(12);

  void effects.press();

  const scripted = milestoneActions.get(state.clicks);
  if (scripted) {
    await scripted();
  } else {
    await director.maybeRun(context());
  }

  state.lastShape = effects.shapeIndex;
  saveState(state);
}

button.addEventListener("click", () => {
  idleToken += 1;
  void handlePress();
});

let holdTimer: number | undefined;
button.addEventListener("pointerdown", () => {
  holdTimer = window.setTimeout(async () => {
    remember(state, "held-button");
    say("...THAT'S WORSE.", 760);
    chirp();
    await effects.morph(1);
    if (navigator.vibrate) navigator.vibrate([24, 34, 24]);
  }, 1050);
});
["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
  button.addEventListener(type, () => window.clearTimeout(holdTimer));
});

document.addEventListener("visibilitychange", () => {
  if (state.clicks < 7) return;
  if (document.hidden) {
    document.title = "come back.";
  } else {
    document.title = "DON'T PRESS IT.";
    window.setTimeout(() => say("I SAW THAT.", 700), 320);
  }
});

document.addEventListener("contextmenu", (event) => {
  if (state.clicks < 9) return;
  event.preventDefault();
  remember(state, "context-menu");
  whisper("looking for something?", 720);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.clicks > 5) {
    say("THAT DOES NOT HELP.", 680);
    void effects.shake(false);
  }
});

if (state.visits > 1 && state.clicks > 0) {
  window.setTimeout(() => say("...YOU AGAIN.", 800), 650);
}

function scheduleIdleMessage(): void {
  const token = ++idleToken;
  window.setTimeout(() => {
    if (token !== idleToken || state.clicks < 3) return;
    whisper("are you done?", 760);
  }, 18000);
  window.setTimeout(() => {
    if (token !== idleToken || state.clicks < 12) return;
    say("...HELLO?", 700);
  }, 42000);
}

button.addEventListener("click", scheduleIdleMessage);
scheduleIdleMessage();
