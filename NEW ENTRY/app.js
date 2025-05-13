console.log('THREE.GLTFLoader:', THREE.GLTFLoader);


// Ensure GLTFLoader is initialized correctly
console.log('THREE.GLTFLoader:', THREE.GLTFLoader); // Should print the GLTFLoader function

// Declare the loader (only once in the entire script)
const loader = new THREE.GLTFLoader();
console.log('Loader initialized:', loader);

// Load the rover model
loader.load('./mars_rover_2/rover.gltf', (gltf) => {
    rover = gltf.scene;
    rover.scale.set(1, 1, 1); // Adjust the scale if necessary
    rover.position.y = 0.5; // Position above the ground
    scene.add(rover); // Add rover to the scene
    console.log('Rover loaded successfully');
}, undefined, (error) => {
    console.error('Error loading rover:', error); // Logs any loading issues
});
