// Ensure Three.js is available before using it
if (typeof THREE === "undefined") {
    console.error(" Three.js is NOT loaded! Check script order in HTML.");
} else {
    console.log(" Three.js Loaded Successfully:", THREE.REVISION);
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20); // Ensure visibility

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Global variables
let moon = null;
let clickableObjects = [];
let aboutObject, descriptionObject, galleryObject;

//onhover check
clickableObjects.forEach((obj) => {
    if (!obj.userData.originalScale) {
        obj.userData.originalScale = obj.scale.clone(); // Store original scale for resetting
    }
});



// Create a starry background
function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];

    for (let i = 0; i < 5000; i++) {
        starVertices.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );

        const brightness = Math.random();
        starColors.push(brightness, brightness, brightness);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true, // Enable per-vertex colors
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    return starField;
}
const starField = createStarField();

// Load the GLTF Moon Model
const loader = new THREE.GLTFLoader();
loader.load('moon.glb', function (gltf) {
    console.log(" Moon model loaded successfully!");
    moon = gltf.scene;
    moon.scale.set(5, 5, 5);
    moon.position.set(0, -50, -1000);
    scene.add(moon);
}, undefined, function (error) {
    console.error(" Error loading moon model:", error);
});

// Function to Load Clickable 3D Icons
function loadClickableObjects() {
    const objectsData = [
        { 
            name: "About", 
            model: "spaceman.glb", 
            position: { x: -45, y: 15, z: -20 }, 
            rotation: { y: Math.PI / 3 }, 
            scale: { x: 15, y: 15, z: 15 }, 
            link: "about.html", 
            ref: "aboutObject" 
        },
        { 
            name: "Meet the Team", 
            model: "sci-fi_computer.glb", 
            position: { x: -37, y: -10, z: -15 }, 
            rotation: { y: 0 }, 
            scale: { x: 3, y: 3, z: 3 }, 
            link: "description.html", 
            ref: "descriptionObject" 
        },
        { 
            name: "Gallery",  
            model: "argus_camera.glb",  
            position: { x: 40, y: 10, z: -20 },  
            rotation: { y: -Math.PI / 2 },  
            scale: { x: 0.01, y: 0.01, z: 0.01 },  
            link: "gallery.html",  
            ref: "galleryObject" 
        },
        { 
            name: "Rover Section",  //  Adding NEW Rover Section
            model: "rover_model.glb", // Change to the rover icon/model
            position: { x: 44, y: -1, z: -22 },  // Adjust position so it's separate from Gallery
            rotation: { y: 0 }, 
            scale: { x: 0.1, y: 0.1, z: 0.1 }, 
            link: "rover.html",  //  New page for Rover Section
            ref: "roverObject" 
        }
    ];
    

    objectsData.forEach((objData) => {
        loader.load(objData.model, function (gltf) {
            console.log(` ${objData.name} model loaded successfully!`);
            let obj = gltf.scene;
        
            obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
            obj.position.set(objData.position.x, objData.position.y, objData.position.z);
            obj.rotation.y = objData.rotation.y; // Ensure the correct orientation
            obj.userData = { link: objData.link, originalMaterial: [] };
        
            // Store original materials to prevent them from turning white
            obj.traverse((child) => {
                if (child.isMesh) {
                    obj.userData.originalMaterial.push(child.material.clone()); // Save original material
                }
            });
        
            clickableObjects.push(obj);
            scene.add(obj);
            
            // Assign reference to global variable
            if (objData.ref === "aboutObject") aboutObject = obj;
            if (objData.ref === "descriptionObject") descriptionObject = obj;
            if (objData.ref === "galleryObject") galleryObject = obj;
            if (objData.ref === "roverObject") roverObject = obj;

        });
        
    });

    if (window.innerWidth < 768) {
        clickableObjects.forEach(obj => {
            obj.scale.set(obj.scale.x * 0.7, obj.scale.y * 0.7, obj.scale.z * 0.7);
        });
    }
    
}

loadClickableObjects();


function debugClickableObjects() {
    console.log("🔍 Debugging Clickable Objects:", clickableObjects);

    clickableObjects.forEach((obj, index) => {
        console.log(`🛠 Object ${index + 1}:`, obj);

        obj.traverse(child => {
            if (child.isMesh) {
                console.log(` Object ${index + 1} Material Found :`, child.material);
            } else {
                console.log(` Object ${index + 1} has NO mesh :`, child);
            }
        });
    });
}

setTimeout(debugClickableObjects, 3000); // Delay to ensure models load



function onHover(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const object = intersects[0].object; 

        if (object.isMesh) {
            if (!object.userData.originalScale) {
                object.userData.originalScale = object.scale.clone();
            }

            object.scale.set(
                object.userData.originalScale.x * 1.2,
                object.userData.originalScale.y * 1.2,
                object.userData.originalScale.z * 1.2
            );
        }
    } else {
        clickableObjects.forEach(obj => {
            obj.traverse(child => {
                if (child.isMesh && child.userData.originalScale) {
                    child.scale.copy(child.userData.originalScale);
                }
            });
        });
    }
}







window.addEventListener('mousemove', onHover);




// Function to convert 3D position to 2D screen coordinates
function toScreenPosition(obj, camera) {
    let vector = new THREE.Vector3();
    let widthHalf = window.innerWidth / 2;
    let heightHalf = window.innerHeight / 2;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    return {
        x: (vector.x * widthHalf) + widthHalf,
        y: -(vector.y * heightHalf) + heightHalf
    };
}

// Function to update label positions dynamically
function updateLabels() {
    requestAnimationFrame(updateLabels);

    if (!aboutObject || !descriptionObject || !galleryObject || !roverObject) return;

    let aboutPos = toScreenPosition(aboutObject, camera);
    let descPos = toScreenPosition(descriptionObject, camera);
    let galleryPos = toScreenPosition(galleryObject, camera);
    let roverPos = toScreenPosition(roverObject, camera); // 🆕 Rover position

    document.getElementById('about-label').style.transform = `translate(${aboutPos.x - 90}px, ${aboutPos.y - 150}px)`;
    document.getElementById('description-label').style.transform = `translate(${descPos.x - 110}px, ${descPos.y - 190}px)`;
    document.getElementById('gallery-label').style.transform = `translate(${galleryPos.x - 70}px, ${galleryPos.y - 150}px)`;
    document.getElementById('rover-label').style.transform = `translate(${roverPos.x - 70}px, ${roverPos.y - 28}px)`; // 🆕 Add Rover label
}


// Function to update the twinkling effect
function updateStarTwinkle() {
    const time = performance.now() * 0.005;
    const colors = starField.geometry.attributes.color.array;

    for (let i = 0; i < colors.length; i += 3) {
        const brightness = 0.5 + 0.5 * Math.sin(time + i * 0.1);
        colors[i] = brightness;
        colors[i + 1] = brightness;
        colors[i + 2] = brightness;
    }

    starField.geometry.attributes.color.needsUpdate = true;
}

window.addEventListener("mousemove", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    clickableObjects.forEach((obj) => {
        obj.traverse((child) => {
            if (child.isMesh) {
                if (!obj.userData.originalScale) {
                    obj.userData.originalScale = obj.scale.clone(); // Store the original scale
                }
    
                if (intersects.length > 0 && intersects[0].object.parent === obj) {
                    // HOVER EFFECT - MAKE ICON POP OUT & GLOW
                    obj.scale.set(
                        obj.userData.originalScale.x * 1.1, 
                        obj.userData.originalScale.y * 1.1, 
                        obj.userData.originalScale.z * 1.1
                    );
                    clickableObjects.forEach(obj => {
                        obj.traverse(child => {
                            if (child.isMesh) {
                                console.log(`Material on ${obj.name}:`, child.material);
                            }
                        });
                    });
                    child.material.emissive = new THREE.Color(0x00ffff); // Cyan glow
child.material.emissiveIntensity = 0;
child.material.needsUpdate = true; // Ensure changes apply

                    
                    child.material.emissive = new THREE.Color(0x00ffff); // Cyan glow
                    child.material.emissiveIntensity = 0; // Strong glow effect
                } else {
                    // RESET BACK TO NORMAL WHEN NOT HOVERED
                    obj.scale.copy(obj.userData.originalScale); // Reset to original scale
                    child.material.emissiveIntensity =100 ; // Remove glow
                }
            }
        });
    });
    
    
});


// Function to create a wobble effect for floating icons
function updateIconWobble() {
    const time = performance.now() * 0.002;
    clickableObjects.forEach((obj, index) => {
        obj.position.y += Math.sin(time + index) * 0.05;
    });
}

// Enable user interaction to rotate the moon
let isDragging = false;
document.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener('mousemove', (event) => {
    if (!isDragging || !moon) return;
    
    const deltaX = event.clientX - previousMousePosition.x;
    moon.rotation.y += deltaX * 0.005;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Handle object clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        while (clickedObject.parent && !clickedObject.userData.link) {
            clickedObject = clickedObject.parent;
        }

        if (clickedObject.userData.link) {
            window.open(clickedObject.userData.link, "_self");
        }
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (moon) moon.rotation.y += 0.002;
    updateIconWobble();
    updateStarTwinkle();
    renderer.render(scene, camera);
}

window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    handleClick(touch.clientX, touch.clientY);
});

function handleClick(x, y) {
    const mouse = new THREE.Vector2(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        const link = clickedObject.userData.link || clickedObject.parent?.userData.link;

        if (link) {
            window.open(link, "_self");
        }
    }
}


updateLabels();
animate();
