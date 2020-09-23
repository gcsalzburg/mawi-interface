const test_sequence = {
	name: "Test 1",
	joints: [
		{
			joint: "beak",
			steps: [
				{
					start_value: 120,
					ease_value: "linear",
					end_value: 60,
					duration: 500
				},
				{
					ease_value: "ease-in",
					end_value: 110,
					duration: 300
				},
				{
					ease_value: "bounce-in",
					end_value: 110,
					duration: 300
				}
			]
		},
		{
			joint: "head",
			steps: [
				{
					start_value: 4,
					ease_value: "ease-in",
					end_value: 80,
					duration: 700
				}
			]
		},
		{
			joint: "elbow",
			steps: [
				{
					start_value: 120,
					ease_value: "bounce-out",
					end_value: 60,
					duration: 250
				},
				{
					ease_value: "bounce-out",
					end_value: 110,
					duration: 300
				}
			]
		}
	]
};