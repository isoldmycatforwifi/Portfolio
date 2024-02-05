const simplex = new SimplexNoise();

function App(conf) {

  conf = {
    fov: 75,
    cameraZ: 300,
    background: 0x084B83,
    tubeRadius: 4,
    resY: 92,   // This controls the number- 90is two
    resX: 3, // This controls the roughness
    noiseCoef: 50,
    timeCoef: 100,
    mouseCoef: 200,
    heightCoef: 10,
    ambientColor: 0x000,
    lightIntensity: 1,
    light1Color: 0xF0F6F6,
    light2Color: 0x42BFDD,
    light3Color: 0xFF66B3,
    light4Color: 0xBBE6E4,
    
    ...conf
  };

  let renderer, scene, camera, cameraCtrl;
  let width, height, cx, cy, wWidth, wHeight;
  const TMath = THREE.Math;

  let light1, light2, light3, light4;
  let objects, noiseConf = {};
  let cscale; updateCScale(chroma('#d11f6c'));

  const mouse = new THREE.Vector2();
  const targetMouse = new THREE.Vector2(); // New variable for smooth transition
  const smoothness = 0.1; // Adjust the smoothness value as needed

  init();

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(conf.fov);
    camera.position.z = conf.cameraZ;
    // cameraCtrl = new THREE.OrbitControls(camera);

    updateSize();
    window.addEventListener('resize', updateSize, false);

    // Modify the 'mousemove' event listener to update targetMouse
    document.addEventListener('mousemove', e => {
      targetMouse.x = (e.clientX / width) * 2 - 1;
      targetMouse.y = -(e.clientY / height) * 2 + 1;
    });

    initScene();
    initGui();
    animate();
  }

  function initGui() {
    // noiseInput.value = 101 - conf.xyCoef;
    // heightInput.value = (conf.zCoef * 100) / 25;

    // noiseInput.addEventListener('input', e => {
    //   conf.noiseCoef = 101 - noiseInput.value;
    // });
    // heightInput.addEventListener('input', e => {
    //   conf.zCoef = (heightInput.value * 25) / 100;
    // });
    // ///////////////////////////////////
    // document.body.addEventListener('click', e => {
    //   updateColors();
    // });
  }

  function initScene() {
    scene = new THREE.Scene();
    if (conf.background) scene.background = new THREE.Color(conf.background);
    initLights();
    initObjects();

    camera.position.z = 130;
  }

  function initLights() {
    scene.add(new THREE.AmbientLight(conf.ambientColor));

    const z = 50;
    const lightDistance = 500;
    light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
    light1.position.set(0, wHeight / 2, z);
    scene.add(light1);
    light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
    light2.position.set(0, -wHeight / 2, z);
    scene.add(light2);
    light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
    light3.position.set(wWidth / 2, 0, z);
    scene.add(light3);
    light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance);
    light4.position.set(-wWidth / 2, 0, z);
    scene.add(light4);
  }

  function initObjects() {
    updateNoise();
    const nx = Math.round(wWidth / conf.resX) + 1;
    const ny = Math.round(wHeight / conf.resY) + 1;
    objects = [];
    let tube, color;
    for (let j = 0; j < ny; j++) {
      // color = cscale(j/ny).hex();
      color = cscale(TMath.randFloat(0, 1)).hex();
      // color = chroma.random().hex();
      tube = new Tube(-wWidth / 2, -wHeight / 2 + j * conf.resY, wWidth, nx, conf.tubeRadius, color, noiseConf);
      objects.push(tube);
      scene.add(tube.mesh);
    }
  }

  function updateNoise() {
    noiseConf.coef = conf.noiseCoef * 0.00012;
    noiseConf.height = conf.heightCoef;
    noiseConf.time = Date.now() * conf.timeCoef * 0.000002;

    // Smoothly transition the 'mouse' vector
    mouse.x += (targetMouse.x - mouse.x) * smoothness;
    mouse.y += (targetMouse.y - mouse.y) * smoothness;

    noiseConf.mouseX = mouse.x / 2;
    noiseConf.mouseY = mouse.y / 2;
    noiseConf.mouse = mouse.x + mouse.y;
  }

  function updateColors() {
    const color = chroma.random();
    updateCScale(color);
    for (let i = 0; i < objects.length; i++) {
      objects[i].material.color = new THREE.Color(cscale(TMath.randFloat(0, 1)).hex());
    }
    light1.color = new THREE.Color(chroma.random().hex());
    light2.color = new THREE.Color(chroma.random().hex());
    light3.color = new THREE.Color(chroma.random().hex());
    light4.color = new THREE.Color(chroma.random().hex());
    console.log(light1.color, light2.color, light3.color, light4.color);
  }

  function updateCScale(color) {
    const colors = [
      color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', TMath.randFloat(0, 0.3)).hex(),
      color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', 0.3 + TMath.randFloat(0, 0.4)).hex(),
      color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', 0.7 + TMath.randFloat(0, 0.3)).hex(),
      0xffffff,
    ];
    console.log(colors);
    cscale = chroma.scale(colors);
  }

  function animate() {
    // if (!animate.counter) animate.counter = 1;
    // if (animate.counter++>10) return;

    requestAnimationFrame(animate);

    animateObjects();
    animateLights();

    // if (cameraCtrl) cameraCtrl.update();
    renderer.render(scene, camera);
  }

  function animateObjects() {
    updateNoise();
    for (let i = 0; i < objects.length; i++) {
      objects[i].update();
    }
  }

  function animateLights() {
    const time = Date.now() * 0.0015;
    const dx = wWidth / 2;
    const dy = wHeight / 2;
    light1.position.x = Math.sin(time * 0.1) * dx;
    light1.position.y = Math.cos(time * 0.2) * dy;
    light2.position.x = Math.cos(time * 0.3) * dx;
    light2.position.y = Math.sin(time * 0.4) * dy;
    light3.position.x = Math.sin(time * 0.5) * dx;
    light3.position.y = Math.sin(time * 0.6) * dy;
    light4.position.x = Math.sin(time * 0.7) * dx;
    light4.position.y = Math.cos(time * 0.8) * dy;
  }

  function updateSize() {
    width = window.innerWidth;
    cx = width / 2;
    height = window.innerHeight;
    cy = height / 2;
    if (renderer && camera) {
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const wsize = getRendererSize();
      wWidth = wsize[0];
      wHeight = wsize[1];
    }
  }

  function getRendererSize() {
    const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
    const vFOV = (cam.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
    const width = height * cam.aspect;
    return [width, height];
  }
}

/**
 * Custom curve
 */
function CustomCurve(x, y, l, noise) {
  THREE.Curve.call(this);
  this.x = x; this.y = y; this.l = l;
  this.noise = noise;
  this.yn = this.y * this.noise.coef;
}
CustomCurve.prototype = Object.create(THREE.Curve.prototype);
CustomCurve.prototype.constructor = CustomCurve;
CustomCurve.prototype.getPoint = function (t) {
  let x = this.x + t * this.l;
  let xn = x * this.noise.coef;
  let noise1 = simplex.noise2D(xn + this.noise.time + this.noise.mouseX/2, this.yn - this.noise.time + this.noise.mouseY/2);
  let noise2 = simplex.noise2D(this.yn + this.noise.time, xn - this.noise.time);
  let z = noise2 * this.noise.height;
  let y = this.y + noise1 * this.noise.height;
  return new THREE.Vector3(x, y, z);
};

/**
 * Tube class
 */
class Tube {
  constructor(x, y, l, segments, radius, color, noise) {
    this.segments = segments;
    this.radialSegments = 8;
    this.radius = radius;

    this.curve = new CustomCurve(x, y, l, noise);
    this.geometry = new THREE.TubeBufferGeometry(this.curve, segments, radius, this.radialSegments, false);
    // this.material = new THREE.MeshBasicMaterial({ color });
    // this.material = new THREE.MeshLambertMaterial({ color });
    this.material = new THREE.MeshStandardMaterial({ color, metalness: 1 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  update() {
    this.frames = this.curve.computeFrenetFrames(this.segments, false);
    this.geometry.tangents = frames.tangents;
    this.geometry.normals = frames.normals;
    this.geometry.binormals = frames.binormals;

    this.pArray = this.geometry.attributes.position.array;
    this.nArray = this.geometry.attributes.normal.array;
    this.P = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    for (let i = 0; i < this.segments; i++) {
      this.updateSegment(i);
    }
    this.updateSegment(this.segments);

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
  }
  updateSegment(i) {
    this.P = this.curve.getPointAt(i / this.segments, this.P);
    const N = this.frames.normals[i];
    const B = this.frames.binormals[i];
    for (let j = 0; j <= this.radialSegments; j++) {
      let v = j / this.radialSegments * Math.PI * 2;
      let sin = Math.sin(v);
      let cos = - Math.cos(v);
      this.normal.x = (cos * N.x + sin * B.x);
      this.normal.y = (cos * N.y + sin * B.y);
      this.normal.z = (cos * N.z + sin * B.z);
      this.normal.normalize();
      let index = (i * (this.radialSegments + 1) + j) * 3;
      this.nArray[index] = this.normal.x;
      this.nArray[index + 1] = this.normal.y;
      this.nArray[index + 2] = this.normal.z;
      this.pArray[index] = this.P.x + this.radius * this.normal.x;
      this.pArray[index + 1] = this.P.y + this.radius * this.normal.y;
      this.pArray[index + 2] = this.P.z + this.radius * this.normal.z;
    }
  }
}

App();



// var vertex = `
// 		attribute vec2 uv;
// 		attribute vec2 position;
// 		varying vec2 vUv;
// 		void main() {
// 				vUv = uv;
// 				gl_Position = vec4(position, 0, 1);
// 		}
// `;
// var fragment = `
// 		precision highp float;
// 		precision highp int;
// 		uniform sampler2D tWater;
// 		uniform sampler2D tFlow;
// 		uniform float uTime;
// 		varying vec2 vUv;
// 		uniform vec4 res;
// 		uniform vec2 img;

// 		vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
// 				return uvs * factor - factor /2. + 0.5;
// 		}

// 		void main() {

// 			// R and G values are velocity in the x and y direction
// 			// B value is the velocity length
// 			vec3 flow = texture2D(tFlow, vUv).rgb;

// 			vec2 uv = .5 * gl_FragCoord.xy / res.xy ;

// 			// vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
// 			vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
// 			myUV -= flow.xy * (0.15 * 1.2);

// 			vec2 myUV2 = (uv - vec2(0.5))*res.zw + vec2(0.5);
// 			myUV2 -= flow.xy * (0.125 * 1.2);

// 			vec2 myUV3 = (uv - vec2(0.5))*res.zw + vec2(0.5);
// 			myUV3 -= flow.xy * (0.10 * 1.4);

// 			vec3 tex = texture2D(tWater, myUV).rgb;
// 			vec3 tex2 = texture2D(tWater, myUV2).rgb;
// 			vec3 tex3 = texture2D(tWater, myUV3).rgb;

// 			gl_FragColor = vec4(tex.r, tex2.g, tex3.b, 1.0);
// 		}
// `;
// {
// 	var _size = [2048, 1638];
// 	var renderer = new ogl.Renderer({ dpr: 2 });
// 	var gl = renderer.gl;
// 	document.body.appendChild(gl.canvas);

// 	// Variable inputs to control flowmap
// 	var aspect = 1;
// 	var mouse = new ogl.Vec2(-1);
// 	var velocity = new ogl.Vec2();
// 	function resize() {
// 		gl.canvas.width = window.innerWidth * 2.0;
// 		gl.canvas.height = window.innerHeight * 2.0;
// 		gl.canvas.style.width = window.innerWidth + "px";
// 		gl.canvas.style.height = window.innerHeight + "px";

// 		var a1, a2;
// 		var imageAspect = _size[1] / _size[0];
// 		if (window.innerHeight / window.innerWidth < imageAspect) {
// 			a1 = 1;
// 			a2 = window.innerHeight / window.innerWidth / imageAspect;
// 		} else {
// 			a1 = window.innerWidth / window.innerHeight * imageAspect;
// 			a2 = 1;
// 		}
// 		mesh.program.uniforms.res.value = new ogl.Vec4(
// 			window.innerWidth,
// 			window.innerHeight,
// 			a1,
// 			a2
// 		);

// 		renderer.setSize(window.innerWidth, window.innerHeight);
// 		aspect = window.innerWidth / window.innerHeight;
// 	}
// 	var flowmap = new ogl.Flowmap(gl, {
// 		falloff: 0.3,
// 		dissipation: 0.92,
// 		alpha: 0.5
// 	});
// 	// Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
// 	var geometry = new ogl.Geometry(gl, {
// 		position: {
// 			size: 2,
// 			data: new Float32Array([-1, -1, 3, -1, -1, 3])
// 		},
// 		uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
// 	});
// 	var texture = new ogl.Texture(gl, {
// 		minFilter: gl.LINEAR,
// 		magFilter: gl.LINEAR
// 	});
// 	var img = new Image();
// 	img.onload = () => (texture.image = img);
// 	img.crossOrigin = "Anonymous";
// 	img.src = "11 -- Img.jpg";

// 	var a1, a2;
// 	var imageAspect = _size[1] / _size[0];
// 	if (window.innerHeight / window.innerWidth < imageAspect) {
// 		a1 = 1;
// 		a2 = window.innerHeight / window.innerWidth / imageAspect;
// 	} else {
// 		a1 = window.innerWidth / window.innerHeight * imageAspect;
// 		a2 = 1;
// 	}

// 	var program = new ogl.Program(gl, {
// 		vertex,
// 		fragment,
// 		uniforms: {
// 			uTime: { value: 0 },
// 			tWater: { value: texture },
// 			res: {
// 				value: new ogl.Vec4(window.innerWidth, window.innerHeight, a1, a2)
// 			},
// 			img: { value: new ogl.Vec2(_size[1], _size[0]) },
// 			// Note that the uniform is applied without using an object and value property
// 			// This is because the class alternates this texture between two render targets
// 			// and updates the value property after each render.
// 			tFlow: flowmap.uniform
// 		}
// 	});
// 	var mesh = new ogl.Mesh(gl, { geometry, program });

// 	window.addEventListener("resize", resize, false);
// 	resize();

// 	// Create handlers to get mouse position and velocity
// 	var isTouchCapable = "ontouchstart" in window;
// 	if (isTouchCapable) {
// 		window.addEventListener("touchstart", updateMouse, false);
// 		window.addEventListener("touchmove", updateMouse, { passive: false });
// 	} else {
// 		window.addEventListener("mousemove", updateMouse, false);
// 	}
// 	var lastTime;
// 	var lastMouse = new ogl.Vec2();
// 	function updateMouse(e) {
// 		e.preventDefault();
	
// 		if (e.changedTouches && e.changedTouches.length) {
// 			e.x = e.changedTouches[0].pageX;
// 			e.y = e.changedTouches[0].pageY;
// 		}
// 		if (e.x === undefined) {
// 			e.x = e.pageX;
// 			e.y = e.pageY;
// 		}
// 		// Get mouse value in 0 to 1 range, with y flipped
// 		mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
// 		// Calculate velocity
// 		if (!lastTime) {
// 			// First frame
// 			lastTime = performance.now();
// 			lastMouse.set(e.x, e.y);
// 		}

// 		var deltaX = e.x - lastMouse.x;
// 		var deltaY = e.y - lastMouse.y;

// 		lastMouse.set(e.x, e.y);

// 		var time = performance.now();

// 		// Avoid dividing by 0
// 		var delta = Math.max(10.4, time - lastTime);
// 		lastTime = time;
// 		velocity.x = deltaX / delta;
// 		velocity.y = deltaY / delta;
// 		// Flag update to prevent hanging velocity values when not moving
// 		velocity.needsUpdate = true;
// 	}
// 	requestAnimationFrame(update);
// 	function update(t) {
// 		requestAnimationFrame(update);
// 		// Reset velocity when mouse not moving
// 		if (!velocity.needsUpdate) {
// 			mouse.set(-1);
// 			velocity.set(0);
// 		}
// 		velocity.needsUpdate = false;
// 		// Update flowmap inputs
// 		flowmap.aspect = aspect;
// 		flowmap.mouse.copy(mouse);
// 		// Ease velocity input, slower when fading out
// 		flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
// 		flowmap.update();
// 		program.uniforms.uTime.value = t * 0.01;
// 		renderer.render({ scene: mesh });
// 	}
// }
