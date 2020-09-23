
class Sequence {

	name = "default";

	_zoom_scale = 1;
	_zoom_speed = 0.15;

	// Array of saved steps of data
	// Corresponds to the joints array
	joints_history = [];

	constructor(_json){
		// Should perhaps check data is valid here

		// Add latest data to history
		this.joints_history.push(_json);

	}

	get_zoom(){
		return this._zoom_scale;
	}

	// Render and return a sequence
	// Defaults to rendering the latest step in the history
	load(){
		return this.joints_history[this.joints_history.length - 1];
	}

	// Save the current state of the sequence to the history
	// Also returns the saved data json  
	save(joints_container = document.querySelector(".joints")){
		 // Create sequence structure
		const return_data = {
			name: "put name here", // Todo: get this from somewhere
			joints: []
		};

		// Iterate over joints
		const joints = joints_container.querySelectorAll('.joint');
		for(let i=0; i<joints.length; i++){

			const _joint_steps = {
				joint: joints[i].getAttribute("id"), // Todo: get this meta data from somewhere better
				steps: []
			};

			// Iterate over steps
			const _steps = joints[i].querySelectorAll(".step");
			for(let j=0; j<_steps.length; j++){
				_joint_steps.steps.push({
					start_value: 	_steps[j].dataset.startValue,
					ease_value:		_steps[j].dataset.easeValue,
					end_value:		_steps[j].dataset.endValue,
					duration:		_steps[j].dataset.duration
				});
			}

			// Only save steps data where some steps exist
			if(_steps.length > 0){
				return_data.joints.push(_joint_steps);
			}
		}

		// Save and return
		this.joints_history.push(return_data);
		return return_data;
	}

	// Zoom in or zoom out
	// Returns the current zoom scale
	zoom(direction){
		// TODO: Add min/max checks
		this._zoom_scale = this._zoom_scale - direction*this._zoom_speed;

		return this._zoom_scale;
	}
}