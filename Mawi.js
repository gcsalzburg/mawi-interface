class Mawi {

	_currentSequence = null;

	_drag_step_snap = 50;

	constructor(){}

	set_sequence(sequence){
		this._currentSequence = sequence;
	}

	// Render the blocks to the screen
	load_sequence(sq = this._currentSequence.load()){

		// Iterate over joints to prepare containers
		const joints = document.querySelectorAll('.joint');
		for(let i=0; i<joints.length; i++){
			// Replace lastChild (.steps class) with a single step divider 
			joints[i].lastElementChild.innerHTML = Mustache.render(template_step_divider);
		}

		// Iterate over incoming sequence joint data
		for(let i=0; i<sq.joints.length; i++){
			const _joint_name = sq.joints[i].joint;
			const _steps_array = sq.joints[i].steps;
			
			const _steps_container = document.querySelector(`#${_joint_name} .steps`);
			
			// Add steps one by one, followed by a divider after each one
			for(let j=0; j<_steps_array.length; j++){
				_steps_container.innerHTML += Mustache.render(template_step, _steps_array[j]) + Mustache.render(template_step_divider);
			}
		}
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
		step.classList.remove('step_linear');
		step.classList.remove('step_ease');
		step.classList.remove('step_bounce');
		if(ease.indexOf('linear') >= 0){
			step.classList.add('step_linear');
		}else if(ease.indexOf('ease') >= 0){
			step.classList.add('step_ease');
		}else if(ease.indexOf('bounce') >= 0){
			step.classList.add('step_bounce');
		}
		
		// Update text values
		step.querySelector(".start_value").textContent = step.dataset.start;
		step.querySelector(".start_value").textContent = step.dataset.end;
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
		const new_step_data = Mustache.render(template_step, data_default) + Mustache.render(template_step_divider);
		const nodes = document.createRange().createContextualFragment(new_step_data);
		step_divider.after(nodes);

		this.draw_all_steps(); // Re-draw the steps
	}

	// Delete the step that is provided
	delete_step(step){
		step.nextElementSibling.remove(); // Delete the step divider after this step
		step.remove();	// Delete the step itself

		// TODO: Only redraw the front step in this row
		this.draw_all_steps(); // Re-draw the steps
	}

	// Update the ease value for a step
	update_step_ease(step,ease_value){

		step.dataset.easeValue = ease_value;

		this.draw_step(step); // Re-draw the steps
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
	update_step_durations(step_data, new_x, ctrl_key=false){

		const difference = ((new_x-step_data.start_x)/this._currentSequence.get_zoom());

		console.log(ctrl_key);
		let round_step = 0;
		if(ctrl_key){
			round_step = this._drag_step_snap;
		}

		if(step_data.before_step != null){
			step_data.before_step.dataset.duration = this._get_new_step_width(step_data.before_duration,difference,round_step);
			this.draw_step(step_data.before_step);
		}
		if(step_data.after_step != null){
			step_data.after_step.dataset.duration = this._get_new_step_width(step_data.after_duration,difference,round_step);
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
	_get_new_step_width(previous_width, difference, round_step = 0, minimum = 50){

		let new_w = Math.round(previous_width+difference);
		if(round_step > 0){
			new_w = Math.round(new_w/round_step)*round_step;
		}

		return Math.max(new_w, minimum);
	}

}