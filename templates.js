const template_step = `
	<div class="step" data-start="{{start}}" data-ease="{{ease}}"  data-end="{{end}}"  data-duration="{{duration}}">
		<div class="transition">
			<span contentEditable="true" class="start_value">{{start}}</span>
			<span class="ease_value">{{ease}}</span>
			<span contentEditable="true" class="end_value">{{end}}</span>
		</div>
		<div class="other-data">
			<span class="duration_value">{{duration}}</span>
		</div>
		<a href="#delete" class="delete_step">Remove</a>
		<a href="#drag_down" class="step_drag drag_down"></a>
		<a href="#drag_right" class="step_drag drag_right"></a>
	</div>
`;

const template_step_divider = `<div class="step_divider"><a href="#add" class="add_step"></a></div>`;

const data_default = {
	start: 0,
	ease: "linear",
	end: 100,
	duration: 500
};