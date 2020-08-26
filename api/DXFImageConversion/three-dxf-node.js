var THREE = require('three');
require('three-canvas-renderer');
const { createCanvas, loadImage } = require('canvas');

const Shapes = require('./shapes.js');

function drawDXF(data, width, height) {
	var scene = new THREE.Scene();
	var dims = {
        min: { x: false, y: false, z: false},
        max: { x: false, y: false, z: false}
    };
	for(i = 0; i < data.entities.length; i++) {
        entity = data.entities[i];
        obj = Shapes.drawEntity(entity, data);
        if (obj) {
        	var bbox = new THREE.Box3().setFromObject(obj);
            if (bbox.min.x && ((dims.min.x === false) || (dims.min.x > bbox.min.x))) dims.min.x = bbox.min.x;
            if (bbox.min.y && ((dims.min.y === false) || (dims.min.y > bbox.min.y))) dims.min.y = bbox.min.y;
            if (bbox.min.z && ((dims.min.z === false) || (dims.min.z > bbox.min.z))) dims.min.z = bbox.min.z;
            if (bbox.max.x && ((dims.max.x === false) || (dims.max.x < bbox.max.x))) dims.max.x = bbox.max.x;
            if (bbox.max.y && ((dims.max.y === false) || (dims.max.y < bbox.max.y))) dims.max.y = bbox.max.y;
            if (bbox.max.z && ((dims.max.z === false) || (dims.max.z < bbox.max.z))) dims.max.z = bbox.max.z;
        	scene.add(obj);
        }
        obj = null;
    }

    var aspectRatio = width / height;

    var upperRightCorner = { x: dims.max.x, y: dims.max.y };
    var lowerLeftCorner = { x: dims.min.x, y: dims.min.y };

    var vp_width = upperRightCorner.x - lowerLeftCorner.x;
    var vp_height = upperRightCorner.y - lowerLeftCorner.y;

    var center = center || {
        x: vp_width / 2 + lowerLeftCorner.x,
        y: vp_height / 2 + lowerLeftCorner.y
    };

    var extentsAspectRatio = Math.abs(vp_width / vp_height);
    if (aspectRatio > extentsAspectRatio) {
        vp_width = vp_height * aspectRatio;
    } else {
        vp_height = vp_width / aspectRatio;
    }

    const zoom = 0.5;
    var viewPort = {
        bottom: -vp_height / 2 - zoom,
        left: -vp_width / 2 - zoom,
        top: vp_height / 2 + zoom,
        right: vp_width / 2 + zoom,
        center: {
            x: center.x,
            y: center.y
        }
    };

    var camera = new THREE.OrthographicCamera(viewPort.left, viewPort.right, viewPort.top, viewPort.bottom, 1, 19);
    camera.position.z = 10;
    camera.position.x = viewPort.center.x;
    camera.position.y = viewPort.center.y;

	var canvas = createCanvas(width, height);
	canvas.style = {};
	var renderer = new THREE.CanvasRenderer({
	    canvas: canvas
	});

	renderer.setClearColor(0xffffff, 1);
	renderer.setSize(width, height);

	renderer.render(scene, camera);

	//Convert and return Base64 Encoded Image
	return canvas.toDataURL('image/jpeg');
}

module.exports = { drawDXF };
