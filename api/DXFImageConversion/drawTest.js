// var THREE = require('three');
// require('three-canvas-renderer');
// require('three-projector-renderer');

// const { createCanvas, loadImage } = require("canvas");

var THREE = require('three');
require('three-canvas-renderer');
var fs = require("fs");
const { createCanvas, loadImage } = require('canvas');

var w = 200;
var h = 200;
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
camera.position.y = 150;
camera.position.z = 400;

var geometry = new THREE.BoxGeometry(200, 200, 200);
for ( var i = 0; i < geometry.faces.length; i += 2 ) {
    var hex = Math.random() * 0xffffff;
    geometry.faces[ i ].color.setHex( hex );
    geometry.faces[ i + 1 ].color.setHex( hex );
}

var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

cube = new THREE.Mesh(geometry, material);
cube.position.y = 150;
cube.rotation.y = 45;
scene.add(cube);

var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
geometry.rotateX( - Math.PI / 2 );

var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

plane = new THREE.Mesh( geometry, material );
scene.add( plane );

var canvas = createCanvas(w, h);
canvas.style = {};
var renderer = new THREE.CanvasRenderer({
    canvas: canvas
});

renderer.setClearColor(0xffffff, 1);
renderer.setSize(200, 200);

renderer.render(scene, camera);

var out = fs.createWriteStream("./test-out.png");
var canvasStream = canvas.pngStream();
canvasStream.on("data", function (chunk) { out.write(chunk); });
canvasStream.on("end", function () { console.log("done"); });



//document.body.appendChild(renderer.domElement);