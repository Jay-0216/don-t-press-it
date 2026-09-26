# Agent rules

- Preserve the quiet default screen: ivory background, one red button, tiny counter.
- New effects belong in `src/effects.ts`; pacing rules belong in `src/events.ts`.
- Keep text reactions short and visual effects longer.
- Do not add a game HUD, menus, XP, achievements, or click-ripple circles.
- Keep mobile interaction first-class and respect reduced motion.
- Before merging: run typecheck and build, then review the diff.
