const simplex = new SimplexNoise();

function App(conf) {

  conf = {
    fov: 75,
    cameraZ: 300,
    background: 0x127475,
    tubeRadius: 4,
    resY: 92,   // This controls the number- 90is two
    resX: 3, // This controls the roughness
    noiseCoef: 50,
    timeCoef: 250,
    mouseCoef: 20,
    heightCoef: 10,
    ambientColor: 0x000,
    lightIntensity: 4,
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
  let cscale; updateCScale(chroma('#BBE6E4'));

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
    noiseConf.coef = conf.noiseCoef * 0.00016;
    noiseConf.height = conf.heightCoef;
    noiseConf.time = Date.now() * conf.timeCoef * 0.00000002;

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


// Init
  var app = angular.module("prototype", []);
  
  // Flip word
  ("use strict");
  app.directive("flipWord", function($interval) {
    return {
      scope: {
        flipWord: "="
      },
      link: function(scope, element) {
        var timer = 3000, // Make sure timer is equal to animation length in the CSS.
          words = scope.flipWord ? scope.flipWord : [],
          i = 0;
  
        function getNextWord() {
          i++;
  
          if (i >= words.length) {
            i = 0;
          }
  
          return words[i];
        }
  
        function setWord() {
          element[0].innerHTML =
            '<span class="flip-word">' + getNextWord() + "</span>";
        }
  
        $interval(function() {
          setWord();
        }, timer);
  
        setWord();
      }
    };
  });

  // Gsap Intro

  document.addEventListener('DOMContentLoaded', function() {
    // Start the animation after a 1.5-second delay
    gsap.to("#preloader", {
      delay: 0.5, // Wait for 1.5 seconds before starting the animation
      duration: 2, // Duration of the animation
      y: "-100%", // Slide the entire preloader up
      ease: "power2.inOut", // Smooth transition for the slide up
      onComplete: hidePreloader // Function to hide the preloader after the animation
    });
    
    function hidePreloader() {
      // Hide or remove the preloader from the DOM
      document.getElementById("preloader").style.display = "none";
    }

    gsap.fromTo("#sub-heading", 
    {opacity: 0, y: 10}, // Starting properties
    {duration: 2, opacity: 1, y: 0, delay: 1} // Ending properties and animation timing
  );


  gsap.fromTo(".navbar", 
    {opacity: 0, y: -20}, // Starting properties
    {duration: 1, opacity: 1, y: 0, delay: 1} // Ending properties and animation timing
  );

  });
