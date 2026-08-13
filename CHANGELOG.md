# Changelog

## 1.5.0 — Arcade OS foundation

- Added a responsive cabinet-style arcade dashboard.
- Added original Kai Arcade hero artwork and game-room visual system.
- Added local profiles, mode preference, Coach toggle and sound toggle.
- Added lifecycle-safe animation loop with visibility pause for Snack World.
- Added touch-friendly playable Pool, Bowling, Darts and Connect Four rooms.
- Added a visibly animated Retro World of Snacks simulation prototype.
- Added offline-first documentation and GitHub publish instructions.

## 1.5.1 — Original 20-game base upgrade

- Rebased the published entry point on the original attached `Kai_Arcade_OS_v1_20_Games.html`.
- Preserved all 20 original game rooms and their existing mechanics.
- Added original Kai hero artwork to the existing shell.
- Added low-cost F2 performance HUD with FPS, frame time, active-loop count and room.
- Added coarse-pointer touch target refinements and reduced mobile blur.
- Added visibility pause safeguards for long-running shooter/snack loops.

## 1.5.2 — Gameplay depth pass

- Added strategic Connect Four search, Othello corner-aware AI and Chess AI.
- Added Chess king safety, castling and en-passant handling.
- Added Pool opponent aiming, Darts swipe throws/modes/opponent, and football shooting AI.
- Added manual Battleships fleet placement with rotation and hunt/target AI.
- Added Frustration, Guess Who and Property Empire opponent layers.
- Replaced Operation random success with precision checks.
- Added support-aware KerPlunk drops and Mouse Trap trigger animation.
- Added Shooting Gallery ammo, reload, accuracy and stage feedback.
- Browser-tested all 20 rooms after the pass with zero console errors.
- Added Mastermind Easy/Standard/Hard cycling with hard-mode unique colours and eight-guess pressure.
- Added Shooting Gallery reload, accuracy and stage feedback.

## Remaining v1 backlog

The 20-room brief is larger than a single safe greenfield pass. The remaining rooms are registered and routed through the shared shell; their deeper rules, AI and physics should be implemented room-by-room next, with Pool/Bowling/Darts/Football/Snack World as the current priority vertical slice.
