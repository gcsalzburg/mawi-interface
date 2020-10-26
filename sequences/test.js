const test_sequence_data = {
	name: "Sample",
	joints: [
		{
			joint: "beak",
			steps: [
				{
					start: "120",
					ease: "linear",
					end: "60",
					duration: "500"
				},
				{
					start: "60",
					ease: "ease-in",
					end: "110",
					duration: "300"
				},
				{
					start: "110",
					ease: "bounce-in",
					end: "110",
					duration: "300"
				}
			]
		},
		{
			joint: "head",
			steps: [
				{
					start: "4",
					ease: "ease-in",
					end: "80",
					duration: "700"
				}
			]
		},
		{
			joint: "elbow",
			steps: [
				{
					start: "120",
					ease: "bounce-out",
					end: "60",
					duration: "250"
				},
				{
					start: "60",
					ease: "bounce-out",
					end: "110",
					duration: "300"
				}
			]
		}
	]
};