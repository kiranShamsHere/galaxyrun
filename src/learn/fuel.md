# Propellant and delta-v

Delta-v is the change in speed a spacecraft can make. The rocket equation estimates it from the engine's specific impulse and the spacecraft's mass before and after a burn:

`delta-v = specific impulse × 9.80665 × ln(start mass / end mass)`

## Check the math by hand

For a 300-second engine, a 500 kg spacecraft before the burn, and 400 kg after it:

`delta-v = 300 × 9.80665 × ln(500 / 400) ≈ 656.5 m/s`

The 100 kg difference is the propellant used in this example.

## What this game simplifies

Galaxy Run treats each scenario's required delta-v as an educational game target. It estimates propellant with the ideal rocket equation and does not model engine thrust duration, gravity losses, staging, tank dry mass, or a detailed interplanetary transfer. The launcher payload check does include spacecraft hardware, propulsion dry mass, and selected propellant.
