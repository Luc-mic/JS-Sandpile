class App{
	// Create the three.js canvas, which contains the grids

	constructor(){
		this.WIDTH = 600;
		this.HEIGHT = 500;


		this.scene = new THREE.Scene();
		this.ratio = this.WIDTH / this.HEIGHT;

		var left = -this.WIDTH / 4.5;
		var right = this.WIDTH / 4.5;
		var top_cam = this.HEIGHT / 4.5;
		var bottom = -this.HEIGHT / 4.5;

		this.camera = new THREE.OrthographicCamera( left, right, top_cam, bottom, 0, 10 );
		this.camera.position.z = 5;

		this.renderer = new THREE.WebGLRenderer( );

		this.renderer.setSize(this.WIDTH, this.HEIGHT);
		var container = document.getElementById("canvasHolder");
		document.body.appendChild( container );
		container.appendChild(this.renderer.domElement);
	
		this.controls = new THREE.OrthographicTrackballControls( this.camera, this.renderer.domElement ); //OK
		
		this.controls.enablePan = true;
		this.controls.enableZoom = true;
		this.controls.enableRotate = false;
	}
}



var cmap = [new THREE.Color(0xffffff),
              new THREE.Color(0xdddddd),
              new THREE.Color(0xbbbbbb),
              new THREE.Color(0x999999),
              new THREE.Color(0x777777),
              new THREE.Color(0x555555),
              new THREE.Color(0xeeee00)];

var play = false;
var currentGrid;
var app = new App();
var SPEED = 1;
var delay = 20;
Math.seedrandom(1);

function playPause(){
	var element = document.getElementById("playButton");
	element.classList.toggle("paused");
	play = !play;
}

function step(){
	if(currentGrid){
		currentGrid.iterate();
		currentGrid.colorTiles();
	}
}

function complexOperationAdd(){
	// Function applied by the secondary operations
	
	if(currentGrid){
		var operationType = document.getElementById("complexOperationValue").value;
		var operationTimes = document.getElementById("complexOperationRepeat").valueAsNumber;
		switch(operationType) {
			case "OneE":
				currentGrid.addEverywhere(operationTimes);
			break;
			
			case "MaxS":
				currentGrid.addEverywhere((currentGrid.limit - 1)*operationTimes);
			break;
			
			case "Rand":
				currentGrid.addRandom(operationTimes);
			break;
			
			case "Dual":
				currentGrid.addConfiguration(currentGrid.getDual());
			break;
			
			case "Iden":
				var identity1 = currentGrid.copy();
				var identity2 = currentGrid.copy();
				identity1.clear();
				identity2.clear();
				identity1.addEverywhere((identity1.limit - 1) * 2);
				identity2.addEverywhere((identity2.limit - 1) * 2);
				identity1.stabilize();
				identity2.removeConfiguration(identity1);
				
				identity2.stabilize();
				currentGrid.addConfiguration(identity2);
			break;
		}
	}
}

function complexOperationSet(){
	if(currentGrid){
		var operationType = document.getElementById("complexOperationValue").value;
		var operationTimes = document.getElementById("complexOperationRepeat").valueAsNumber;
		switch(operationType) {
			case "OneE":
				currentGrid.clear();
				currentGrid.addEverywhere(operationTimes);
			break;
			
			case "MaxS":
				currentGrid.clear();
				currentGrid.addEverywhere((currentGrid.limit - 1)*operationTimes);
			break;
			
			case "Rand":
				currentGrid.clear();
				currentGrid.addRandom(operationTimes);
			break;
			
			case "Dual":
				var newGrid = currentGrid.getDual();
				currentGrid.clear();
				currentGrid.addConfiguration(newGrid);
			break;
			
			case "Iden":
				var identity1 = currentGrid.copy();
				var identity2 = currentGrid.copy();
				identity1.clear();
				identity2.clear();
				identity1.addEverywhere((identity1.limit - 1) * 2);
				identity2.addEverywhere((identity2.limit - 1) * 2);
				identity1.stabilize();
				identity2.removeConfiguration(identity1);
				
				identity2.stabilize();
				currentGrid.clear();
				currentGrid.addConfiguration(identity2);
			break;
		}
	}
}

function complexOperationSub(){
	if(currentGrid){
		var operationType = document.getElementById("complexOperationValue").value;
		var operationTimes = document.getElementById("complexOperationRepeat").valueAsNumber;
		switch(operationType) {
			case "OneE":
				currentGrid.removeEverywhere(operationTimes);
			break;
			
			case "MaxS":
				currentGrid.removeEverywhere((currentGrid.limit - 1)*operationTimes);
			break;
			
			case "Rand":
				currentGrid.removeRandom(operationTimes);
			break;
			
			case "Dual":
				currentGrid.removeConfiguration(currentGrid.getDual());
			break;
			
			case "Iden":
				var identity1 = currentGrid.copy();
				var identity2 = currentGrid.copy();
				identity1.clear();
				identity2.clear();
				identity1.addEverywhere((identity1.limit - 1) * 2);
				identity2.addEverywhere((identity2.limit - 1) * 2);
				identity1.stabilize();
				identity2.removeConfiguration(identity1);
				
				identity2.stabilize();
				currentGrid.removeConfiguration(identity2);
			break;
		}
	}
}
function stabGrid(){
	if(currentGrid) {
		currentGrid.stabilize();
	}
}

function changeIPS(val){
	SPEED = val.value;
}

function changeDelay(val){
	delay = val.value;
}

function changeSeed(val){
	Math.seedrandom(val.value);
}

function hideComplex(val){
	if(val.value == "Rand") document.getElementById("seedMask").style.visibility = "visible";
	else document.getElementById("seedMask").style.visibility = "hidden";
	
	if(val.value == "Dual" || val.value == "MaxS" || val.value == "Iden") document.getElementById("complexTimesMask").style.visibility = "hidden";
	else document.getElementById("complexTimesMask").style.visibility = "visible";
}

function drawGrid(preset){
	// Draw a square grid - could be splitted in init() and drawSquare()
	
	while(app.scene.children.length > 0){ 
		app.scene.remove(app.scene.children[0]); 
	}
	cW = document.getElementById("cW").value;
	cH = document.getElementById("cH").value;
	
	switch(preset){
		case "hex":
			currentGrid = Tiling.hexTiling(cW, cH, cmap);
			app.camera.zoom = 0.7;
		break;
		
		default:
			currentGrid = Tiling.sqTiling(cW, cH, cmap);
			app.camera.zoom = 1;
		break;
		
	}
	
	app.controls.zoomCamera();
	app.controls.object.updateProjectionMatrix();
	
	app.scene.add(currentGrid.mesh);
	currentGrid.colorTiles();
	//console.log(currentGrid);
	
	var render = function () {
		requestAnimationFrame( render );
		app.controls.update();
		if(currentGrid){
			if(play){
				for(var i = 0; i<SPEED; i++){
					currentGrid.iterate();
				}
				currentGrid.colorTiles();
			}
		}
		app.renderer.render( app.scene, app.camera );
	};
	render();
}

/***********************************/
/* PARTIE IMPLEMENTATION DU CLIQUE */
/***********************************/

var mouse = new THREE.Vector2(); // un Vector2 contient un attribut x et un attribut y
var raycaster = new THREE.Raycaster(); // rayon qui va intersecter la pile de sable

app.renderer.domElement.addEventListener('click', function( event ) {

	//on calcule un ration entre -1 et 1 pour chaque coordonées x et y du clique
	//si mouse.x == -1 alors on a cliqué tout à gauche
	//si mouse.x ==  1 alors on a cliqué tout à droite
	//si mouse.y == -1 alors on a cliqué tout en bas
	//si mouse.y ==  1 alors on a cliqué tout en haut
	var rect = app.renderer.domElement.getBoundingClientRect(); // correction de la position de la souris par rapport au canvas

    mouse.x = ((event.clientX - rect.left) / app.WIDTH ) * 2 - 1;
	mouse.y = - ((event.clientY - rect.top) / app.HEIGHT ) * 2 + 1;

	// on paramète le rayon selon les ratios et la camera
	raycaster.setFromCamera(mouse, app.camera);
	// l'objet intersects est u tableau qui contient toutes les faces intersectés par le rayon
	
	if(app.scene.children.length > 0){
		
		var intersects = raycaster.intersectObject(app.scene.children[0]);

		if(intersects.length > 0){

			var face = intersects[0];
			var triangleIndex = face.faceIndex; 

			currentGrid.add(currentGrid.indexDict[face.faceIndex*3], 1);

		}
	}

  }, false);


/*******/
/* FIN */
/*******/

// Using JQuerry to prevent breaking the inputs
$(document).on('keyup', 'input', function () {
    var _this = $(this);
    var min = parseInt(_this.attr('min')) || 1; // if min attribute is not defined, 1 is default
    var max = parseInt(_this.attr('max')) || 100; // if max attribute is not defined, 100 is default
    var val = parseInt(_this.val()) || (min - 1); // if input char is not a number the value will be (min - 1) so first condition will be true
    if(val < min)
        _this.val( min );
    if(val > max)
        _this.val( max );
});

//https://threejs.org/examples/#webgl_interactive_buffergeometry