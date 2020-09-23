
// Load Sequence
// Takes a sequence JSON as an input and writes it to the timeline on screen
function load_sequence(sequence_json){

    // Iterate over joints
    const joints = document.querySelectorAll('.joint');
	for(i=0; i<joints.length; i++){
        // Replace lastChild (.steps class) with a single step divider 
		joints[i].lastElementChild.innerHTML = Mustache.render(template_step_divider);
	}

    // Iterate over incoming sequence joint data
	for(i=0; i<sequence_json.joints.length; i++){
		const _joint_name = sequence_json.joints[i].joint;
        const _steps_array = sequence_json.joints[i].steps;
        
        const _steps_container = document.querySelector(`#${_joint_name} .steps`);
        
        // Add steps one by one, followed by a divider after each one
		for(j=0; j<_steps_array.length; j++){
			_steps_container.innerHTML += Mustache.render(template_step, _steps_array[j]) + Mustache.render(template_step_divider);
		}
	}
}

// Unload Sequence
// Converts the data currently on the timeline on screen and returns a sequence JSON object
function unload_sequence(){

    // Create sequence structure
	const _sequence = {
		name: "put name here", // Todo: get this from somewhere
		joints: []
	};

    // Iterate over joints
	const joints = document.querySelectorAll('.joint');
	for(i=0; i<joints.length; i++){

		const _joint_steps = {
			joint: joints[i].getAttribute("id"), // Todo: get this meta data from somewhere better
			steps: []
		};

        // Iterate over steps
		const _steps = joints[i].querySelectorAll(".step");
		for(j=0; j<_steps.length; j++){
			_joint_steps.steps.push({
				start_value: 	_steps[j].querySelector(".start_value").textContent, // Todo: get this meta data from somewhere better
				ease_value:		_steps[j].querySelector(".ease_value").textContent,
				end_value:		_steps[j].querySelector(".end_value").textContent,
				duration:		_steps[j].querySelector(".duration_value").textContent
			});
		}

        // Only save steps data where some steps exist
        if(_steps.length > 0){
            _sequence.joints.push(_joint_steps);
        }
    }

    // End
    return _sequence;
}