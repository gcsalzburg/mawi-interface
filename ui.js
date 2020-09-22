var sequence = {
	name: "Test 1",
	joints: [
		{
			joint: "beak",
			steps: [
				{
					start_value: 120,
					ease_value: "linear",
					end_value: 60,
					duration: 500
				},
				{
					ease_value: "ease-in",
					end_value: 110,
					duration: 300
				},
				{
					ease_value: "bounce-in",
					end_value: 110,
					duration: 300
				}
			]
		},
		{
			joint: "head",
			steps: [
				{
					start_value: 4,
					ease_value: "ease-in",
					end_value: 80,
					duration: 700
				}
			]
		},
		{
			joint: "elbow",
			steps: [
				{
					start_value: 120,
					ease_value: "bounce-out",
					end_value: 60,
					duration: 250
				},
				{
					ease_value: "bounce-out",
					end_value: 110,
					duration: 300
				}
			]
		}
	]
};

// When page loads
document.addEventListener('DOMContentLoaded', () => {

	
	const joints = document.querySelectorAll('.joint');
	for(i=0; i<joints.length; i++){
		joints[i].querySelector('.steps').innerHTML = Mustache.render(template_step_divider);
	}

	for(i=0; i<sequence.joints.length; i++){
		let joint = sequence.joints[i].joint;
		let steps = sequence.joints[i].steps;

		for(j=0; j<steps.length; j++){
			document.querySelector(`#${joint} .steps`).innerHTML += Mustache.render(template_step, steps[j]) + Mustache.render(template_step_divider);
		}
	}

	build_scale();
	format_joints();
});

let scale_factor = 1;

function format_joints(){

	const joints = document.querySelectorAll('.joint');
	for(i=0; i<joints.length; i++){
		// Reduce visual weight of joints with no steps in them
		joints[i].classList.remove('joint_empty');
		if(joints[i].querySelectorAll('.step').length < 1){
			joints[i].classList.add('joint_empty');
		}

		const steps = joints[i].querySelectorAll('.step');
		let last_start = -1;
		for(j=0; j<steps.length; j++){
			_step = steps[j];

			// Set width of block based on duration
			_new_width = (scale_factor * _step.querySelector('.duration_value').textContent);
			_step.style.width = _new_width + 'px';
			_step.classList.remove('small');
			if(_new_width < 200){
				_step.classList.add("small");
			}

			// Update start value based on previous start value
			if(last_start >= 0){
				_step.querySelector(".start_value").textContent = last_start;
			}
			last_start = _step.querySelector(".end_value").textContent;

			// Set colour style based on ease tyle
			_ease = _step.querySelector('.ease_value').textContent;
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


function build_scale(){
	const scale = document.querySelector('.scale');
	for(i=0; i<200; i++){
		scale.innerHTML += `<span class="minor" style="left:${(i*20)+1}px"></span>`;
	}
	for(i=0; i<20; i++){
		scale.innerHTML += `<span class="major" data-value="${(i*100)}" style="left:${(i*100)+1}px"></span>`;
	}
}

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
	format_joints();
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
		const drag_data = {
			has_before: false,
			has_after: false
		};
		drag_data.start_x = event.pageX;
		if(_e.previousElementSibling != null){
			drag_data.has_before = true;
			drag_data.before_step = _e.previousElementSibling;
			drag_data.before_w = _e.previousElementSibling.clientWidth;
		}
		if(_e.nextElementSibling != null){
			drag_data.has_after = true;
			drag_data.after_step = _e.nextElementSibling;
			drag_data.after_w = _e.nextElementSibling.clientWidth;
		}
		function onStepDividerDrag(event){
			setDividerWidths(drag_data,event.pageX);
		}
		document.addEventListener('mousemove', onStepDividerDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_e.classList.remove("is_dragging");
			document.removeEventListener('mousemove', onStepDividerDrag);
			document.onmouseup = null;
			format_joints();
		};
	}else if(_e.classList.contains("drag_right")){
		// Drag a handle inside an individual step

		_e.classList.add("is_dragging");
		_e.parentNode.parentNode.classList.add("hide_add_buttons");

		// Save current sizes and positions
		const drag_data = {
			has_before: false,
			has_after: false
		};
		drag_data.start_x = event.pageX;
		if(_e.classList.contains("drag_right")){
			drag_data.has_before = true;
			drag_data.before_step = _e.parentNode;
			drag_data.before_w = _e.parentNode.clientWidth;
		}
		function onStepDividerDrag(event){
			setDividerWidths(drag_data,event.pageX);
		}
		document.addEventListener('mousemove', onStepDividerDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_e.classList.remove("is_dragging");
			_e.parentNode.parentNode.classList.remove("hide_add_buttons");
			document.removeEventListener('mousemove', onStepDividerDrag);
			document.onmouseup = null;
			format_joints();
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
			if(_new_x > 0){
				_new_x = 0;
			}
			_f.style.transform = `translateX(${_new_x}px`;
			_f.dataset.new_offset = _new_x;
			update_step_offsets(_new_x);
		}
		document.addEventListener('mousemove', onScaleDrag);

		// Remove un-needed handlers on release
		document.onmouseup = function() {
			_f.classList.remove("is_dragging");
			_f.dataset.offset = _f.dataset.new_offset;
			document.removeEventListener('mousemove', onScaleDrag);
			document.onmouseup = null;
			format_joints();
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

		_step.nextElementSibling.remove(); 	// Remove divider that follows this item
		_step.remove();						// Remove this item	

		let currentDroppable = null;
		move_at(event.pageX,event.pageY);

		function move_at(page_x,page_y){
			_step_floater.style.transform = `translate(${page_x - drag_data.shift_x}px,${page_y - drag_data.shift_y}px)`;

			_step_floater.style.display = "none";
			let elemBelow = document.elementFromPoint(page_x, page_y);
			_step_floater.style.display = "flex";

			// mousemove events may trigger out of the window (when the ball is dragged off-screen)
			// if clientX/clientY are out of the window, then elementFromPoint returns null
			if (!elemBelow) return;
		  
			// potential droppables are labeled with the class "droppable" (can be other logic)
			let droppableBelow = elemBelow.closest('.steps');
		  
			if (currentDroppable != droppableBelow) {
			  // we're flying in or out...
			  // note: both values can be null
			  //   currentDroppable=null if we were not over a droppable before this event (e.g over an empty space)
			  //   droppableBelow=null if we're not over a droppable now, during this event
		  
			  if (currentDroppable) {
				// the logic to process "flying out" of the droppable (remove highlight)
				leaveDroppable(currentDroppable);
				console.log(currentDroppable);
			  }
			  currentDroppable = droppableBelow;
			  if (currentDroppable) {
				// the logic to process "flying in" of the droppable
				enterDroppable(currentDroppable);
				console.log(currentDroppable);
			  }
			}
		}

		function onMouseMove(event){
			move_at(event.pageX, event.pageY);
		}
		document.addEventListener('mousemove',onMouseMove);

		function enterDroppable(steps_list) {
			console.log(steps_list);
			steps_list.firstChild.after(_step_dropper); // Add this dropper
			_step_dropper.after(_step_divider); // Add a step divider after it.

			format_joints();
		}
	
		function leaveDroppable(steps_list) {
			_step_divider.remove(); // Remove the next divider
			_step_dropper.remove(); // Remove the dropper
		}

		_step_floater.onmouseup = function() {
			document.removeEventListener('mousemove', onMouseMove);
			_step_floater.onmouseup = null;
			_step_floater.remove();
		  };
	}
}

function update_step_offsets(_x){
	_steps = document.querySelectorAll(".step, .step_divider");
	for(let i=0; i<_steps.length; i++){
		_steps[i].style.transform = `translateX(${_x}px`;
	}
}

function setDividerWidths(data,new_x){
	if(data.before_step != null){
		const new_before_width = Math.max(data.before_w+(new_x-data.start_x),50);
		data.before_step.style.width = new_before_width+'px';
		data.before_step.querySelector(".duration_value").textContent = new_before_width;
	}
	if(data.after_step != null){
		const new_after_width = Math.max(data.after_w-(new_x-data.start_x),50);
		data.after_step.style.width = new_after_width+'px';
		data.after_step.querySelector(".duration_value").textContent = new_after_width;
	}
	format_joints(); // on the fly, so that we apply things like "small" class to shrinking boxes
}