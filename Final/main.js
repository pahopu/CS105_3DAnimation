// Import Three.js library
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

// INIT GLOBAL VARIABLES
let scene, camera, renderer, clock, controls, transformControls;
let panel_gui = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function createGUI() {
	if (panel_gui) {
		panel_gui.__folders = {};
		panel_gui.__controllers = [];
	}
	createPanel();
}

function createPanel() {
	panel_gui = new GUI({ width: 330 });
}

function init() {
	// Clock
	clock = new THREE.Clock();

	// GUI
	createGUI();

	// Scene
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
	scene.background = new THREE.Color(0x000000);

	// Camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(-8, 1.15, 7.5);
	camera.lookAt(0, 0, 0);

	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	document.body.appendChild(renderer.domElement);

	// Responsive

	// Lights
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 17, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff);
	dirLight.position.set(6, 17, 20);
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 10;
	dirLight.shadow.camera.bottom = -10;
	dirLight.shadow.camera.left = -10;
	dirLight.shadow.camera.right = 10;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	dirLight.shadow.bias = 0.001;
	dirLight.shadow.mapSize.width = 4096;
	dirLight.shadow.mapSize.height = 4096;
	scene.add(dirLight);

	// Ground
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0x000000, depthWrite: false })
	);
	plane.rotation.x = -Math.PI / 2;
	plane.receiveShadow = true;

	const gridSize = 100;
	const gridDivisions = 100;
	const gridHelper = new THREE.GridHelper(
		gridSize,
		gridDivisions,
		0x808080,
		0x808080
	);

	gridHelper.rotation.x = plane.rotation.x;
	plane.add(gridHelper);

	scene.add(plane);

	// Init object
	const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

	boxMesh.position.y = 1;
	scene.add(boxMesh);

	transformControls = new TransformControls(camera, renderer.domElement);

	transformControls.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	scene.add(transformControls);
}

function onMouseClickMesh(event) {
	event.preventDefault();

	// Calculate mouse position in normalized device coordinates
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// Perform raycasting from the camera
	raycaster.setFromCamera(mouse, camera);

	// Get intersects
	const intersects = raycaster.intersectObjects(scene.children, true);

	if (intersects.length > 0) {
		// Set selected object as the first intersected object
		// selectedObject = intersects[0].object;
		transformControls.attach(intersects[0].object);
		transformControls.setMode("translate");
	} else {
		// selectedObject = null;
		transformControls.detach();
	}
}

window.addEventListener(
	"resize",
	function () {
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	},
	false
);

window.addEventListener("mousemove", onMouseClickMesh, false);

function animate() {
	requestAnimationFrame(animate);

	controls.update();

	renderer.render(scene, camera);
}

init();
animate();
