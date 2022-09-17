import './style.css'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { ShaderPass } from "./../node_modules/three/examples/jsm/postprocessing/ShaderPass";

import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RGBShiftShader } from "./../node_modules/three/examples/jsm/shaders/RGBShiftShader";

/**
 * Base
 */
// Canvas

const container = document.createElement( 'div' )

document.body.appendChild( container );

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x000000 );
scene.fog = new THREE.Fog( 0x000000, 300, 1000 );

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
const camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 2000 );
camera.position.set( 0, 100, 300 );


//light
const hemiLight = new THREE.HemisphereLight( 0xff00b3, 0x444444 );
hemiLight.position.set( 100, 200, 0 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xff00b3 );
dirLight.position.set( 0, 200, 300 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;

scene.add( dirLight );

// ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 4000, 4000 ), new THREE.MeshPhongMaterial( { color: 0x000538, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

const grid = new THREE.GridHelper( 2000, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid )

// model
let bot
const StandLoader = new FBXLoader();
StandLoader.load( 'Macarena.fbx', function ( fbxBot ) {

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

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.exposure = 0.0
bloomPass.threshold = 0.2;
bloomPass.strength = 1.5; //intensity of glow
bloomPass.radius = 0.8;


const effect2 = new ShaderPass( RGBShiftShader );
effect2.uniforms[ 'amount' ].value = 0.0025;


const composer = new EffectComposer( renderer );
composer.addPass( bloomPass );
composer.setSize(window.innerWidth, window.innerHeight); 
composer.renderToScreen = true; 
composer.addPass(renderScene); 
composer.addPass(bloomPass)
composer.addPass( effect2 );
/**
 * Animate
 */
const clock = new THREE.Clock()

function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    composer.render( scene, camera );

}

animate()