/**********************
 * GLOBAL VARIABLES & INITIALIZATION
 **********************/
const BLOCK_SIZE = 60; // each cell will be 60x60 pixels
let gridRows = 15, gridCols = 15;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = gridCols * BLOCK_SIZE;
canvas.height = gridCols * BLOCK_SIZE;

canvas.width = gridCols * BLOCK_SIZE;
canvas.height = gridRows * BLOCK_SIZE;

// Obstacle Respawn Settings (customizable)
const OBSTACLE_RESPAWN_INTERVAL = 86400000; // 1 day in ms
const OBSTACLE_RESPAWN_PROBABILITY = 0.05; // 5% chance per empty cell per cycle

// Add the background image for the map blocks.
const backgroundImg = new Image();
backgroundImg.src = "img/grass.png";

// Build grid array for assets.
const grid = [];
for (let r = 0; r < gridRows; r++) {
  grid[r] = [];
  for (let c = 0; c < gridCols; c++) {
    grid[r][c] = null;
  }
}

// Build obstacles array (reserve top-left 2x2 cells for starting assets).
let obstacles = [];
function generateObstacleForCell(r, c) {
  if ((r === 0 && c === 0) || (r === 0 && c === 1) ||
      (r === 1 && c === 0) || (r === 1 && c === 1)) {
    return null;
  }
  if (Math.random() < 0.15) {
    const types = ["river", "tree", "mountain"];
    const type = types[Math.floor(Math.random() * types.length)];
    return { type: type };
  }
  return null;
}
function generateObstacles() {
  obstacles = [];
  for (let r = 0; r < gridRows; r++) {
    obstacles[r] = [];
    for (let c = 0; c < gridCols; c++) {
      obstacles[r][c] = (grid[r][c] === null) ? generateObstacleForCell(r, c) : null;
    }
  }
}
generateObstacles();

// New helper: Check if a cell is adjacent (including diagonals) to an obstacle of a given type.
function isAdjacentToObstacle(row, col, obstacleType) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
        if (obstacles[r] && obstacles[r][c] && obstacles[r][c].type === obstacleType) {
          return true;
        }
      }
    }
  }
  return false;
}

// Global Synthetic Hero pool and maximum hero capacity
let syntheticHeroPool = 0; // renamed from syntheticAgentsPool
let maxAgentCapacity = 2;

/**********************
 * OBSTACLE RESPAWN FUNCTION
 **********************/
function respawnObstacles() {
  // Loop through every cell; if there is no building and no obstacle, spawn one with a given probability.
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (!grid[r][c] && !obstacles[r][c]) {
        if (Math.random() < OBSTACLE_RESPAWN_PROBABILITY) {
          const types = ["river", "tree", "mountain"];
          const chosenType = types[Math.floor(Math.random() * types.length)];
          obstacles[r][c] = { type: chosenType };
        }
      }
    }
  }
  drawGrid();
}
setInterval(respawnObstacles, OBSTACLE_RESPAWN_INTERVAL);

// Next Era Requirements.
const nextEraRequirements = {
  gold: 10000000,
  silver: 10000000,
  diamond: 10000000,
  bronze: 10000000,
  iron: 10000000,
  steel: 10000000,
  wood: 10000000,
  stone: 10000000,
  water: 10000000,
  food: 100000000,
  utility: 100000000,
  population: 1000000
};

/**********************
 * GAME CONFIGURATION
 **********************/
const buildingTypes = {
  gold:    { resource: "gold",    produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/goldmine.png" },
  silver:  { resource: "silver",  produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/silvermine.png" },
  diamond: { resource: "diamond", produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/diamondmine.png" },
  bronze:  { resource: "bronze",  produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/bronzemine.png" },
  iron:    { resource: "iron",    produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/ironmine.png" },
  steel:   { resource: "steel",   produce: 5, cost: { food: 1 }, interval: 5000, imgUrl: "img/steelmill.png" },
  wood:    { resource: "wood",    produce: 25, cost: { food: 1 }, interval: 5000, imgUrl: "img/lumbermill.png" },
  food:    { resource: "food",    produce: 25, cost: {},         interval: 2000, imgUrl: "img/foodfarm.png" },
  utility: { resource: "utility", produce: 25, cost: {},         interval: 5000, imgUrl: "img/warehouse.png" },
  housing: { resource: "population", produce: 1, cost: {}, interval: 10000, imgUrl: "img/housing.png" },
  quarry:  { resource: "stone", produce: 25, cost: {}, interval: 5000, imgUrl: "img/quarry.png" },
  well:    { resource: "water", produce: 25, cost: {}, interval: 5000, imgUrl: "img/well.png" }
};

// --- UPGRADE FUNCTIONS ---
function upgradeBuilding(building) {
  if (building.level >= 10) {
    showPopupshowPopupAlert("Maximum asset level reached for this asset.");
    return;
  }
  
  // Build a confirmation message based on building type and level.
  let confirmMsg = "";
  if (["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"].includes(building.type) && building.level === 1) {
    confirmMsg = "Upgrading this " + building.type + " asset to level 2 will cause it to require 2 Utility per sec to run.\n";
  }
  confirmMsg += "Do you want to upgrade " + building.type + " from level " + building.level + " to level " + (building.level + 1) + "?";
  
  // Use your custom modal confirmation instead of window.confirm.
  showConfirmModal(confirmMsg, function(userConfirmed) {
    if (userConfirmed) {
      building.level++;
      drawGrid();
      updateResourceDisplay();
    }
  });
}

function upgradeRequirement(building) {
  if (building.type === "food" || building.type === "well" || building.type === "quarry") {
    if (building.level >= 5) {
      showPopupshowPopupAlert("Maximum " +
        (building.type === "food" ? "Food Farm" : (building.type === "well" ? "Well" : "Quarry")) +
        " level (5) reached for this asset.");
      return;
    }
    let assetName = building.type === "food" ? "Food Farm" : (building.type === "well" ? "Well" : "Quarry");
    let confirmMsg = "Upgrade " + assetName + " from level " + building.level + " to level " + (building.level + 1) + "?\nThis upgrade requires 5,000 Food.";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.food < 5000) {
        showPopupshowPopupAlert("Not enough Food to upgrade.");
        return;
      }
      resources.food -= 5000;
      addPopup("food", -5000, building.row, building.col);
      building.level++;
      drawGrid();
      updateResourceDisplay();
    });
    return;
  }
  if (building.level >= 10) {
    showPopupshowPopupAlert("Maximum level (10) reached for this asset.");
    return;
  }
  let confirmMsg = "";
  if (["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"].includes(building.type) && building.level === 1) {
    confirmMsg = "Upgrading this " + building.type + " asset to level 2 will cause it to require 2 Utility per sec to run.\n";
  }
  if (building.type === "iron") {
    confirmMsg += "This upgrade requires 10,000 Steel. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.steel >= 10000) {
        resources.steel -= 10000;
        addPopup("steel", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Steel to upgrade Iron Mine.");
      }
    });
  } else if (building.type === "bronze") {
    confirmMsg += "This upgrade requires 10,000 Iron. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.iron >= 10000) {
        resources.iron -= 10000;
        addPopup("iron", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Iron to upgrade Bronze Mine.");
      }
    });
  } else if (building.type === "diamond") {
    confirmMsg += "This upgrade requires 10,000 Gold and 10,000 Silver. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.gold >= 10000 && resources.silver >= 10000) {
        resources.gold -= 10000;
        resources.silver -= 10000;
        addPopup("gold", -10000, building.row, building.col);
        addPopup("silver", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Gold and Silver to upgrade Diamond Mine.");
      }
    });
  } else if (building.type === "silver") {
    confirmMsg += "This upgrade requires 10,000 Bronze. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.bronze >= 10000) {
        resources.bronze -= 10000;
        addPopup("bronze", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Bronze to upgrade Silver Mine.");
      }
    });
  } else if (building.type === "gold") {
    confirmMsg += "This upgrade requires 10,000 Silver. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.silver >= 10000) {
        resources.silver -= 10000;
        addPopup("silver", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Silver to upgrade Gold Mine.");
      }
    });
  } else if (building.type === "steel") {
    confirmMsg += "This upgrade requires 10,000 Iron. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.iron >= 10000) {
        resources.iron -= 10000;
        addPopup("iron", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Iron to upgrade Steel Mill.");
      }
    });
  } else if (building.type === "wood") {
    confirmMsg += "This upgrade requires 10,000 Food. Do you want to upgrade?";
    showConfirmModal(confirmMsg, function(userConfirmed) {
      if (!userConfirmed) return;
      if (resources.food >= 10000) {
        resources.food -= 10000;
        addPopup("food", -10000, building.row, building.col);
        building.level++;
        drawGrid();
        updateResourceDisplay();
      } else {
        showPopupshowPopupAlert("Not enough Food to upgrade Lumber Mill.");
      }
    });
  } else {
    upgradeBuilding(building);
  }
}


const typeAbbrev = {
  gold: "G",
  silver: "S",
  diamond: "D",
  bronze: "B",
  iron: "I",
  steel: "St",
  wood: "W",
  food: "F",
  utility: "U",
  housing: "H",
  quarry: "Q",
  well: "We"
};

// Pre-load images.
const resourceImages = {};
for (let type in buildingTypes) {
  if (buildingTypes[type].imgUrl && buildingTypes[type].imgUrl.trim() !== "") {
    let img = new Image();
    img.src = buildingTypes[type].imgUrl;
    resourceImages[type] = img;
  }
}

// Customizable Obstacle Images.
const customObstacleImages = {
  river: "img/river.png",
  tree: "img/tree.png",
  mountain: "img/mountain.png"
};
const obstacleImages = {};
if(customObstacleImages.river && customObstacleImages.river.trim() !== "") {
  let img = new Image();
  img.src = customObstacleImages.river;
  obstacleImages.river = img;
}
if(customObstacleImages.tree && customObstacleImages.tree.trim() !== "") {
  let img = new Image();
  img.src = customObstacleImages.tree;
  obstacleImages.tree = img;
}
if(customObstacleImages.mountain && customObstacleImages.mountain.trim() !== "") {
  let img = new Image();
  img.src = customObstacleImages.mountain;
  obstacleImages.mountain = img;
}

let selectedType = null;
let currentBuilding = null;

/**********************
 * PERSISTENCE FUNCTIONS
 **********************/
function saveGame() {
  const state = {
    gridRows,
    gridCols,
    grid,
    obstacles,
    resources,
    syntheticHeroPool, // updated pool
    maxAgentCapacity,
    lastUpdate: Date.now()
  };
  localStorage.setItem("HeroLabsState", JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem("HeroLabsState");
  if (saved) {
    const state = JSON.parse(saved);
    gridRows = state.gridRows;
    gridCols = state.gridCols;
    resources = state.resources;
    syntheticHeroPool = state.syntheticHeroPool;
    maxAgentCapacity = state.maxAgentCapacity || 2;
    grid.length = 0;
    for (let r = 0; r < gridRows; r++) {
      grid[r] = state.grid[r] || new Array(gridCols).fill(null);
    }
    obstacles = state.obstacles || [];
    canvas.width = gridCols * BLOCK_SIZE;
    canvas.height = gridRows * BLOCK_SIZE;
    if (state.lastUpdate) {
      const offlineMs = Date.now() - state.lastUpdate;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const building = grid[r][c];
          if (building && !building.underConstruction && building.active) {
            const interval = buildingTypes[building.type].interval;
            let cycles = Math.floor(offlineMs / interval);
            if (cycles > 0) {
              let production = buildingTypes[building.type].produce * Math.pow(2, building.level - 1);
              const resourceAssets = ["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"];
              if (resourceAssets.includes(building.type)) {
                let multiplier = 1;
                if (building.HeroAgentAssigned) multiplier *= 10;
                if (building.syntheticHeroAssigned) multiplier *= 2;
                production *= multiplier;
                let totalProduction = production * cycles;
                let foodCost = ((buildingTypes[building.type].cost.food || 0) * building.level) * cycles;
                if (resources.food >= foodCost) {
                  resources[buildingTypes[building.type].resource] += totalProduction;
                  resources.food -= foodCost;
                } else {
                  let possibleCycles = Math.floor(resources.food / (((buildingTypes[building.type].cost.food || 0) * building.level) || 1));
                  resources[buildingTypes[building.type].resource] += production * possibleCycles;
                  resources.food = 0;
                }
              } else if (["food", "utility", "quarry", "well"].includes(building.type)) {
                resources[buildingTypes[building.type].resource] += production * cycles;
              } else if (building.type === "housing") {
                resources[buildingTypes[building.type].resource] += production * cycles;
              }
            }
          }
        }
      }
    }
  }
}

if (localStorage.getItem("HeroLabsState")) {
  loadGame();
} else {
  const now = Date.now();
  grid[0][0] = { type: "housing", row: 0, col: 0, active: true, level: 1, underConstruction: false, constructionComplete: 0, nextProduction: now + buildingTypes["housing"].interval, HeroAgentAssigned: false, syntheticHeroAssigned: false };
  grid[0][1] = { type: "housing", row: 0, col: 1, active: true, level: 1, underConstruction: false, constructionComplete: 0, nextProduction: now + buildingTypes["housing"].interval, HeroAgentAssigned: false, syntheticHeroAssigned: false };
  grid[1][0] = { type: "food", row: 1, col: 0, active: true, level: 1, underConstruction: false, constructionComplete: 0, nextProduction: now + buildingTypes["food"].interval, HeroAgentAssigned: false, syntheticHeroAssigned: false };
  grid[1][1] = { type: "food", row: 1, col: 1, active: true, level: 1, underConstruction: false, constructionComplete: 0, nextProduction: now + buildingTypes["food"].interval, HeroAgentAssigned: false, syntheticHeroAssigned: false };
}

/**********************
 * AGENT HELPER FUNCTIONS
 **********************/
function getTotalAssignedAgents() {
  let count = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (building) {
        if (building.HeroAgentAssigned) count++;
        if (building.syntheticHeroAssigned) count++; // updated property name
      }
    }
  }
  return count;
}

function getTotalSyntheticHeroes() { // renamed from getTotalSyntheticAgents
  let count = syntheticHeroPool;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (building && building.syntheticHeroAssigned) count++; // updated property name
    }
  }
  return count;
}

/**********************
 * MAP UPGRADE FUNCTION
 **********************/
function upgradeMap() {
  const required = 100000;
  const resourcesNeeded = ["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"];
  for (let res of resourcesNeeded) {
    if (resources[res] < required) {
      showPopupAlert("Not enough " + res + " to upgrade the map!");
      return;
    }
  }
  for (let res of resourcesNeeded) {
    resources[res] -= required;
    addPopup(res, -required);
  }
  const oldRows = gridRows, oldCols = gridCols;
  gridRows += 5;
  gridCols += 5;
  for (let r = 0; r < grid.length; r++) { 
    while (grid[r].length < gridCols) { grid[r].push(null); }
  }
  for (let r = oldRows; r < gridRows; r++) {
    let newRow = [];
    for (let c = 0; c < gridCols; c++) { newRow.push(null); }
    grid.push(newRow);
  }
  for (let r = 0; r < gridRows; r++) {
    if (!obstacles[r]) obstacles[r] = [];
    for (let c = obstacles[r].length; c < gridCols; c++) {
      obstacles[r][c] = generateObstacleForCell(r, c);
    }
  }
  canvas.width = gridCols * BLOCK_SIZE;
  canvas.height = gridRows * BLOCK_SIZE;
  drawGrid();
  updateResourceDisplay();
  maxAgentCapacity++;
  showPopupAlert("Map Upgraded! Agent capacity increased to " + maxAgentCapacity);
}

/**********************
 * SYNTHETIC HERO ACQUISITION (Renamed from SyntheticAgents)
 **********************/
function SyntheticHero() {
  if (getTotalSyntheticHeroes() >= maxAgentCapacity) {
    showPopupshowPopupAlert("Maximum Synthetic Heroes (" + maxAgentCapacity + ") reached.");
    return;
  }
  if (resources.population >= 10000) {
    resources.population -= 10000;
    addPopup("population", -10000);
    syntheticHeroPool++;
    showPopupshowPopupAlert("Synthetic Hero acquired!");
    updateResourceDisplay();
  } else {
    showPopupshowPopupAlert("Not enough Population for a Synthetic Hero (need 10,000).");
  }
}


/**********************
 * UPDATE AGENT DETAILS
 **********************/
function updateAgentDetails() {
  let Hero = [];
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (building && building.HeroAgentAssigned) {
        Hero.push(building.type + "(" + r + "," + c + ")");
      }
    }
  }
  let HeroText = Hero.length ? Hero.join(" | ") : "None";
  document.getElementById("topBar").innerText = "Hero: " + HeroText + " | Synthetic Hero: " + syntheticHeroPool;
}

/**********************
 * DRAW FUNCTIONS
 **********************/
function updateResourceDisplay() {
  document.getElementById("res-gold").innerText = formatNumber(resources.gold);
  document.getElementById("res-silver").innerText = formatNumber(resources.silver);
  document.getElementById("res-diamond").innerText = formatNumber(resources.diamond);
  document.getElementById("res-bronze").innerText = formatNumber(resources.bronze);
  document.getElementById("res-iron").innerText = formatNumber(resources.iron);
  document.getElementById("res-steel").innerText = formatNumber(resources.steel);
  document.getElementById("res-wood").innerText = formatNumber(resources.wood);
  document.getElementById("res-stone").innerText = formatNumber(resources.stone);
  document.getElementById("res-water").innerText = formatNumber(resources.water);
  document.getElementById("res-food").innerText = formatNumber(resources.food);
  document.getElementById("res-utility").innerText = formatNumber(resources.utility);
  document.getElementById("res-population").innerText = formatNumber(resources.population);
  document.getElementById("syntheticAgentsCountDisplay").innerText = syntheticHeroPool;
  updateEraRequirements();
  updateAgentDetails();
}

function updateEraRequirements() {
  for (let key in nextEraRequirements) {
    const required = nextEraRequirements[key];
    const current = resources[key] || 0;
    const missing = Math.max(required - current, 0);
    document.getElementById("req-" + key).innerText = formatNumber(missing);
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const x = c * BLOCK_SIZE;
      const y = r * BLOCK_SIZE;
      ctx.drawImage(backgroundImg, x, y, BLOCK_SIZE, BLOCK_SIZE);
      ctx.strokeStyle = "#FFD700";
      ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      if (obstacles[r] && obstacles[r][c]) {
        const obs = obstacles[r][c];
        if (obstacleImages[obs.type]) {
          ctx.drawImage(obstacleImages[obs.type], x, y, BLOCK_SIZE, BLOCK_SIZE);
        } else {
          if (obs.type === "river") {
            ctx.fillStyle = "#0B3D91";
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.fillStyle = "#FFF";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("RIV", x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
          } else if (obs.type === "tree") {
            ctx.fillStyle = "#3D2B1F";
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.fillStyle = "#FFF";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("TRE", x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
          } else if (obs.type === "mountain") {
            ctx.fillStyle = "#555555";
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.fillStyle = "#FFF";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("MTN", x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
          }
        }
      }
      const building = grid[r][c];
      if (building) {
  if (building.underConstruction) {
    // Existing code for under-construction visuals...
    const timer = Math.max(0, Math.ceil((building.constructionComplete - Date.now()) / 1000));
    if (resourceImages[building.type]) {
      ctx.drawImage(resourceImages[building.type], x, y, BLOCK_SIZE, BLOCK_SIZE);
    } else {
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(timer + " sec", x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
  } else {
    // Existing code for active building visuals:
    if (resourceImages[building.type]) {
      const img = resourceImages[building.type];
      const imgSize = BLOCK_SIZE * 1;
      ctx.drawImage(img, x + (BLOCK_SIZE - imgSize)/2, y + (BLOCK_SIZE - imgSize)/2, imgSize, imgSize);
    } else {
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const abbrev = typeAbbrev[building.type] || building.type;
      ctx.fillText(abbrev + " L" + building.level, x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
    }
    // New addition: Apply red overlay if the building is stopped.
    if (!building.active) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
    let agents = [];
    if (building.HeroAgentAssigned) agents.push("CA");
    if (building.syntheticHeroAssigned) agents.push("SH");
    if (agents.length > 0) {
      ctx.fillStyle = "#FF0000";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(agents.join("+"), x + 2, y + 2);
    }
  }
}

    }
  }
}

/**********************
 * PRODUCTION POPUPS & FLOATING TEXT
 **********************/
function addPopup(resource, amount, row, col) {
  const popupElem = document.getElementById("popup-" + resource);
  popupElem.textContent = (amount > 0 ? "(+" + amount + ")" : "(" + amount + ")");
  popupElem.style.color = amount >= 0 ? "green" : "red";
  popupElem.style.opacity = 1;
  setTimeout(() => { popupElem.style.opacity = 0; }, 1000);
  
  let x, y;
  if (typeof row !== 'undefined' && typeof col !== 'undefined') {
    x = col * BLOCK_SIZE + BLOCK_SIZE / 2;
    y = row * BLOCK_SIZE + BLOCK_SIZE / 2;
  } else {
    const canvasRect = canvas.getBoundingClientRect();
    x = canvasRect.left + 10;
    y = canvasRect.top + 10;
  }
  spawnFloatingText(x, y, (amount > 0 ? "+" + amount : amount), amount >= 0 ? "green" : "red");
}

function spawnFloatingText(x, y, text, color) {
  const floatingText = document.createElement("div");
  floatingText.className = "floating-text";
  floatingText.style.left = x + "px";
  floatingText.style.top = y + "px";
  floatingText.style.color = color || "#FFD700";
  floatingText.textContent = text;
  document.getElementById("gameArea").appendChild(floatingText);
  setTimeout(() => { floatingText.remove(); }, 1500);
}

/**********************
 * OBSTACLE INTERACTION
 **********************/
let currentObstacle = { row: null, col: null };
function showObstacleMenu(screenX, screenY, row, col) {
  currentObstacle = { row, col };
  const obsType = obstacles[row][col].type;
  const clearBtn = document.getElementById("clearObstacleButton");
  
  if (obsType === "tree") {
    clearBtn.textContent = "Chop Tree";
  } else if (obsType === "mountain") {
    clearBtn.textContent = "Mine Mountain";
  } else if (obsType === "river") {
    clearBtn.textContent = "Damn River";
  } else {
    clearBtn.textContent = "Clear Obstacle";
  }
  
  const menu = document.getElementById("obstacleActionMenu");
  const canvasRect = canvas.getBoundingClientRect();
  const obstacleLeft = canvasRect.left + col * BLOCK_SIZE;
  const obstacleTop = canvasRect.top + row * BLOCK_SIZE;
  menu.style.left = (obstacleLeft - 300) + "px";
  menu.style.top = (obstacleTop - 50) + "px";
  menu.style.display = "block";
}

function hideObstacleMenu() {
  const menu = document.getElementById("obstacleActionMenu");
  menu.style.display = "none";
  currentObstacle = { row: null, col: null };
}

function clearObstacle() {
  const { row, col } = currentObstacle;
  if (row === null || col === null || !obstacles[row][col]) return;
  const obsType = obstacles[row][col].type;
  let costFood = 50;
  let reward = 0;
  let rewardResource = "";
  
  if (resources.food < costFood) {
    showPopupAlert("Not enough Food to clear this obstacle!");
    return;
  }
  
  if (obsType === "tree") {
    reward = 1000;
    rewardResource = "wood";
  } else if (obsType === "mountain") {
    reward = 1000;
    rewardResource = "stone";
  } else if (obsType === "river") {
    reward = 1000;
    rewardResource = "water";
  }
  
  resources.food -= costFood;
  resources[rewardResource] += reward;
  
  const x = col * BLOCK_SIZE + 5;
  const y = row * BLOCK_SIZE + 5;
  spawnFloatingText(x, y, `-${costFood} Food`, "red");
  spawnFloatingText(x, y - 15, `+${reward} ${rewardResource.charAt(0).toUpperCase() + rewardResource.slice(1)}`, "green");
  
  obstacles[row][col] = null;
  
  updateResourceDisplay();
  drawGrid();
  hideObstacleMenu();
}

document.getElementById("clearObstacleButton").addEventListener("click", clearObstacle);
document.getElementById("cancelObstacleButton").addEventListener("click", hideObstacleMenu);

/**********************
 * ACTION MENU
 **********************/
const actionMenu = document.getElementById("actionMenu");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const upgradeButton = document.getElementById("upgradeButton");
const toggleHeroButton = document.getElementById("toggleHeroButton");
const toggleSyntheticButton = document.getElementById("toggleSyntheticButton");
const demolishButton = document.getElementById("demolishButton");
let toggleWaterForFoodButton = null; // Will be created dynamically for wells

function showActionMenu(x, y, building) {
  currentBuilding = building;
  actionMenu.style.left = x + "px";
  actionMenu.style.top = y + "px";
  actionMenu.style.display = "block";
  
  let existingCloseBtn = document.getElementById("closeActionMenuButton");
  if (existingCloseBtn) {
    existingCloseBtn.remove();
  }
  
  const closeBtn = document.createElement("button");
  closeBtn.id = "closeActionMenuButton";
  closeBtn.innerText = "X";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "-10px";  
  closeBtn.style.right = "-10px";
  closeBtn.style.width = "20px";
  closeBtn.style.height = "20px";
  closeBtn.style.fontSize = "12px";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.background = "#333";
  closeBtn.style.color = "#FFD700";
  closeBtn.style.border = "2px solid #FFD700";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.cursor = "pointer";

  closeBtn.addEventListener("click", hideActionMenu);
  actionMenu.appendChild(closeBtn);
  
  // **Restoring Well-specific Toggle Button:**
  if (building.type === "well") {
    // Create the toggle button for water-for-food if not already present.
    if (!toggleWaterForFoodButton) {
      toggleWaterForFoodButton = document.createElement("button");
      toggleWaterForFoodButton.innerText = building.waterForFood ? "Disable Water for Food" : "Enable Water for Food";
      toggleWaterForFoodButton.style.margin = "5px";
      toggleWaterForFoodButton.style.padding = "10px 15px";
      toggleWaterForFoodButton.style.border = "2px solid #FFD700";
      toggleWaterForFoodButton.style.background = "#333";
      toggleWaterForFoodButton.style.color = "#FFD700";
      toggleWaterForFoodButton.style.cursor = "pointer";
      toggleWaterForFoodButton.style.boxShadow = "4px 4px 0 #000";
      toggleWaterForFoodButton.addEventListener("click", () => {
        building.waterForFood = !building.waterForFood;
        toggleWaterForFoodButton.innerText = building.waterForFood ? "Disable Water for Food" : "Enable Water for Food";
        drawGrid();
        updateResourceDisplay();
      });
      actionMenu.appendChild(toggleWaterForFoodButton);
    }
  }
  
  setTimeout(() => { actionMenu.classList.add("show"); }, 10);
}

function hideActionMenu() {
  actionMenu.classList.remove("show");
  setTimeout(() => { 
    actionMenu.style.display = "none"; 
    currentBuilding = null; 
    const closeBtn = document.getElementById("closeActionMenuButton");
    if (closeBtn) closeBtn.remove();
    if (toggleWaterForFoodButton) {
      toggleWaterForFoodButton.remove();
      toggleWaterForFoodButton = null;
    }
  }, 200);
}

startButton.addEventListener("click", () => {
  if (currentBuilding) {
    currentBuilding.active = true;
    hideActionMenu();
    drawGrid();
  }
});

stopButton.addEventListener("click", () => {
  if (currentBuilding) {
    currentBuilding.active = false;
    hideActionMenu();
    drawGrid();
  }
});

upgradeButton.addEventListener("click", () => {
  if (currentBuilding) {
    if (["gold", "silver", "diamond", "bronze", "iron", "steel", "wood", "food", "well", "quarry"].includes(currentBuilding.type)) {
      upgradeRequirement(currentBuilding);
    } else {
      upgradeBuilding(currentBuilding);
    }
    hideActionMenu();
    drawGrid();
  }
});

toggleHeroButton.addEventListener("click", () => {
  if (currentBuilding) {
    if (!currentBuilding.HeroAgentAssigned) {
      if (getTotalAssignedAgents() < maxAgentCapacity) {
        currentBuilding.HeroAgentAssigned = true;
        if (currentBuilding.underConstruction) {
          currentBuilding.underConstruction = false;
          currentBuilding.active = true;
          currentBuilding.nextProduction = Date.now() + buildingTypes[currentBuilding.type].interval;
        }
      } else {
        showPopupAlert("Maximum agent assignments reached (" + maxAgentCapacity + ").");
      }
    } else {
      currentBuilding.HeroAgentAssigned = false;
    }
    hideActionMenu();
    drawGrid();
    updateResourceDisplay();
  }
});

toggleSyntheticButton.addEventListener("click", () => {
  if (currentBuilding) {
    if (!currentBuilding.syntheticHeroAssigned) { // updated property
      if (getTotalAssignedAgents() < maxAgentCapacity) {
        if (syntheticHeroPool > 0) { // updated variable
          currentBuilding.syntheticHeroAssigned = true; // updated property
          syntheticHeroPool--; // updated variable
          if (currentBuilding.underConstruction) {
            currentBuilding.underConstruction = false;
            currentBuilding.active = true;
            currentBuilding.nextProduction = Date.now() + buildingTypes[currentBuilding.type].interval;
          }
        } else {
          showPopupAlert("No Synthetic Hero available!"); // updated text
        }
      } else {
        showPopupAlert("Maximum agent assignments reached (" + maxAgentCapacity + ").");
      }
    } else {
      currentBuilding.syntheticHeroAssigned = false; // updated property
      syntheticHeroPool++; // updated variable
    }
    hideActionMenu();
    drawGrid();
    updateResourceDisplay();
  }
});

demolishButton.addEventListener("click", () => {
  if (currentBuilding) {
    grid[currentBuilding.row][currentBuilding.col] = null;
    hideActionMenu();
    drawGrid();
  }
});

document.addEventListener("click", (e) => {
  if (!actionMenu.contains(e.target) && e.target.id !== "gameCanvas") {
    hideActionMenu();
  }
});

/**********************
 * USER INTERACTIONS
 **********************/
function canPlaceAsset(type) {
  const resourceAssets = ["gold", "silver", "diamond", "bronze", "iron"];
  if (resourceAssets.includes(type) && resources.food < 300) {
    showPopupAlert("At least 300 Food required to build a resource establishment.");
    return false;
  }
  return true;
}

const invButtons = document.querySelectorAll(".inventory-button");
invButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    invButtons.forEach(b => b.classList.remove("selected"));
    if (selectedType === btn.dataset.type) {
      selectedType = null;
    } else {
      selectedType = btn.dataset.type;
      btn.classList.add("selected");
    }
  });
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / BLOCK_SIZE);
  const row = Math.floor(y / BLOCK_SIZE);
  
  if (obstacles[row] && obstacles[row][col]) {
    showObstacleMenu(e.clientX, e.clientY, row, col);
    return;
  }
  
  if (grid[row][col] !== null) {
    showActionMenu(x, y, grid[row][col]);
  } else if (selectedType) {
    let count = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (grid[r][c] && grid[r][c].type === selectedType) count++;
      }
    }
    if (count >= 10) {
      showPopupAlert("Max " + selectedType + " assets (10) reached!");
      return;
    }
    if (!canPlaceAsset(selectedType)) return;
    
    if (selectedType === "gold") {
      if (resources.silver < 10000) {
        showPopupAlert("Not enough Silver to build Gold Mine!");
        return;
      }
      resources.silver -= 10000;
      addPopup("silver", -10000, row, col);
    } else if (selectedType === "diamond") {
      if (resources.gold < 10000 || resources.silver < 10000) {
        showPopupAlert("Not enough Gold and Silver to build Diamond Mine!");
        return;
      }
      resources.gold -= 10000;
      resources.silver -= 10000;
      addPopup("gold", -10000, row, col);
      addPopup("silver", -10000, row, col);
    } else if (selectedType === "silver") {
      if (resources.bronze < 10000) {
        showPopupAlert("Not enough Bronze to build Silver Mine!");
        return;
      }
      resources.bronze -= 10000;
      addPopup("bronze", -10000, row, col);
    } else if (selectedType === "iron") {
      if (resources.steel < 10000) {
        showPopupAlert("Not enough Steel to build Iron Mine!");
        return;
      }
      resources.steel -= 10000;
      addPopup("steel", -10000, row, col);
    } else if (selectedType === "steel") {
      if (resources.wood < 10000) {
        showPopupAlert("Not enough Wood to build Steel Mine!");
        return;
      }
      resources.wood -= 10000;
      addPopup("wood", -10000, row, col);
    }
    
    let countForType = count;
    let multiplier = Math.min(countForType + 1, 10);
    let delay = 20000 * multiplier;
    
    showConfirmModal("This " + selectedType + " will take " + (delay/1000) + " sec to construct. Proceed?", function(userConfirmed) {
      if (!userConfirmed) return;
      
      const now = Date.now();
      grid[row][col] = {
        type: selectedType,
        row: row,
        col: col,
        active: false,
        level: 1,
        underConstruction: true,
        constructionComplete: now + delay,
        nextProduction: 0,
        HeroAgentAssigned: false,
        syntheticHeroAssigned: false // updated property
      };
      drawGrid();
      setTimeout(function() {
        grid[row][col].underConstruction = false;
        grid[row][col].active = true;
        grid[row][col].constructionComplete = Date.now();
        grid[row][col].nextProduction = Date.now() + buildingTypes[selectedType].interval;
        drawGrid();
        saveGame();
      }, delay);
    });
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / BLOCK_SIZE);
  const row = Math.floor(y / BLOCK_SIZE);
  if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) {
     hideBlockDetails();
     return;
  }
  const building = grid[row][col];
  if (building) {
     updateBlockDetails(e);
  } else {
     hideBlockDetails();
  }
});
canvas.addEventListener("mouseleave", hideBlockDetails);

function updateBlockDetails(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / BLOCK_SIZE);
  const row = Math.floor(y / BLOCK_SIZE);
  if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) {
     hideBlockDetails();
     return;
  }
  const building = grid[row][col];
  if (!building) {
     hideBlockDetails();
     return;
  }
  let detailsHTML = "<strong>Type:</strong> " + building.type.charAt(0).toUpperCase() + building.type.slice(1) + "<br>";
  detailsHTML += "<strong>Level:</strong> " + building.level + "<br>";
  if (building.underConstruction) {
    const timeLeft = Math.ceil((building.constructionComplete - Date.now()) / 1000);
    detailsHTML += "<em>Under Construction</em><br>";
    detailsHTML += "<strong>Time Left:</strong> " + timeLeft + " sec<br>";
  } else {
    const bt = buildingTypes[building.type];
    let baseProd = bt.produce * Math.pow(2, building.level - 1);
    let multiplier = 1;
    let agentDetails = "";
    if (building.HeroAgentAssigned) {
        multiplier *= 10;
        agentDetails += "<strong>Hero:</strong> Yes<br>";
    } else {
        agentDetails += "<strong>Hero:</strong> No<br>";
    }
    if (building.syntheticHeroAssigned) { // updated property
        multiplier *= 2;
        agentDetails += "<strong>Synthetic Hero:</strong> Yes<br>"; // updated text
    } else {
        agentDetails += "<strong>Synthetic Hero:</strong> No<br>"; // updated text
    }
    let obstacleMultiplier = 1;
    if (["gold", "silver", "diamond", "bronze", "iron", "steel"].includes(building.type)) {
      if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
        obstacleMultiplier *= 2;
      }
    } else if (building.type === "wood") {
      if (isAdjacentToObstacle(building.row, building.col, "tree")) {
        obstacleMultiplier *= 2;
      }
    } else if (["food", "well"].includes(building.type)) {
      if (isAdjacentToObstacle(building.row, building.col, "river")) {
        obstacleMultiplier *= 2;
      }
    } else if (building.type === "quarry") {
      if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
        obstacleMultiplier *= 2;
      }
    }
    multiplier *= obstacleMultiplier;
    let effectiveProd = baseProd * multiplier;
    let prodPerSec = effectiveProd * (1000 / bt.interval);
    detailsHTML += agentDetails;
    detailsHTML += "<strong>Multiplier:</strong> x" + multiplier + "<br>";
    detailsHTML += "<strong>Prod:</strong> " + prodPerSec.toFixed(2) + " " + bt.resource + "/sec<br>";
    const resourceAssets = ["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"];
    if (resourceAssets.includes(building.type) && building.level >= 2) {
      detailsHTML += "<strong>Req Utility:</strong> 2/sec<br>";
    }
  }
  const tooltip = document.getElementById("blockDetails");
  tooltip.innerHTML = detailsHTML;
  tooltip.style.display = "block";
  tooltip.style.left = (e.clientX + 10) + "px";
  tooltip.style.top = (e.clientY + 10) + "px";
}

function hideBlockDetails() {
  const tooltip = document.getElementById("blockDetails");
  tooltip.style.display = "none";
}

document.getElementById("upgradeMapButton").addEventListener("click", upgradeMap);
document.getElementById("acquireSyntheticAgentButton").addEventListener("click", SyntheticHero); // updated: SyntheticHero function
document.getElementById("resetGameButton").addEventListener("click", () => {
  if (confirm("Reset game? All progress will be lost.")) {
    localStorage.removeItem("HeroLabsState");
    location.reload();
  }
});
document.getElementById("instructionBtn").addEventListener("click", () => {
  const modal = document.getElementById("instructionsModal");
  modal.style.position = "fixed"; // Ensure fixed positioning
  modal.style.zIndex = "99999";    // A high z-index to stay on top
  modal.style.display = "flex";
  setTimeout(() => { 
    modal.classList.add("show"); 
  }, 10);
});

document.getElementById("closeInstructionsButton").addEventListener("click", () => {
  const modal = document.getElementById("instructionsModal");
  modal.classList.remove("show");
  setTimeout(() => { modal.style.display = "none"; }, 300);
});

/**********************
 * RESOURCE HOVER TOOLTIP SETUP
 **********************/
const resourceTooltip = document.createElement("div");
resourceTooltip.id = "resourceTooltip";
document.body.appendChild(resourceTooltip);

function getResourceProductionPerSecond(resourceKey) {
  let total = 0;
  console.log("Calculating production for:", resourceKey);
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (!building || building.underConstruction || !building.active) continue;
      const bt = buildingTypes[building.type];
      if (!bt) continue;
      if (bt.resource === resourceKey) {
        let baseProd = bt.produce * Math.pow(2, building.level - 1);
        let multiplier = 1;
        if (["gold", "silver", "diamond", "bronze", "iron", "steel"].includes(building.type)) {
          if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
            multiplier *= 2;
          }
        } else if (building.type === "wood") {
          if (isAdjacentToObstacle(building.row, building.col, "tree")) {
            multiplier *= 2;
          }
        } else if (building.type === "food" || building.type === "well") {
          if (isAdjacentToObstacle(building.row, building.col, "river")) {
            multiplier *= 2;
          }
        } else if (building.type === "quarry") {
          if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
            multiplier *= 2;
          }
        }
        if (building.HeroAgentAssigned) multiplier *= 10;
        if (building.syntheticHeroAssigned) multiplier *= 2;
        let effectiveProduction = baseProd * multiplier;
        let prodPerSec = effectiveProduction * (1000 / bt.interval);
        console.log(`Building at (${r},${c}) [${building.type}] produces ${prodPerSec.toFixed(2)} ${bt.resource}/sec`);
        total += prodPerSec;
      }
    }
  }
  console.log("Total production for", resourceKey, ":", total);
  return total;
}

const resourceItems = document.querySelectorAll("#resourceBar ul.resource-list li");
resourceItems.forEach(item => {
  item.addEventListener("mouseover", (e) => {
    const resourceName = item.getAttribute("data-resource");
    console.log("Hovering resource:", resourceName);
    const prodPerSec = getResourceProductionPerSecond(resourceName);
    resourceTooltip.innerHTML = "Gain: " + prodPerSec.toFixed(2) + " per sec";
    resourceTooltip.style.display = "block";
    resourceTooltip.style.left = e.pageX + 10 + "px";
    resourceTooltip.style.top = e.pageY + 10 + "px";
  });
  item.addEventListener("mousemove", (e) => {
    resourceTooltip.style.left = e.pageX + 10 + "px";
    resourceTooltip.style.top = e.pageY + 10 + "px";
  });
  item.addEventListener("mouseout", () => {
    resourceTooltip.style.display = "none";
  });
});

/**********************
 * FOOD & WATER CONSUMPTION UPDATE (Every 10 sec)
 **********************/
setInterval(() => {
  let waterForFoodActive = false;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (building && building.type === "well" && building.waterForFood === true) {
        waterForFoodActive = true;
        break;
      }
    }
    if (waterForFoodActive) break;
  }
  
  let foodConsumption = 0;
  let waterConsumption = 0;
  if (waterForFoodActive) {
    foodConsumption = resources.population / 4;
    waterConsumption = resources.population / 4;
  } else {
    foodConsumption = resources.population / 2;
    waterConsumption = 0;
  }
  
  let displayText = "";
  if (waterForFoodActive) {
    displayText = "Food Consumption: " + foodConsumption.toFixed(2) + " per 10 sec, " +
                  "Water Consumption: " + waterConsumption.toFixed(2) + " per 10 sec";
  } else {
    displayText = "Food Consumption: " + foodConsumption.toFixed(2) + " per 10 sec";
  }
  document.getElementById("foodConsumptionDisplay").innerText = displayText;
  
  if (resources.population > 0) {
    if (waterForFoodActive) {
      if (resources.food < foodConsumption) {
        resources.population = Math.floor(resources.population / 2);
        addPopup("population", -Math.floor(resources.population));
        resources.food = 0;
      } else {
        resources.food -= foodConsumption;
        addPopup("food", -foodConsumption);
        if (resources.water >= waterConsumption) {
          resources.water -= waterConsumption;
          addPopup("water", -waterConsumption);
        } else {
          resources.water = 0;
        }
      }
    } else {
      if (resources.food < foodConsumption) {
        resources.population = Math.floor(resources.population / 2);
        addPopup("population", -Math.floor(resources.population));
        resources.food = 0;
      } else {
        resources.food -= foodConsumption;
        addPopup("food", -foodConsumption);
      }
    }
    updateResourceDisplay();
  }
}, 10000);

/**********************
 * CONSTRUCTION TIMER / PATCH TIMER
 **********************/
function updateConstructionTimer() {
  let timerText = "No construction";
  outer: for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (building && building.underConstruction) {
        const timeLeft = Math.max(0, Math.ceil((building.constructionComplete - Date.now()) / 1000));
        timerText = building.type + " (" + timeLeft + " sec)";
        break outer;
      }
    }
  }
  document.getElementById("patchTimer").innerText = timerText;
}
setInterval(updateConstructionTimer, 200);

/**********************
 * GAME PRODUCTION LOOP (Real-Time Production)
 **********************/
setInterval(() => {
  const now = Date.now();
  const resourceAssets = ["gold", "silver", "diamond", "bronze", "iron", "steel", "wood"];
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const building = grid[r][c];
      if (!building) continue;
      if (building.underConstruction) {
        if (now >= building.constructionComplete) {
          building.underConstruction = false;
          building.active = true;
          building.nextProduction = now + buildingTypes[building.type].interval;
          const popupX = building.col * BLOCK_SIZE + 5;
          const popupY = building.row * BLOCK_SIZE + 5;
          spawnFloatingText(popupX, popupY, "Constructed!", "cyan");
        } else {
          continue;
        }
      }
      if (building.active && now >= building.nextProduction) {
        const bt = buildingTypes[building.type];
        let productionAmount = bt.produce * Math.pow(2, building.level - 1);
        if (resourceAssets.includes(building.type)) {
          let obstacleMultiplier = 1;
          if (building.type === "wood") {
            if (isAdjacentToObstacle(building.row, building.col, "tree")) {
              obstacleMultiplier *= 2;
            }
          } else if (["gold", "silver", "diamond", "bronze", "iron", "steel"].includes(building.type)) {
            if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
              obstacleMultiplier *= 2;
            }
          }
          productionAmount *= obstacleMultiplier;
          if (building.level >= 2) {
            let utilRequired = 2 * (100 / 1000);
            if (resources.utility < utilRequired) {
              building.active = false;
              continue;
            } else {
              resources.utility -= utilRequired;
            }
          }
          let multiplier = 1;
          if (building.HeroAgentAssigned) multiplier *= 10;
          if (building.syntheticHeroAssigned) multiplier *= 2;
          productionAmount *= multiplier;
          const costFood = (bt.cost.food || 0) * building.level;
          if (resources.food >= costFood && resources.food > 0) {
            resources[bt.resource] += productionAmount;
            addPopup(bt.resource, productionAmount, r, c);
            resources.food -= costFood;
            addPopup("food", -costFood, r, c);
          }
        } else if (["food", "utility", "quarry", "well"].includes(building.type)) {
          if (building.type === "food" || building.type === "well") {
            if (isAdjacentToObstacle(building.row, building.col, "river")) {
              productionAmount *= 2;
            }
          } else if (building.type === "quarry") {
            if (isAdjacentToObstacle(building.row, building.col, "mountain")) {
              productionAmount *= 2;
            }
          }
          resources[bt.resource] += productionAmount;
          addPopup(bt.resource, productionAmount, r, c);
        } else if (building.type === "housing") {
          resources[bt.resource] += productionAmount;
          addPopup("population", productionAmount, r, c);
        }
        building.nextProduction += bt.interval;
      }
    }
  }
  updateResourceDisplay();
  drawGrid();
}, 100);

/**********************
 * POPULATION STARVATION PENALTY
 **********************/
setInterval(() => {
  if (resources.population > 0) {
    if (resources.food < resources.population) {
      resources.population = Math.floor(resources.population / 2);
      addPopup("population", -Math.floor(resources.population));
      resources.food = 0;
      updateResourceDisplay();
    } else {
      resources.food = Math.max(0, resources.food - resources.population);
      addPopup("food", -resources.population);
      updateResourceDisplay();
    }
  }
}, 10000);

setInterval(saveGame, 2000);

// Example of a custom visual showPopupAlert function
document.addEventListener('DOMContentLoaded', function() {
  let bgmEnabled = false;
  let clickSoundEnabled = true;
  
  const bgmAudio = new Audio('music/bgm.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0.1;
  
  const globalClickAudio = new Audio('music/gclick.mp3');
  
  document.addEventListener('click', function() {
    if (clickSoundEnabled) {
      const clickSound = globalClickAudio.cloneNode();
      clickSound.play().catch(err => console.log("Global click sound error:", err));
    }
  });
  
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'settings-btn';
  settingsBtn.innerHTML = '⚙';
  Object.assign(settingsBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '10000',
    backgroundColor: '#333',
    color: '#FFD700',
    border: '2px solid #FFD700',
    padding: '10px',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '16px',
    cursor: 'pointer'
  });
  
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  Object.assign(settingsPanel.style, {
    position: 'fixed',
    bottom: '70px',
    right: '20px',
    zIndex: '10000',
    backgroundColor: '#222',
    border: '2px solid #FFD700',
    padding: '10px',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '12px',
    display: 'none',
    flexDirection: 'column'
  });
  
  const bgmToggleBtn = document.createElement('button');
  bgmToggleBtn.id = 'bgm-toggle-btn';
  bgmToggleBtn.innerHTML = 'BGM: OFF';
  Object.assign(bgmToggleBtn.style, {
    marginBottom: '5px',
    padding: '5px 10px',
    backgroundColor: '#333',
    color: '#FFD700',
    border: '2px solid #FFD700',
    cursor: 'pointer'
  });
  
  const clickSoundToggleBtn = document.createElement('button');
  clickSoundToggleBtn.id = 'click-sound-toggle-btn';
  clickSoundToggleBtn.innerHTML = 'Click Sound: ON';
  Object.assign(clickSoundToggleBtn.style, {
    padding: '5px 10px',
    backgroundColor: '#333',
    color: '#FFD700',
    border: '2px solid #FFD700',
    cursor: 'pointer'
  });
  
  settingsPanel.appendChild(bgmToggleBtn);
  settingsPanel.appendChild(clickSoundToggleBtn);
  document.body.appendChild(settingsPanel);
  document.body.appendChild(settingsBtn);
  
  settingsBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    settingsPanel.style.display = (settingsPanel.style.display === 'none') ? 'flex' : 'none';
  });
  
  bgmToggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!bgmEnabled) {
      bgmAudio.play().then(() => {
        bgmEnabled = true;
        bgmToggleBtn.innerHTML = 'BGM: ON';
      }).catch(err => {
        console.log("BGM play error:", err);
      });
    } else {
      bgmAudio.pause();
      bgmEnabled = false;
      bgmToggleBtn.innerHTML = 'BGM: OFF';
    }
  });
  
  clickSoundToggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    clickSoundEnabled = !clickSoundEnabled;
    clickSoundToggleBtn.innerHTML = clickSoundEnabled ? 'Click Sound: ON' : 'Click Sound: OFF';
  });
});

// Example of a custom visual showPopupAlert function
function showPopupshowPopupAlert(message) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "1000";
  
  const showPopupAlertBox = document.createElement("div");
  showPopupAlertBox.style.backgroundColor = "#222";
  showPopupAlertBox.style.border = "2px solid #FFD700";
  showPopupAlertBox.style.padding = "20px";
  showPopupAlertBox.style.color = "#FFD700";
  showPopupAlertBox.style.fontFamily = "'Press Start 2P', monospace";
  showPopupAlertBox.style.fontSize = "14px";
  showPopupAlertBox.style.textAlign = "center";
  showPopupAlertBox.innerText = message;
  
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "OK";
  closeBtn.style.marginTop = "10px";
  closeBtn.style.padding = "5px 10px";
  closeBtn.style.backgroundColor = "#FFD700";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.borderRadius = "4px";
  closeBtn.addEventListener("click", () => {
    overlay.remove();
  });
  showPopupAlertBox.appendChild(closeBtn);
  
  overlay.appendChild(showPopupAlertBox);
  document.body.appendChild(overlay);
}

function formatNumber(num) {
  num = Number(num);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}
