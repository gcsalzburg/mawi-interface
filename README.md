# MAWI Interface

## Features Roadmap

|Feature|Status|
|---|---|
|Re-factor into classes|🟢|
|Multiple sequence selector|🔴|
|Limits and intelligent scale adjustments|🔴|
|Shift+drag for stepped movement|🔴|
|History push/pop with undo button|🔴|


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