# 🟢 Tap BPM

_Measure beats per minute (BPM) with keyboard presses_

Recently I've been writing down the BPM of some songs I have on vinyl using a similar tap tool I found online. While pretty much exactly the interface I wanted, the readout made it tough sometimes to decide what number I'd want to record, and the UI wasn't really optimized for my phone which made it kind of annoying to use. Naturally, I made my own.

—Jason, Dec 2023.

## Features

- Keyboard interface for easy tapping.
- Tracks the last 1, 4, 8, 16, and 32 beats and displays their averages.
- No 'zoom in' on (my) phone when focussing the text input (so you don't lose sight of the BPM readouts and have to zoom back out before tapping)
- Reset button automatically re-focusses the tap input
- Shows progress to the next full beat-period
- Pulses the count on tap for better visual feedback when the count isn't in the center of your vision. (bc you're focussing on the BPMs!)
- Highlights the most common BPM value amongst fully measured periods to more easy discern what might be the best BPM measurement.

## Developing

It's a good ol `index.html` + `script.js` + `style.css`. Make your changes, test to see if the blips still blip, commit and push.

- It works by keeping a trailing average of the last `x` bpm measurements. For each period of `x` beats we maintain an array of size `x`, continually update the oldest value on every tap, then take a new average to display in the DOM.
- ALL CAPS globals please
- Dom elements are kept in a global object called `ELS` (for elements)

## Deployment

The `main` branch of this repo is automatically deployed on GitHub Pages: https://jasonflorentino.github.io/tap-bpm/

## TODO

- Highlight toggle?
- Toggle to show fractional measurements (just one tenth)?

## Contributing

First of all wow, thank you. But I just made this little thing for my personal use and I may not have the time to actively check and review PRs.
