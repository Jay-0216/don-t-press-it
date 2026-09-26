# Architecture

## Core flow

`main.ts` owns DOM wiring and user interaction. Each press updates anonymous persisted state, checks scripted milestones, then delegates optional unscripted events to `EventDirector`.

`events.ts` is the pacing layer. It selects eligible effects by phase, weight, and cooldown, and prevents effect spam.

`effects.ts` is the visual engine. It owns button morph presets and all full-page effect sequences. Motion is used for timing and sequencing; CSS owns the base material and layout.

`state.ts` stores only anonymous local experience state: generated ID, visits, click count, discovered behaviors, and last button shape. No login or personal profile is required.

`audio.ts` synthesizes tiny UI sounds with Web Audio. No audio assets are required.

## Experience phases

- `calm`: first few presses; mostly copy and morphs.
- `annoyed`: movement and page-level reactions begin.
- `unstable`: blackout, compression, curtains and stronger transitions.
- `aware`: the page starts behaving like it knows what the visitor is doing.
- `hostile`: rare compound sequences such as `meltdown` become eligible.

## Backend boundary

The visible count currently uses a local fallback. A future realtime backend should expose only:

1. get global count
2. atomically increment global count
3. subscribe to count / world-state changes
4. optionally map the anonymous local ID to a server anonymous identity

The interaction engine must not depend directly on Supabase or any single provider.
