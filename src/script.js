import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')
const container = document.createElement( 'div' )

document.addEventListener("keydown", onDocumentKeyDowne, false);
document.body.appendChild( container );

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 300, 1000 );

let mixer, renderer

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
camera.position.set( 300, 300, 300 );


//light
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 200, 0 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 0, 200, 100 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
scene.add( dirLight );

// ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

const grid = new THREE.GridHelper( 2000, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid );

//place

let place
const loader = new GLTFLoader()
loader.load('destroy/scene.gltf', (objPlace) => {
	objPlace.scene.scale.set(100,100,100)
    objPlace.scene.rotation.y = 0.45
    objPlace.scene.position.y = -230
    //objPlace.scene.position.y = 550
    scene.add(objPlace.scene)
})

// model
let bot
const StandLoader = new FBXLoader();
StandLoader.load( 'Standing.fbx', function ( fbxBot ) {

    mixer = new THREE.AnimationMixer( fbxBot );
    
    const action = mixer.clipAction( fbxBot.animations[ 0 ] );
    action.play();

    scene.add( fbxBot );
} );


renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
container.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 100, 0 );
controls.update();

function onDocumentKeyDowne(e) {
	if (e.keyCode === 38) {
		
    const walkLoader = new FBXLoader();
    walkLoader.load( 'Walking.fbx', function ( walkBot ) {

    mixer = new THREE.AnimationMixer( walkBot );
    
    const action = mixer.clipAction( walkBot.animations[ 0 ] );
    action.play();

    walkBot.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    } );
    scene.add( walkBot );
} );
	} else if(e.keyCode === 39) {
        grid.rotation.y += 0.01	
	}
}


/**
 * Animate
 */
const clock = new THREE.Clock()

function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    //grid.position.z -= 0.2

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );
}

animate()