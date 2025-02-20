document.addEventListener("DOMContentLoaded", function() {
  // Ensure required globals exist.
  if (typeof BLOCK_SIZE === "undefined" || typeof grid === "undefined") {
    console.error("BLOCK_SIZE or grid not defined.");
    return;
  }
  
  // Get references to the main canvas and its container.
  const mainCanvas = document.getElementById("gameCanvas");
  if (!mainCanvas) {
    console.error("gameCanvas element not found.");
    return;
  }
  const gameArea = document.getElementById("gameArea");
  if (!gameArea) {
    console.error("gameArea element not found.");
    return;
  }
  
  // Create an overlay canvas for drawing the animated people.
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.id = "peopleCanvas";
  overlayCanvas.width = mainCanvas.width;
  overlayCanvas.height = mainCanvas.height;
  overlayCanvas.style.position = "absolute";
  // Align the overlay with the main canvas.
  overlayCanvas.style.left = mainCanvas.offsetLeft + "px";
  overlayCanvas.style.top = mainCanvas.offsetTop + "px";
  overlayCanvas.style.pointerEvents = "none"; // clicks pass through
  gameArea.appendChild(overlayCanvas);
  
  const ctx = overlayCanvas.getContext("2d");
  
  // Utility: Return all completed buildings (those that are built).
  function getBuiltBuildings() {
    const buildings = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const b = grid[r][c];
        if (b && !b.underConstruction) {
          buildings.push({ row: r, col: c, type: b.type });
        }
      }
    }
    return buildings;
  }
  
  // Load the sprite sheet for the moving people.
  const peopleSprite = new Image();
  // Replace this with the path to your sprite (e.g., your samurai sprite)
  peopleSprite.src = "img/human.png";
  peopleSprite.onload = function() {
    console.log("People sprite loaded.");
  };
  peopleSprite.onerror = function() {
    console.error("Failed to load people sprite:", peopleSprite.src);
  };
  
  // Sprite configuration – adjust these values to your sprite sheet:
  const frameWidth = 64;    // width of one frame
  const frameHeight = 64;   // height of one frame
  const frameCount = 200;      // total frames horizontally in your sprite sheet
  const animationSpeed = 150; // ms per frame
  
  // Array to store active "person" objects.
  const people = [];
  
  // Create a person object that moves continuously between two random buildings.
  function createPerson() {
    const buildings = getBuiltBuildings();
    if (buildings.length < 2) return null; // Need at least 2 buildings to move between.
    
    // Choose a random start building.
    const start = buildings[Math.floor(Math.random() * buildings.length)];
    // Choose a random target building (different from start).
    let target;
    do {
      target = buildings[Math.floor(Math.random() * buildings.length)];
    } while (target === start);
    
    // Calculate the center position of the start and target cells.
    const startX = start.col * BLOCK_SIZE + BLOCK_SIZE / 2;
    const startY = start.row * BLOCK_SIZE + BLOCK_SIZE / 2;
    const targetX = target.col * BLOCK_SIZE + BLOCK_SIZE / 2;
    const targetY = target.row * BLOCK_SIZE + BLOCK_SIZE / 2;
    
    return {
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      targetX: targetX,
      targetY: targetY,
      speed: 2.5, // Increase this value for faster (running) movement.
      frame: 0,
      lastFrameTime: 0
    };
  }
  
  // Initialize 10 people.
  function initializePeople() {
    for (let i = 0; i < 10; i++) {
      const person = createPerson();
      if (person) people.push(person);
    }
  }
  
  // Animation loop for updating and drawing people.
  function animatePeople(timestamp) {
    // Ensure full opacity.
    ctx.globalAlpha = 1;
    // Clear the entire overlay canvas.
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    people.forEach(person => {
      // Update sprite frame.
      if (timestamp - person.lastFrameTime > animationSpeed) {
        person.frame = (person.frame + 1) % frameCount;
        person.lastFrameTime = timestamp;
      }
      
      // Calculate the vector from the current position to the target.
      let dx = person.targetX - person.x;
      let dy = person.targetY - person.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      // If close enough to target, swap start and target to make a loop.
      if (distance < 2) {
        const tempX = person.startX;
        const tempY = person.startY;
        person.startX = person.targetX;
        person.startY = person.targetY;
        person.targetX = tempX;
        person.targetY = tempY;
      } else {
        // Move the person toward the target.
        person.x += (dx / distance) * person.speed;
        person.y += (dy / distance) * person.speed;
      }
      
      // Draw the person sprite.
      // We scale the sprite to fill the entire BLOCK_SIZE.
      ctx.drawImage(
        peopleSprite,
        person.frame * frameWidth, 0,
        frameWidth, frameHeight,
        person.x - BLOCK_SIZE / 2, person.y - BLOCK_SIZE / 2,
        BLOCK_SIZE, BLOCK_SIZE
      );
    });
    
    requestAnimationFrame(animatePeople);
  }
  
  // Start the animation when the sprite sheet is loaded.
  peopleSprite.onload = function() {
    initializePeople();
    requestAnimationFrame(animatePeople);
  };
  
  // Expose functions to add or clear people if needed.
  window.addPerson = function() {
    const p = createPerson();
    if (p) people.push(p);
  };
  
  window.clearPeople = function() {
    people.length = 0;
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };
});
