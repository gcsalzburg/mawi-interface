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

const template_sequence_link = `<a href="#" id="{{id}}" class="sq_select" data-name="{{name}}">{{name}}</a>`;

const template_ease_type = `<a href="#" data-ease="{{name}}" data-family="{{reference}}" class="ease_type ease_type_{{class}} {{#clear}}clear_before{{/clear}}"><span class="ease_name">{{name}}</span></a>`;

const data_default_sequence = {
	name: "New sequence",
	joints: [
		{
			joint: "beak",
			steps: [
				{
					start: 0,
					ease: "linear",
					end: 180,
					duration: 500
				}
			]
		}
	]
};

const data_default_step = {
	start: 0,
	ease: "linear",
	end: 180,
	duration: 500
};