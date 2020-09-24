# MAWI Interface

## Features Roadmap

|Category|Feature|Status|
|---|---|---|
|Enhancement|Multiple sequence selector|🔴|
|UX|Limits and intelligent scale adjustments|🔴|
|UX|Shift+drag for stepped movement|🔴|
|Enhancement|History push/pop with undo button|🔴|
|Core|Ease selector popup|🔴|


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