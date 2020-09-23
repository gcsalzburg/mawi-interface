const sqs = [
	new Sequence(test_sequence_data)
];

const mw = new Mawi();
mw.set_sequence(sqs[0]);

// When page loads
document.addEventListener('DOMContentLoaded', () => {

	// Add scroll on scale listener for zooming
	document.querySelector(".scale").onwheel = function(event){
		event.preventDefault();
		mw.update_zoom(Math.sign(event.deltaY));
	};

	mw.load_sequence();	// Load the current sequence onto the display
	mw.draw_scale();		// Draw the scale
	mw.draw_steps();		// Format steps
});


// General click handling for UI
document.onclick = function(event) {

	event.preventDefault();

	const _e = event.target;

	if(_e.classList.contains("add_step")){
		// Add Step buttons = insert new divider + new step
		let nodes = document.createRange().createContextualFragment(Mustache.render(template_step, data_default) + Mustache.render(template_step_divider));
		_e.parentNode.after(nodes);
	}else	if(_e.classList.contains("delete_step")){
		// Remove Step buttons = delete step and node after it (divider)
		_e.parentNode.nextElementSibling.remove();
		_e.parentNode.remove();
	}else if(_e.classList.contains("ease_value")){
		// Select a different ease value
		// TODO: Create a selector for this
		if(_e.parentNode.parentNode.classList.contains("step_linear")){
			_e.textContent = "ease-in";
		}else if(_e.parentNode.parentNode.classList.contains("step_ease")){
			_e.textContent = "bounce";
		}else if(_e.parentNode.parentNode.classList.contains("step_bounce")){
			_e.textContent = "linear";
		}
	}
	mw.draw_steps();
};

// Drag handling for sliders
document.ondragstart = function(event){
	return false;	
};
document.onmousedown = function(event){

	const _e = event.target;

	if(_e.classList.contains("step_divider")){
		// Drag a step divider

		if((_e.previousElementSibling == null)||(_e.nextElementSibling == null)){
			// If this is the first or last step divider, we can't drag it
			return false;
		}
		_e.classList.add("is_dragging");

		// Save current sizes and positions
		const drag_data = {};
		drag_data.start_x = event.pageX;
		if(_e.previousElementSibling != null){
			drag_data.before_step = _e.previousElementSibling;
			drag_data.before_duration = parseInt(_e.previousElementSibling.querySelector(".duration_value").textContent);
		}
		if(_e.nextElementSibling != null){
			drag_data.after_step = _e.nextElementSibling;
			drag_data.after_duration = parseInt(_e.nextElementSibling.querySelector(".duration_value").textContent);
		}
		function onStepDividerDrag(event){
			mw.update_step_durations(drag_data,event.pageX);
		}
		document.addEventListener('mousemove', onStepDividerDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_e.classList.remove("is_dragging");
			document.removeEventListener('mousemove', onStepDividerDrag);
			document.onmouseup = null;
			mw.draw_steps();
		};
	}else if(_e.classList.contains("drag_right")){
		// Drag a handle inside an individual step

		_e.classList.add("is_dragging");
		_e.parentNode.parentNode.classList.add("hide_add_buttons");

		// Save current sizes and positions
		const drag_data = {};
		drag_data.start_x = event.pageX;
		if(_e.classList.contains("drag_right")){
			drag_data.before_step = _e.parentNode;
			drag_data.before_duration = parseInt(_e.parentNode.querySelector(".duration_value").textContent);
		}
		function onStepDividerDrag(event){
			mw.update_step_durations(drag_data,event.pageX);
		}
		document.addEventListener('mousemove', onStepDividerDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_e.classList.remove("is_dragging");
			_e.parentNode.parentNode.classList.remove("hide_add_buttons");
			document.removeEventListener('mousemove', onStepDividerDrag);
			document.onmouseup = null;
			mw.draw_steps();
		};
	}else if(_e.classList.contains("scale_dragger")){
		// Dragging the scale
		_f = _e.parentNode;
		_f.classList.add("is_dragging");

		const drag_data = {
			start_x: event.pageX
		};
		function onScaleDrag(event){
			_new_x = _f.dataset.offset - (drag_data.start_x - event.pageX);
			_new_x = Math.min(0,_new_x);
			_f.dataset.new_offset = _new_x;
			mw.move_scale(_new_x);
		}
		document.addEventListener('mousemove', onScaleDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_f.classList.remove("is_dragging");
			_f.dataset.offset = _f.dataset.new_offset;
			document.removeEventListener('mousemove', onScaleDrag);
			document.onmouseup = null;
			mw.draw_steps();
		};
	}else if(_e.classList.contains("drag_down")){ // Drag the down handler with the grabber hand
		_step = _e.parentNode;
		_step_floater = _step.cloneNode();
		_step_dropper = _step.cloneNode(true);
		_step_divider = _step.nextElementSibling.cloneNode(true);
		_step_floater.classList.add("floating");

		const drag_data = {
			shift_x: event.clientX - _step.getBoundingClientRect().left,
			shift_y: event.clientY - _step.getBoundingClientRect().top
		};

		document.body.prepend(_step_floater);
		document.body.classList.add("dragging_in_progress");

		_step_divider_removed = _step.nextElementSibling;
		_step_divider_removed.remove(); 	// Remove divider that follows this item
		_step.previousElementSibling.classList.add("removal_marker");
		_step.remove();						// Remove this item	

		let _steps_droppable_current = null;
		let _last_ctrl_state = null;
		move_at(event.pageX, event.pageY, event.ctrlKey);

		function move_at(mouse_x,mouse_y,ctrlKey){
			_step_floater.style.transform = `translate(${mouse_x - drag_data.shift_x}px,${mouse_y - drag_data.shift_y}px)`;

			_step_floater.style.display = "none";
			let elemBelow = document.elementFromPoint(mouse_x, mouse_y);
			_step_floater.style.display = "flex";

			// mousemove events may trigger out of the window (when the ball is dragged off-screen)
			// if clientX/clientY are out of the window, then elementFromPoint returns null
			if (!elemBelow) return;

			if(ctrlKey != _last_ctrl_state){
				if(ctrlKey){
					// We decided to copy, so put the old one back
					_marker = document.querySelector(".removal_marker");
					_marker.after(_step);
					_step.after(_step_divider_removed);
				}else{
					// We decided not to copy, so remove the old one
					_step_divider_removed.remove(); 	// Remove divider that follows this item
					_step.remove();						// Remove this item	
				}
			}
			_last_ctrl_state = ctrlKey;
		  
			// potential droppables are labeled with the class "droppable" (can be other logic)
			let _steps_droppable = elemBelow.closest('.steps');
			let _step_droppable = elemBelow.closest('.step');
		  
			if (_steps_droppable_current != _steps_droppable) {
				// we're flying in or out...
				// note: both values can be null
				//   _steps_droppable_current=null if we were not over a droppable before this event (e.g over an empty space)
				//   _steps_droppable=null if we're not over a droppable now, during this event
		  
				if (_steps_droppable_current) {
					// the logic to process "flying out" of the droppable (remove highlight)
					leaveDroppable(_steps_droppable_current);
				}
				_steps_droppable_current = _steps_droppable;
				if(_steps_droppable_current){
					// process where to place it within this step
					positionDroppable(_steps_droppable_current, _step_droppable, mouse_x);
				}
			}else if(_steps_droppable != null){
				positionDroppable(_steps_droppable_current, _step_droppable, mouse_x);
			}
		}

		function onMouseMove(event){
			move_at(event.pageX, event.pageY, event.ctrlKey);
		}
		document.addEventListener('mousemove',onMouseMove);

		function positionDroppable(_steps_list, _nearest_step, mouse_x) {
			if(_nearest_step == null){
				// No nearest step, so dump it onto the end
				_steps_list.lastChild.after(_step_dropper); // Add this dropper
			}else{
				_step_centre = (_nearest_step.offsetWidth/2)+_nearest_step.getBoundingClientRect().left;
				if(_step_centre > mouse_x){
					// Insert before
					_nearest_step.before(_step_dropper);
				}else if(_step_centre < mouse_x){
					// Insert after
					_nearest_step.nextElementSibling.after(_step_dropper);
				}
			}
			_step_dropper.after(_step_divider); // Add a step divider after it.
			mw.draw_steps();
		}
	
		function leaveDroppable(steps_list) {
			_step_divider.remove(); // Remove the next divider
			_step_dropper.remove(); // Remove the dropper
		}

		_step_floater.onmouseup = function() {
			document.removeEventListener('mousemove', onMouseMove);
			document.body.classList.remove("dragging_in_progress");
			document.querySelector(".removal_marker").classList.remove("removal_marker");
			_step_floater.onmouseup = null;
			_step_floater.remove();
		  };
	}
}