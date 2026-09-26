# DON'T PRESS IT.

A deliberately minimal, strange website built around one rule: **don't press the red button**.

The surface is calm: ivory background, one polished red control, almost no UI. The deeper behavior is an event-driven interaction system that remembers anonymous repeat visitors and becomes increasingly invasive as they keep pressing.

## Stack

- Vite 8
- TypeScript
- Motion 13 for animation sequencing
- Local anonymous state (no login)

The global counter is still a local fallback in this branch. The frontend is structured so a server-authoritative realtime counter can replace it without changing the interaction engine.

## Development

```bash
npm install
npm run dev
```

Verification:

```bash
npm run typecheck
npm run build
```

## Experience principles

- The default screen stays quiet and sparse.
- Effects are rare enough to remain surprising, but strong enough to feel consequential.
- Text reactions are brief; visual effects last longer.
- No click ripples, XP, menus, achievements, or game HUD.
- The button can radically morph while preserving one coherent visual material.
- The page itself becomes part of the interaction: tab title, right click, idle time, escape key, repeat visits.
