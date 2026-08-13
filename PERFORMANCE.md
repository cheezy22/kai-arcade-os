# Performance notes

The shell is designed around one active animation loop. Static rooms use DOM only; the Snack World canvas starts a loop on entry, stops on exit, and pauses when the tab is hidden. No background game loops are created for inactive rooms. The visual system uses restrained shadows and no backdrop blur.

Latest browser regression opened all 20 rooms successfully with zero captured error/warning logs. The single-file build also passes `node --check` on its embedded script.

## Verification

- `index.html` is standalone and does not fetch network dependencies.
- `localStorage` save/load is guarded by a single small state object.
- Room navigation cancels the previous RAF handle before creating a new one.
- Touch interactions use pointer-safe button targets and canvas/table `touch-action` where needed.

## Next benchmark pass

Run on a real iPhone/iPad and add a browser performance overlay with FPS, frame time and active loop count once deeper physics rooms are connected.
