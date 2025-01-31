
class Sequence {

	name = "default";

	_zoom_scale = 1;
	_zoom_speed = 0.15;

	// Array of saved steps of data
	// Corresponds to the joints array
	joints_history = [];
	_history_index = 0; // The current index of what is being shown

	constructor(_json){
		// Should perhaps check data is valid here

		// Set name
		this.name = _json.name;

		// Add latest data to history
		this.joints_history.push(_json);

		return this;
	}

	get_zoom(){
		return this._zoom_scale;
	}

	// Render and return a sequence
	// Defaults to rendering the latest step in the history
	load(){
		return this.joints_history[this.joints_history.length - 1];
	}

	// Checks if we have history forwards or backwards available
	get_history_status(){
		const state = {
			has_undo: false,
			has_undoundo: false
		};
		if(this._history_index < (this.joints_history.length-1)){
			state.has_undoundo = true;
		}
		if(this._history_index > 0){
			state.has_undo = true;
		}
		return state;
	}

	// Step forward or backwards in time along the undo / undoundo timeline
	history(direction){
		if(direction > 0){
			// Go forwards
			if(this._history_index < (this.joints_history.length-1)){
				this._history_index++;
				return this.joints_history[this._history_index];
			}
		}else if(direction < 0){
			// Go backwards
			if(this._history_index > 0){
				this._history_index--;
				return this.joints_history[this._history_index];
			}
		}
		return false;
	}

	// Save the current state of the sequence to the history
	save(joints_container = document.querySelector(".joints")){
		 // Create sequence structure
		const new_save_state = {
			name: this.name,
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
					start: 		_steps[j].dataset.start,
					ease:		_steps[j].dataset.ease,
					end:		_steps[j].dataset.end,
					duration:	_steps[j].dataset.duration
				});
			}

			// Only save steps data where some steps exist
			if(_steps.length > 0){
				new_save_state.joints.push(_joint_steps);
			}
		}

		// Check its not a duplicate
		if(!_.isEqual(this.joints_history[this._history_index], new_save_state) && (this.joints_history.length > 0)){

			// Check if we are already "undoing"
			if(this._history_index < (this.joints_history.length-1)){
				// We are at an undo step, so delete everything in front of this.
				this.joints_history.splice(this._history_index+1,this.joints_history.length-this._history_index);
			}

			// Push new history state and return
			this.joints_history.push(new_save_state);
			this._history_index++;
		}
	}

	// Zoom in or zoom out
	// Returns the current zoom scale
	zoom(direction){
		// TODO: Add min/max checks
		this._zoom_scale = this._zoom_scale - direction*this._zoom_speed;

		return this._zoom_scale;
	}
}