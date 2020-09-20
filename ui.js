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
					duration: 1000
				},
				{
					start_value: 60,
					ease_value: "ease-in",
					end_value: 110,
					duration: 300
				},
				{
					start_value: 60,
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
					start_value: 60,
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
	}


	const steps = document.querySelectorAll('.step');
	for(i=0; i<steps.length; i++){
		_step = steps[i];
		// Set width of block based on duration
		_step.style.width = (scale_factor * _step.querySelector('.duration_value').textContent) + 'px';

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


function build_scale(){
	const scale = document.querySelector('.scale');
	for(i=0; i<200; i++){
		scale.innerHTML += `<span class="minor" style="left:${i*20}px"></span>`;
	}
	for(i=0; i<20; i++){
		scale.innerHTML += `<span class="major" data-value="${i*100}" style="left:${i*100}px"></span>`;
	}
}