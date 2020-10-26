# MAWI Interface

## Features Roadmap

|Category|Feature|Status|
|---|---|---|
|Core|Start/end value selector|🟢|
|Core|Ease selector popup|🔴|
|Core|Connect to Arduino|🔴|
|Core|Write data to Arduino|🔴|
|Core|History push/pop with undo button|🟢|
|Core|Multiple sequence selector|🟢|
|UX|Limits and intelligent scale adjustments|🔴|
|UX|Shift+drag for stepped movement|🟢|
|UX|Allow scrollwheel +/- on numerical inputs|🟢|
|Bug|Dragging of steps when scrolled down is offset|🔴|
|Bug|Dragged steps have start values continuously edited when hovering in different rows|🔴|
|Bug|Only update history for scrollwheel on numerical inputs when cursor leaves the box|🟢|


## Data structure

```json
{
	name: "Sequence name",
	joints: [
		{
			joint: "beak",
			steps: [
				{
					start: 120,
					ease: "linear",
					end: 60,
					duration: 500
				},
				{
					ease: "ease-in",
					end: 110,
					duration: 300
				}
			]
		},
		{
			joint: "head",
			steps: [
				{
					start: 4,
					ease: "ease-in",
					end: 80,
					duration: 700
				}
			]
		}
	]
}
```