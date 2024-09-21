import * as THREE from 'three';
import getStarfield from "./src/getStarfield.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const SUN_SIZE = 7.5;


const OBJECTS = {
    SUN: '01_sun',
    MERCURY: '02_mercury',
    VENUS: '03_venus',
    EARTH: '04_earth',
    MOON: '04_moon',
    MARS: '05_mars',
    JUPITER: '06_jupiter',
    SATURN: '07_saturn',
    SATURN_RINGS: '07_saturn_ring',
    URANUS: '08_uranus',
    NEPTUNE: '09_neptune'
};

class ObjectGroup {
    constructor(index, title, radius, extra, orbitRadius) {
        const objectGroup = new THREE.Group();

        if (extra) {
            switch (title) {
                case OBJECTS.EARTH:
                    extra.position.x += orbitRadius + radius + 2.5;

                    break;
                case OBJECTS.SATURN:
                    extra.position.x = orbitRadius;
                    extra.rotation.x = 2;

                    break;
            }

            objectGroup.add(extra);
        }

        const planet = ObjectGroup.createObject(title, new THREE.SphereGeometry(radius, 64, 32));

        planet.position.x = orbitRadius;
        objectGroup.add(planet);

        return objectGroup;
    }

    static createObject = (title, objectGeometry) => {
        const objectTexture = new THREE.TextureLoader().load(`textures/${title}.jpg`);
        const objectMaterial = new THREE.MeshPhongMaterial({map: objectTexture});
        const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);

        return objectMesh;
    };
}

const planets = [
    {title: OBJECTS.MERCURY, radius: 2, orbitRadius: 10.5, rotationSpeed: 4},
    {title: OBJECTS.VENUS, radius: 2, orbitRadius: 15, rotationSpeed: 2},
    {
        title: OBJECTS.EARTH,
        radius: 3,
        extra: ObjectGroup.createObject(OBJECTS.MOON, new THREE.SphereGeometry(1, 64, 32)),
        orbitRadius: 20,
        rotationSpeed: 1
    },
    {title: OBJECTS.MARS, radius: 2, orbitRadius: 35, rotationSpeed: 1 / 2},
    {title: OBJECTS.JUPITER, radius: 2, orbitRadius: 40, rotationSpeed: 1 / 4},
    {
        title: OBJECTS.SATURN,
        radius: 3.5,
        extra: ObjectGroup.createObject(OBJECTS.SATURN_RINGS, new THREE.TorusGeometry(6, 1, 2, 32)),
        orbitRadius: 50, rotationSpeed: 1 / 8
    },
    {title: OBJECTS.URANUS, radius: 2, orbitRadius: 60, rotationSpeed: 1 / 16},
    {title: OBJECTS.NEPTUNE, radius: 2, orbitRadius: 70, rotationSpeed: 1 / 32}
];

const scene = new THREE.Scene();
const w = window.innerWidth;
const h = window.innerHeight
const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 10000);
camera.position.z = 150;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('root').appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();
new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xaaaaaa, 5);
const pointLight = new THREE.PointLight(0xffffff, 2);

pointLight.position.set(0, 0, 0);

scene.add(ambientLight, pointLight);


const stars = getStarfield({numStars: 2000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);


const sun = ObjectGroup.createObject(OBJECTS.SUN, new THREE.SphereGeometry(SUN_SIZE, 64, 32));

scene.add(sun);

const planetsMap = new Map();

for (let [index, {title, radius, extra, orbitRadius}] of planets.entries()) {
    const planetGroup = new ObjectGroup(index + 1, title, radius, extra, orbitRadius);

    planetsMap.set(title, planetGroup);
    sun.add(planetGroup);
}

const EARTH_YEAR = (2 * Math.PI) / 365;

function animate() {
    sun.rotation.y += 0.001;
    stars.rotation.y -= 0.0002;
    for (const planet of planets) {
        planetsMap.get(planet.title).rotation.y += EARTH_YEAR * planet.rotationSpeed;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize, false);