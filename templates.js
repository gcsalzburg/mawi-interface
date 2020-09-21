const template_step = `
	<div class="step">
		<div class="transition">
			<span contentEditable="true" class="start_value">{{start_value}}</span>
			<span class="ease_value">{{ease_value}}</span>
			<span contentEditable="true" class="end_value">{{end_value}}</span>
		</div>
		<div class="other-data">
			<span class="duration_value">{{duration}}</span>
		</div>
		<a href="#delete" class="delete_step">Remove</a>
		<a href="#drag_right" class="step_drag drag_right"></a>
	</div>
`;

const template_step_divider = `<div class="step_divider">
<a href="#add" class="add_step"></a></div>`;

const data_default = {
	start_value: 0,
	ease_value: "linear",
	end_value: 100,
	duration: 500
};