const test_sequence_data = {
	name: "Test 1",
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
				},
				{
					ease: "bounce-in",
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
		},
		{
			joint: "elbow",
			steps: [
				{
					start: 120,
					ease: "bounce-out",
					end: 60,
					duration: 250
				},
				{
					ease: "bounce-out",
					end: 110,
					duration: 300
				}
			]
		}
	]
};