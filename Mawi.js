class Mawi {

	_currentSequence = null;

	_drag_step_snap = 50;

	constructor(){}

	// Create a new sequence 
	create_sequence(sequence_data = data_default_sequence){

		// Create new sequence using default data if needed
		const new_sq = new Sequence(sequence_data);

		new_sq.id = new_sq.name + '_' + (Math.random() + 1).toString(36).substring(7);

		// Add button to list
		const new_button = document.createRange().createContextualFragment(Mustache.render(template_sequence_link, new_sq));
		document.querySelector('.sq_add').before(new_button);

		return new_sq;
	}

	// Loads a new sequence in
	load_sequence(sequence = this._currentSequence){

		// Set the correct reference on the top bar
		for(let link of document.querySelectorAll('.sq_select')){
			link.classList.remove("sq_current");
			if(link.id == sequence.id){
				link.classList.add("sq_current");
			}
		}

		// Save this sequence as we the new sequence (might already be set to this)
		this._set_sequence(sequence);

		// Now render the sequence
		this.render_sequence(sequence.load());
	}

	render_sequence(data = this._currentSequence.load()){

		// Iterate over joints to prepare containers
		const joints = document.querySelectorAll('.joint');
		for(let i=0; i<joints.length; i++){
			// Replace lastChild (.steps class) with a single step divider 
			joints[i].lastElementChild.innerHTML = Mustache.render(template_step_divider);
		}

		// Iterate over incoming sequence joint data
		for(let i=0; i<data.joints.length; i++){
			const _joint_name = data.joints[i].joint;
			const _steps_array = data.joints[i].steps;
			
			const _steps_container = document.querySelector(`#${_joint_name} .steps`);
			
			// Add steps one by one, followed by a divider after each one
			for(let j=0; j<_steps_array.length; j++){
				_steps_container.innerHTML += Mustache.render(template_step, _steps_array[j]) + Mustache.render(template_step_divider);
			}
		}
		
		this.draw_scale();		// Draw the scale
		this.draw_all_steps();	// Format steps
	}

	
	_set_sequence(sequence){
		this._currentSequence = sequence;
	}

	save_sequence(){
		this._currentSequence.save();
		this.set_undo_buttons();
	}

	undo(){
		this.render_sequence(this._currentSequence.history(-1));
		this.draw_all_steps();
		this.set_undo_buttons();
	}
	undoundo(){
		this.render_sequence(this._currentSequence.history(1));
		this.draw_all_steps();
		this.set_undo_buttons();
	}

	set_undo_buttons(){
		const undo_button = document.querySelector(".undo");
		const undoundo_button = document.querySelector(".undoundo");
		const history_state = this._currentSequence.get_history_status();
		history_state.has_undo ? undo_button.classList.remove("disabled") : undo_button.classList.add("disabled");
		history_state.has_undoundo ? undoundo_button.classList.remove("disabled") : undoundo_button.classList.add("disabled");
	}

	// Format some settings for the steps
	draw_all_steps(steps_array){
		const joints = document.querySelectorAll('.joint');
		for(let i=0; i<joints.length; i++){

			// Tag
			joints[i].classList.remove('joint_empty');
			if(joints[i].querySelectorAll('.step').length < 1){
				joints[i].classList.add('joint_empty');
			}

			const steps = joints[i].querySelectorAll('.step');
			let last_start = -1;
			for(let j=0; j<steps.length; j++){
				last_start = this.draw_step(steps[j], last_start);
			}
		}
	}

	draw_step(step, last_start = -1){

		// Set width of block based on duration
		const _new_width = (this._currentSequence.get_zoom() * step.dataset.duration);
		step.style.width = _new_width + 'px';

		// Add class .small if the width of the block is narrow
		step.classList.remove('small');
		if(_new_width < 200){
			step.classList.add("small");
		}

		// Update start value based on previous start value
		if(last_start >= 0){
			step.dataset.start = last_start;
		}

		// Set colour style based on ease style
		const ease = step.dataset.ease;
		step.classList.remove('step_pause');
		step.classList.remove('step_linear');
		step.classList.remove('step_ease');
		step.classList.remove('step_bounce');
		if(step.dataset.start == step.dataset.end){
			step.classList.add('step_pause');
		}else if(ease.indexOf('linear') >= 0){
			step.classList.add('step_linear');
		}else if(ease.indexOf('ease') >= 0){
			step.classList.add('step_ease');
		}else if(ease.indexOf('bounce') >= 0){
			step.classList.add('step_bounce');
		}
		
		// Update text values
		// We do a change check here, to avoid the carat jumping when we are in middle of editing the box
		if(step.querySelector(".start_value").textContent != step.dataset.start){
			step.querySelector(".start_value").textContent = step.dataset.start;
		}
		if(step.querySelector(".end_value").textContent != step.dataset.end){
			step.querySelector(".end_value").textContent = step.dataset.end;
		}
		step.querySelector('.duration_value').textContent = step.dataset.duration;
		step.querySelector('.ease_value').textContent = step.dataset.ease;

		// Return the end value, to help with the correct setting of the next start value
		return step.dataset.end;
	}

	// Draws the steps and scale at their new positions based on the sliding scale
	move_scale(x){
		const steps = document.querySelectorAll(".step, .step_divider");
		for(let i=0; i<steps.length; i++){
			steps[i].style.transform = `translateX(${x}px`;
		}
		document.querySelector(".scale").style.transform = `translateX(${x}px)`;
	}

	// Draw the scale to the screen based on the current zoom setting
	draw_scale(){
		const scale = document.querySelector('.scale');
	
		const scale_factor = this._currentSequence.get_zoom();
	
		let markers = scale.querySelectorAll(".major, .minor");
		for(let i=0; i<markers.length; i++){
			markers[i].remove();
		}
	
		// minor = every 20ms
		// major = every 100ms
		// scale length = up to 2000ms
	
		let _scale_length = 2000;
		let _major_markers = 100;
		let _minor_markers = 20;
	
		// Calculate spacings
		let _major_spacing = _major_markers*scale_factor;
		let _minor_spacing = _minor_markers*scale_factor;
	
		// TODO: create scale spacing iteratively
		if(_minor_spacing > 25){
			_minor_markers /= 2;
			_major_markers /= 2;
	
			_major_spacing = _major_markers*scale_factor;
			_minor_spacing = _minor_markers*scale_factor;
		}else if(_minor_spacing < 12){
			_minor_markers *= 2;
			_major_markers *= 2;
	
			_major_spacing = _major_markers*scale_factor;
			_minor_spacing = _minor_markers*scale_factor;
	
		}
	
		let _number_majors = (_scale_length / _major_markers)+1;
		let _number_minors = (_scale_length / _minor_markers)+1;
	
		for(let i=0; i<_number_majors; i++){
			scale.innerHTML += `<span class="major" data-value="${(_major_markers*i)}" style="left:${(_major_spacing*i)+1}px"></span>`;
		}
		
		for(let i=0; i<_number_minors; i++){
			scale.innerHTML += `<span class="minor" style="left:${(_minor_spacing*i)+1}px"></span>`;
		}
	}

	// Add a new step after the given step divider 
	add_step(step_divider){
		const new_step_data = Mustache.render(template_step, data_default_step) + Mustache.render(template_step_divider);
		const nodes = document.createRange().createContextualFragment(new_step_data);
		step_divider.after(nodes);

		this.draw_all_steps();  // Re-draw the steps
		this.save_sequence();	// Save the change
	}

	// Delete the step that is provided
	delete_step(step){
		step.nextElementSibling.remove(); // Delete the step divider after this step
		step.remove();	// Delete the step itself

		// TODO: Only redraw the front step in this row
		this.draw_all_steps(); // Re-draw the steps
		this.save_sequence();	// Save the change
	}

	update_step_end(step, end_value){
		step.dataset.end = parseInt(end_value,10);

		this.draw_all_steps(); 	// Re-draw the steps. We do the "all_steps" so that we catch the start value change for the next step
		this.save_sequence();	// Save the change
	}

	// Update the ease value for a step
	update_step_ease(step,ease_value){

		step.dataset.ease = ease_value;

		this.draw_step(step); 	// Re-draw the steps
		this.save_sequence();	// Save the change
	}

	// Update step durations
	// Expects:
	// step_data = {
	//		start_x: 0,
	// 	before_step: [node],
	//		before_duration: 0,
	//		after_step: [node],
	//		after_duration: 0
	//	}
	update_step_durations(step_data, new_x, shift_key=false){

		// Calculate difference at given zoom step
		const difference = ((new_x-step_data.start_x)/this._currentSequence.get_zoom());

		// If shift key held then snap to steps
		let round_step = 0;
		if(shift_key){
			round_step = this._drag_step_snap;
		}

		// Set new step size for before and after steps (if given)
		if(step_data.before_step != null){
			step_data.before_step.dataset.duration = this._get_new_step_width(step_data.before_duration+difference,round_step);
			this.draw_step(step_data.before_step);
		}
		if(step_data.after_step != null){
			step_data.after_step.dataset.duration = this._get_new_step_width(step_data.after_duration-difference,round_step);
			this.draw_step(step_data.after_step);
		}
	}

	// Update zoom
	update_zoom(direction){

		this._currentSequence.zoom(direction);

		// Now rebuild everything.
		this.draw_scale();
		this.draw_all_steps();
	}

	// Calculate a new step width based on the previous width and difference
	_get_new_step_width(new_width, round_step = 0, minimum = 50){

		let new_w = Math.round(new_width);

		// Round to snap size if needed
		if(round_step > 0){
			new_w = Math.round(new_w/round_step)*round_step;
		}

		// Don't go below minimum size
		return Math.max(new_w, minimum);
	}

}