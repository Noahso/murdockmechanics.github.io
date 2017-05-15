// modules/gui
// handles user input between spacetime and renderer

define([
	'jquery',
	'underscore'
], function ($, _) {

	/**************
		Private
	**************/

	var spacetime = undefined;
	var render = undefined;
	var canvas = undefined;
	var massMultiplier = undefined; // How exagurated the size of the objects are (humans like that)

	// Function that controls the left mouse which controls the massbuilder
	/*
		States:
			placement
			mass
			velocity
	*/

	var mouse = {
		visible: true,
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
		radius: 0,
		state: 'placement',
		orbit: 'custom'
	};

	var massBuilder = function (e) {
		switch (mouse.state) {
			case 'placement':
				// This state ^
				mouse.state = 'mass';
				mouse.x2 = e.clientX;
				mouse.y2 = e.clientY;
				mouse.radius = 0;
				break;
			case 'mass':
				// This state ^
				mouse.radius = Math.sqrt(Math.pow(mouse.x - mouse.x2, 2) + Math.pow(mouse.y - mouse.y2, 2));
				if (e.type === 'mousedown') {
					if (mouse.orbit == 'custom') {

						mouse.state = 'velocity';
					}
					else { //auto-orbiting
						var mass = (4 / 3 * Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier;
						autoOrbit(e, mass);

						//Reset state machine
						mouse.state = 'placement';
						mouse.radius = 0;
					}
				}
				break;
			case 'velocity':
				// This state ^

				if (e.type === 'mousedown') {
					mouse.radius /= render.getCamera().zoom;

					spacetime.addObject({
						x: render.getCamera().getMouseX(mouse.x2),
						y: render.getCamera().getMouseY(mouse.y2),
						velX: -(mouse.x - mouse.x2) / 100,
						velY: -(mouse.y - mouse.y2) / 100,
						mass: (4 / 3 * Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier,
						density: 1,
						path: []
					});

					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				};
				break;
		}
	}

	var autoOrbit = function (e, mass) {
	    var focusedObject = spacetime.getFocusedObject();
	    if (focusedObject === false)
	        return;
		var x, y;
		if (menuCustomMass) {
			x = render.getCamera().getMouseX(mouse.x2);
			y = render.getCamera().getMouseY(mouse.y2);
		}
		else {
			x = render.getCamera().getMouseX(mouse.x);
			y = render.getCamera().getMouseY(mouse.y);
		}
		var deg = Math.atan2(y - focusedObject.y, x - focusedObject.x);

		var meanOrbitalVelocity = Math.sqrt(focusedObject.mass / Math.sqrt(Math.pow(focusedObject.x - x, 2) + Math.pow(focusedObject.y - y, 2)))

		var velX = (function () {
			var velX = focusedObject.velX;

			velX += Math.cos(deg + Math.PI / 2) * meanOrbitalVelocity;

			return velX;
		})();

		var velY = (function () {
			var velY = focusedObject.velY;

			velY += Math.sin(deg + Math.PI / 2) * meanOrbitalVelocity;

			return velY;
		})();

		spacetime.addObject({
			x: x,
			y: y,
			velX: velX,
			velY: velY,
			mass: mass,
			density: 1,
			path: []
		});
	}

	var mouseMove = function (e) {
		// console.log('x:' + e.clientX + ' y:' + e.clientY);
		mouse.x = e.clientX;
		mouse.y = e.clientY;

		if (mouse.state === 'mass' || mouse.state === 'velocity') {
			massBuilder(e);
		};

		render.setMouse(mouse);
	}

	/*************
		Public
	*************/

	var guiApi = {};
	var menuCustomMass
	guiApi.initialize = function (p_spacetime, p_render, p_canvas, p_massMultiplier) {
		spacetime = p_spacetime;
		render = p_render;
		canvas = p_canvas;
		massMultiplier = p_massMultiplier;

		document.getElementById('menu-toggle-grid').checked = 1;
		document.getElementById('menu-toggle-grid').addEventListener('change', function () {
			render.toggleGrid();
		});
		menuCustomMass = document.getElementById('menu-toggle-custom-mass').checked;
		document.getElementById('menu-toggle-custom-mass').addEventListener('change', function () {
			menuCustomMass = document.getElementById('menu-toggle-custom-mass').checked;
		});
		var massMultiplierInput = document.getElementById('menu-mass-multiplier');
		massMultiplierInput.value = 200;
		massMultiplierInput.addEventListener('change', function () {
			massMultiplier = massMultiplierInput.value;
			render.updateMassMultiplier(massMultiplierInput.value);
			spacetime.updateMassMultiplier(massMultiplierInput.value);
		});

		var zoomInput = document.getElementById('menu-zoom');
		zoomInput.value = 1;
		zoomInput.addEventListener('change', function () {
			render.changeZoom(zoomInput.value);
		});

		var speedInput = document.getElementById('menu-speed');
		speedInput.value = 1;
		speedInput.addEventListener('change', function () {
			spacetime.calculationSpeed(speedInput.value);
		});

		var clearspacebtn = document.getElementById('menu-clear-spacetime');
		clearspacebtn.addEventListener('click', function () {
			spacetime.clearSpacetime();
		});

		var cyclefocusbtn = document.getElementById('menu-cycle-focus');
		document.getElementById('menu-cycle-focus').onmousedown = function (e) {
			spacetime.cycleFocus((e.which == 1) ? true : false);
		};

		canvas.onmousedown = function (e) {
			if (e.which === 1) {
				// console.log('left mouse click');
				// console.log(spacetime.getSpace().length);
				if ((mouse.state != 'placement' && mouse.orbit == 'auto')) { //if user was trying to put an auto-orbiting mass, and clicked left button, then he is probably trying to cancel. Cancel then.
					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				}
				else {
					mouse.orbit = 'custom';
					massBuilder(e);
				}
			}
			else if (e.which === 3) {
				// console.log('right mouse click');
				if ((mouse.state != 'placement' && mouse.orbit == 'custom')) { //if user was trying to put a custom mass, and clicked right button, then he is probably trying to cancel. Cancel then.
					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				}
				else {
					mouse.orbit = 'auto';
					if (menuCustomMass)
						massBuilder(e)
					else
						autoOrbit(e, 0.5);
				}
			};
		};

		canvas.onmousemove = function (e) {
			mouseMove(e);
		}
	}

	return guiApi;

});
