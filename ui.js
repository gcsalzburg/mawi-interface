// Create array of sequences for reference
const sequences = [];

// Create new reference to Mawi class
let mw;

// When page loads
document.addEventListener('DOMContentLoaded', () => {

	// Create new MAWI reference
	mw = new Mawi();

	// Load in the test sequence
	sequences.push(mw.create_sequence(test_sequence_data));

	// Load the first sequence in the list into the display
	mw.load_sequence(sequences[0]);	
});


// Scrollwheel handling
document.onwheel = function(event){

	const _e = event.target;

	// Scrolling on the scale will zoom in and out
	if(_e.classList.contains("scale_dragger")){
		event.preventDefault();
		mw.update_zoom(Math.sign(event.deltaY));
	}

	// Scrolling on a number will increment/decrement it
	if(_e.classList.contains("start_value") || _e.classList.contains("end_value")){
		event.preventDefault();

		// Calculate new value
		let new_value = clamp(parseInt(_e.textContent) - Math.sign(event.deltaY),0,180);

		// Update step
		step = _e.parentNode.parentNode;
		if(_e.classList.contains("start_value")){
				mw.update_step_start(step, new_value, false);
		}else{
				mw.update_step_end(step, new_value, false);
		}

	}
};
// Leave handling for scrollables, to save a new state
// Use mouseout not mouseleave as mouseleave does not bubble!
document.onmouseout = function(event){
	const _e = event.target;

	// Save the state!
	if(_e.classList.contains("start_value") || _e.classList.contains("end_value")){
		mw.save_sequence();
	}
}


// Click button handling
document.onclick = function(event) {

	event.preventDefault();
	const _e = event.target;

	if(_e.classList.contains("sq_add")){

		// Add a new sequence
		const new_sq = mw.create_sequence();
		sequences.push(new_sq);
		mw.load_sequence(new_sq);

	}else if(_e.classList.contains("sq_select")){

		// Select the sequence and load it!
		for(let sq of sequences){
			if(sq.id == _e.id){
				mw.load_sequence(sq);
			}
		}

	}else if(_e.classList.contains("add_step")){

		// Add Step buttons = insert new divider + new step
		mw.add_step(_e.parentNode);

	}else if(_e.classList.contains("delete_step")){

		// Remove step button
		mw.delete_step(_e.parentNode);

	}else if(_e.classList.contains("ease_value")){

		// Ease name clicking (temporary fix below)

		// TODO: Create a selector for this
		const step = _e.parentNode.parentNode;
		let new_ease;
		if(step.classList.contains("step_linear")){
			new_ease = "ease-in";
		}else if(step.classList.contains("step_ease")){
			new_ease = "bounce-out";
		}else if(step.classList.contains("step_bounce")){
			new_ease = "linear";
		}
		mw.update_step_ease(step, new_ease);

	}else if(_e.classList.contains("undo")){

		// Undo sequence step
		if(!_e.classList.contains("disabled")){
			mw.undo();
		}

	}else if(_e.classList.contains("undoundo")){

		// Undoundo (a.k.a. redo) sequence step
		if(!_e.classList.contains("disabled")){
			mw.undoundo();
		}

	}

};

// Prevent non-numeric inputs
const keyArray = ['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','ArrowLeft','ArrowRight'];
document.onkeydown = function(event){

	const _e = event.target;

	if(_e.classList.contains("start_value") || _e.classList.contains("end_value")){

		// Prevent non-numeric key entry in start and end values
		if(keyArray.indexOf(event.key) < 0){
			event.preventDefault();
		}
	}
};

// Check for valid entry into value boxes
document.onkeyup = function(event){

	const _e = event.target;

	if(_e.classList.contains("start_value") || _e.classList.contains("end_value")){

		let new_value = clean_start_end_value(_e.textContent);
		if(new_value){
			_e.textContent = new_value;
			moveCaratToEnd(_e);
		}
		
		// Handle change
		step = _e.parentNode.parentNode;
		if(_e.classList.contains("start_value")){
			if(_e.textContent != step.dataset.start){
				// Its a new start value
				mw.update_step_start(step, _e.textContent);
			}
		}else{
			if(_e.textContent != step.dataset.end){
				// Its a new end value
				mw.update_step_end(step, _e.textContent);
			}
		}
	}
};

// Handle the start/end value constraining to 0..180, etc...
function clean_start_end_value(value){

	// In case we pass in a number
	value = value.toString();

	let changed = false;
	let new_value;

	if(value == ''){

		// Check if empty string
		new_value = 0;
		changed = true;

	}else if(value.charAt(0) == '0'){

		// Remove leading zeroes
		new_value = parseInt(value,10);
		changed = true;

	}else{

		// Check if we exceed the limits for the start or end value
		new_value = parseInt(value,10);
		if(new_value > 180){
			new_value = 180;
			changed = true;	 
		}else if(new_value < 0){
			new_value = 0;
			changed = true;
		}
	}

	if(changed){
		return new_value;
	}else{
		return false;
	}
}

// Cancel all dragStart events on page
document.ondragstart = function(event){
	event.preventDefault();
	return false;	
};

// Mousedown triggers, primarily for dragging
document.onmousedown = function(event){

	const _e = event.target;

	if(_e.classList.contains("step_divider") || _e.classList.contains("drag_right")){
		// Drag a step divider or end of an individual step

		// Save current sizes and positions
		const drag_data = {
			start_x: event.pageX,
		};

		if(_e.classList.contains("step_divider")){
			// Its the step divider

			// If this is the first or last step divider, we can't drag it
			if((_e.previousElementSibling == null)||(_e.nextElementSibling == null)){
				return false;
			}

			//If we have blocks to adjust, then save the data
			if(_e.previousElementSibling != null){
				drag_data.before_step = _e.previousElementSibling;
				drag_data.before_duration = parseInt(drag_data.before_step.dataset.duration);
			}
			if(_e.nextElementSibling != null){
				drag_data.after_step = _e.nextElementSibling;
				drag_data.after_duration = parseInt(drag_data.after_step.dataset.duration);
			}

		}else{
			// Its the righthand handle of a step

			// Hide the plus button because it gets in the way sometimes
			_e.parentNode.parentNode.classList.add("hide_add_buttons");

			// Grab the data for this step
			drag_data.before_step = _e.parentNode;
			drag_data.before_duration = parseInt(_e.parentNode.dataset.duration);
		}

		// Add class to denote we are dragging it now
		_e.classList.add("is_dragging");

		// Add temporary event listener for mousemove
		function onStepDividerDrag(event){
			mw.update_step_durations(drag_data, event.pageX, event.shiftKey);
		}
		document.addEventListener('mousemove', onStepDividerDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {

			// Save the new state to the list
			mw.save_sequence();

			_e.classList.remove("is_dragging");
			_e.parentNode.parentNode.classList.remove("hide_add_buttons");
			document.removeEventListener('mousemove', onStepDividerDrag);
			document.onmouseup = null;
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
			mw.draw_all_steps();
		}
	
		function leaveDroppable(steps_list) {
			_step_divider.remove(); // Remove the next divider
			_step_dropper.remove(); // Remove the dropper
		}

		_step_floater.onmouseup = function() {
			
			// Save the new state to the list
			mw.save_sequence();

			document.removeEventListener('mousemove', onMouseMove);
			document.body.classList.remove("dragging_in_progress");
			document.querySelector(".removal_marker").classList.remove("removal_marker");
			_step_floater.onmouseup = null;
			_step_floater.remove();
		};
	}
}

function moveCaratToEnd(node){
	range = document.createRange();//Create a range (a range is a like the selection but invisible)
	range.selectNodeContents(node);//Select the entire contents of the element with the range
	range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
	selection = window.getSelection();//get the selection object (allows you to change selection)
	selection.removeAllRanges();//remove any selections already made
	selection.addRange(range);//make the range you have just created the visible selection
}

function clamp(input, min, max) {
	return Math.min(Math.max(input, min), max);
 };