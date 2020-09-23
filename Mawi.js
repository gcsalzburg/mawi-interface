class Mawi {

	_currentSequence = null;

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
	// TODO: Tidy up this function 
	draw_steps(){
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
				let _step = steps[j];

				// Set width of block based on duration
				const _new_width = (this._currentSequence.get_zoom() * _step.dataset.duration);
				_step.style.width = _new_width + 'px';

				// Add class .small if the width of the block is narrow
				_step.classList.remove('small');
				if(_new_width < 200){
					_step.classList.add("small");
				}

				// Update text value on block
				_step.querySelector('.duration_value').textContent = _step.dataset.duration

				// Update start value based on previous start value
				if(last_start >= 0){
					_step.querySelector(".start_value").textContent = last_start;
				}
				last_start = _step.querySelector(".end_value").textContent;

				// Set colour style based on ease tyle
				let _ease = _step.querySelector('.ease_value').textContent;
				_step.classList.remove('step_linear');
				_step.classList.remove('step_ease');
				_step.classList.remove('step_bounce');
				if(_ease.indexOf('linear') >= 0){
					_step.classList.add('step_linear');
				}else if(_ease.indexOf('ease') >= 0){
					_step.classList.add('step_ease');
				}else if(_ease.indexOf('bounce') >= 0){
					_step.classList.add('step_bounce');
				}
			}
		}
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

	// Update step durations
	// Expects:
	// step_data = {
	//		start_x: 0,
	// 	before_step: [node],
	//		before_duration: 0,
	//		after_step: [node],
	//		after_duration: 0
	//	}
	update_step_durations(step_data, new_x){

		const difference = ((new_x-step_data.start_x)/this._currentSequence.get_zoom());

		if(step_data.before_step != null){
			step_data.before_step.dataset.duration = Math.max( Math.round(step_data.before_duration + difference) ,50);
		}
		if(step_data.after_step != null){
			step_data.after_step.dataset.duration = Math.max( Math.round(step_data.after_duration - difference) ,50);
		}
		mw.draw_steps(); // on the fly, so that we apply things like "small" class to shrinking boxes
	}

	// Update zoom
	update_zoom(direction){

		this._currentSequence.zoom(direction);

		// Now rebuild everything.
		mw.draw_scale();
		mw.draw_steps();
	}

}