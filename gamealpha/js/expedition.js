(function() {
  console.log("expedition.js is running");

  // ===========================
  // 1) CSS & Styling
  // ===========================
  const styleElem = document.createElement("style");
  styleElem.innerHTML = `
    @keyframes blinkGold {
      0% { color: #FFD700; }
      50% { color: #FFF; }
      100% { color: #FFD700; }
    }
    @keyframes glowPurple {
      0% { text-shadow: 0 0 5px #8A2BE2; }
      50% { text-shadow: 0 0 20px #8A2BE2; }
      100% { text-shadow: 0 0 5px #8A2BE2; }
    }
    /* Custom scrollbar styling for #rightMenuContent for a pixelated look */
    #rightMenuContent::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    #rightMenuContent::-webkit-scrollbar-track {
      background: #222;
      border: 2px solid #FFD700;
    }
    #rightMenuContent::-webkit-scrollbar-thumb {
      background: #555;
      border: 2px solid #FFD700;
      border-radius: 0;
    }
    /* Firefox scrollbar styling */
    #rightMenuContent {
      scrollbar-width: auto;
      scrollbar-color: #555 #222;
    }
    /* Expedition Overlay for launching expeditions */
    #expeditionOverlay {
      position: fixed;
      top: 0; 
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: none; 
      z-index: 2000;
      align-items: center;
      justify-content: center;
    }
    #expeditionPopup {
      position: relative;
      background: #222;
      border: 2px solid #FFD700;
      color: #FFD700;
      width: 350px;
      padding: 10px 15px;
      box-sizing: border-box;
      font-family: 'Press Start 2P', monospace;
      font-size: 12px;
      text-align: center;
      box-shadow: 4px 4px 0 #000;
    }
    #expeditionPopup h3 {
      margin-bottom: 8px;
      font-size: 16px;
    }
    #expeditionPopup p {
      font-size: 11px; 
      line-height: 1.4;
      margin: 0 0 10px 0;
      text-align: left;
    }
    #expeditionPopup button {
      background-color: #555;
      border: 1px solid #FFD700;
      color: #FFD700;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 2px 2px 0 #000;
      margin: 5px;
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
    }
    #expeditionPopup button:hover {
      background-color: #666;
    }
    /* Loot Overlay for showing items after success */
    #expeditionLootOverlay {
      position: fixed;
      top: 0; 
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: none; 
      z-index: 3000;
      align-items: center;
      justify-content: center;
    }
    #expeditionLootPopup {
      background: #222;
      border: 2px solid #FFD700;
      color: #FFD700;
      padding: 20px;
      width: 450px;
      box-shadow: 4px 4px 0 #000;
      position: relative;
      font-family: 'Press Start 2P', monospace;
      font-size: 12px;
      text-align: center;
    }
    #expeditionLootPopup h3 {
      margin-bottom: 10px;
      font-size: 14px;
    }
    #expeditionLootPopup .loot-items {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin: 10px 0;
      max-height: 200px;
      overflow-y: auto;
    }
    #expeditionLootPopup button {
      background-color: #555;
      border: 1px solid #FFD700;
      color: #FFD700;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 2px 2px 0 #000;
      margin: 5px;
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
    }
    #expeditionLootPopup button:hover {
      background-color: #666;
    }
    /* Confirmation Modal for generic confirmations */
    .confirm-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 6000;
    }
    .confirm-content {
      background: #222;
      border: 2px solid #FFD700;
      padding: 20px;
      font-family: 'Press Start 2P', monospace;
      font-size: 12px;
      text-align: center;
      border-radius: 8px;
      max-width: 400px;
    }
    .confirm-content button {
      margin: 5px;
    }
  `;
  document.head.appendChild(styleElem);

  // ===========================
  // 2) Item color/look definitions
  // ===========================
  const materialColors = {
    "Iron": "#4B4B4B",
    "Steel": "#6A2BE2",
    "Wood": "#8B4513",
    "Obsidian": "#2E2B2B",
    "Crystal": "#A8DADC",
    "Gold": "#FFD700",
    "Silver": "#C0C0C0",
    "Bronze": "#CD7F32",
    "Emerald": "#50C878",
    "Sapphire": "#0F52BA"
  };

  const adjectiveGlow = {
    "Ancient": "#4B4F44",
    "Mystic": "#6A4E9C",
    "Cursed": "#800000",
    "Divine": "#FFD700",
    "Glorious": "#FF8C00",
    "Enchanted": "#32CD32",
    "Forgotten": "#A9A9A9",
    "Fabled": "#B22222",
    "Ethereal": "#00FFFF",
    "Shadow": "#2F4F4F"
  };

  const rarityColors = {
    "Common": "#B0B0B0",
    "Uncommon": "#3CB371",
    "Rare": "#1E90FF",
    "Epic": "#8A2BE2",
    "Legendary": "#FF4500"
  };

  // ===========================
  // 3) Fallback resources
  // ===========================
  if (typeof resources === "undefined") {
  window.resources = {
    gold: 1000,
    silver: 1000,
    diamond: 1000,
    bronze: 1000,
    iron: 1000,
    steel: 1000,
    wood: 1000,
    stone: 1000,
    water: 1000,
    food: 1000,
    utility: 1000,
    population: 10,
    celestials: 0  // if you still need this key
  };
}

  function showPopupAlert(message) {
    const overlay = document.createElement("div");
    overlay.id = "customAlertOverlay";
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

    const alertBox = document.createElement("div");
    alertBox.style.backgroundColor = "#222";
    alertBox.style.border = "2px solid #FFD700";
    alertBox.style.padding = "20px";
    alertBox.style.color = "#FFD700";
    alertBox.style.fontFamily = "'Press Start 2P', monospace";
    alertBox.style.fontSize = "14px";
    alertBox.style.textAlign = "center";
    alertBox.innerText = message;
    
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "OK";
    closeBtn.style.marginTop = "10px";
    closeBtn.style.padding = "5px 10px";
    closeBtn.style.backgroundColor = "#FFD700";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.boxShadow = "2px 2px 0 #000";
    closeBtn.addEventListener("click", () => {
      overlay.remove();
    });
    alertBox.appendChild(closeBtn);
    
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
  }

  // Generic confirmation modal function.
  function showConfirmModal(message, callback) {
    const confirmModal = document.createElement("div");
    confirmModal.className = "confirm-modal";
    const confirmContent = document.createElement("div");
    confirmContent.className = "confirm-content";
    const msg = document.createElement("p");
    msg.innerText = message;
    confirmContent.appendChild(msg);
    const yesBtn = createGamingButton("Yes", function() {
      callback(true);
      document.body.removeChild(confirmModal);
    });
    const noBtn = createGamingButton("No", function() {
      callback(false);
      document.body.removeChild(confirmModal);
    });
    confirmContent.appendChild(yesBtn);
    confirmContent.appendChild(noBtn);
    confirmModal.appendChild(confirmContent);
    document.body.appendChild(confirmModal);
  }

  function createGamingButton(text, onClick) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.style.fontFamily = "'Press Start 2P', monospace";
    btn.style.fontSize = "14px";
    btn.style.padding = "10px 15px";
    btn.style.margin = "5px";
    btn.style.border = "2px solid #FFD700";
    btn.style.borderRadius = "8px";
    btn.style.background = "#333";
    btn.style.color = "#FFD700";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "4px 4px 0 #000";
    btn.addEventListener("click", onClick);
    btn.addEventListener("mouseover", () => btn.style.background = "#444");
    btn.addEventListener("mouseout", () => btn.style.background = "#333");
    return btn;
  }

  function styleButton(btn) {
    btn.style.fontFamily = "'Press Start 2P', monospace";
    btn.style.fontSize = "14px";
    btn.style.padding = "10px 15px";
    btn.style.margin = "5px";
    btn.style.border = "2px solid #FFD700";
    btn.style.borderRadius = "8px";
    btn.style.background = "#333";
    btn.style.color = "#FFD700";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "4px 4px 0 #000";
    btn.addEventListener("mouseover", () => btn.style.background = "#444");
    btn.addEventListener("mouseout", () => btn.style.background = "#333");
    return btn;
  }

  // ===========================
  // 4) Global inventory + loot
  // ===========================
  let playerInventory = JSON.parse(localStorage.getItem("playerInventory") || "[]");
  let expeditionLoot = JSON.parse(localStorage.getItem("expeditionLoot") || "[]");

  const MAX_INVENTORY = 200;
  let inventoryReminderShown = false;

  // ===========================
  // 5) Item Rehydration & Modal Display
  // ===========================
  function rehydrateItem(itemData) {
    itemData.upgradeLevel = itemData.upgradeLevel || 0;
    return {
      name: itemData.name,
      adjective: itemData.adjective,
      material: itemData.material,
      itemType: itemData.itemType,
      rarity: itemData.rarity,
      level: itemData.level,
      power: itemData.power,
      image: itemData.image,
      upgradeLevel: itemData.upgradeLevel,
      description: itemData.description,
      stats: itemData.stats,
      render: function() {
        const itemDiv = document.createElement("div");
        itemDiv.style.position = "relative";
        itemDiv.style.width = "70px";
        itemDiv.style.height = "70px";
        itemDiv.style.margin = "3px";
        itemDiv.style.border = "1px solid #DDD";
        itemDiv.style.backgroundImage = `url('${this.image}')`;
        itemDiv.style.backgroundSize = "contain";
        itemDiv.style.backgroundRepeat = "no-repeat";
        itemDiv.style.backgroundPosition = "center";
        
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = materialColors[this.material] || "transparent";
        overlay.style.opacity = "0.15";
        itemDiv.appendChild(overlay);
        
        const title = document.createElement("div");
        title.className = "item-title";
        title.innerText = this.name;
        title.style.position = "absolute";
        title.style.bottom = "0";
        title.style.left = "0";
        title.style.right = "0";
        title.style.fontSize = "5px";
        title.style.textAlign = "center";
        title.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        title.style.color = rarityColors[this.rarity];
        title.style.textShadow = `0 0 5px ${adjectiveGlow[this.adjective] || "#FFF"}`;
        itemDiv.appendChild(title);
        
        itemDiv.addEventListener("click", function(e) {
          e.stopPropagation();
          showItemModal(this);
        }.bind(this));
        
        if (this.upgradeLevel > 0) {
          const upgradeLabel = document.createElement("div");
          upgradeLabel.innerText = "Upgrade +" + this.upgradeLevel;
          upgradeLabel.style.position = "absolute";
          upgradeLabel.style.top = "2px";
          upgradeLabel.style.left = "2px";
          upgradeLabel.style.fontSize = "8px";
          upgradeLabel.style.backgroundColor = "rgba(0,0,0,0.6)";
          upgradeLabel.style.color = "#FFD700";
          upgradeLabel.style.padding = "1px 3px";
          upgradeLabel.style.borderRadius = "2px";
          itemDiv.appendChild(upgradeLabel);
        }
        return itemDiv;
      },
      getDescription: function() {
        return `A ${this.rarity} item: ${this.name} (Level ${this.level}, Power ${this.power}, Upgrade +${this.upgradeLevel}).`;
      }
    };
  }

  // Function to show a modal with item details including Sell and Upgrade buttons.
  function showItemModal(item) {
  console.log("Opening modal for item:", item);
  const rarityColorsLocal = window.rarityColors || {
    "Common": "#B0B0B0",
    "Uncommon": "#3CB371",
    "Rare": "#1E90FF",
    "Epic": "#8A2BE2",
    "Legendary": "#FF4500"
  };
  const adjectiveGlowLocal = window.adjectiveGlow || {
    "Ancient": "#4B3F44",
    "Mystic": "#6A4E9C",
    "Cursed": "#800000",
    "Divine": "#FFD700",
    "Glorious": "#FF8C00",
    "Enchanted": "#32CD32",
    "Forgotten": "#A9A9A9",
    "Fabled": "#B22222",
    "Ethereal": "#00FFFF",
    "Shadow": "#2F4F4F"
  };

  // Create modal overlay
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.7)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "5000";

  // Create modal content container (rectangle, flex row)
  const content = document.createElement("div");
  content.style.position = "relative";
  content.style.background = "#222";
  content.style.border = "2px solid #FFD700";
  content.style.padding = "20px";
  content.style.fontFamily = "'Press Start 2P', monospace";
  content.style.fontSize = "12px";
  content.style.color = "#FFD700";
  content.style.display = "flex";
  content.style.flexDirection = "row";
  content.style.borderRadius = "8px";
  content.style.width = "600px"; // rectangular width
  content.style.maxHeight = "80vh";

  // Close button in top-right corner
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "X";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "10px";
  closeBtn.style.fontFamily = "'Press Start 2P', monospace";
  closeBtn.style.fontSize = "14px";
  closeBtn.style.background = "#FFD700";
  closeBtn.style.color = "#222";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.padding = "5px";
  closeBtn.style.borderRadius = "4px";
  closeBtn.addEventListener("click", function(){
    document.body.removeChild(modal);
  });
  content.appendChild(closeBtn);

  // Left column: Image and visual effects
  const leftColumn = document.createElement("div");
  leftColumn.style.flex = "0 0 150px";
  leftColumn.style.display = "flex";
  leftColumn.style.flexDirection = "column";
  leftColumn.style.alignItems = "center";
  leftColumn.style.justifyContent = "center";
  leftColumn.style.marginRight = "10px";

  const imgContainer = document.createElement("div");
  imgContainer.style.position = "relative";
  imgContainer.style.width = "140px";
  imgContainer.style.height = "140px";
  imgContainer.style.border = "2px solid #FFD700";
  imgContainer.style.boxShadow = "0 0 10px " + (adjectiveGlowLocal[item.adjective] || "#FFD700");
  imgContainer.style.marginBottom = "10px";
  if(item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    imgContainer.appendChild(img);
  }
  // Upgrade overlay if applicable
  if(item.upgradeLevel > 0) {
    const upgradeVisual = document.createElement("div");
    upgradeVisual.innerText = "+" + item.upgradeLevel;
    upgradeVisual.style.position = "absolute";
    upgradeVisual.style.top = "5px";
    upgradeVisual.style.left = "5px";
    upgradeVisual.style.background = "#FFD700";
    upgradeVisual.style.color = "#222";
    upgradeVisual.style.padding = "2px 4px";
    upgradeVisual.style.fontSize = "10px";
    upgradeVisual.style.borderRadius = "3px";
    imgContainer.appendChild(upgradeVisual);
  }
  leftColumn.appendChild(imgContainer);

  // Right column: Item details and effects
  const rightColumn = document.createElement("div");
  rightColumn.style.flex = "1";
  rightColumn.style.display = "flex";
  rightColumn.style.flexDirection = "column";
  rightColumn.style.justifyContent = "flex-start";
  
  const infoHeader = document.createElement("h3");
  infoHeader.innerText = item.name;
  infoHeader.style.color = rarityColorsLocal[item.rarity];
  infoHeader.style.textShadow = "0 0 5px " + (adjectiveGlowLocal[item.adjective] || "#FFF");
  rightColumn.appendChild(infoHeader);
  
  // Create details with stats aligned vertically (one per line)
  const details = document.createElement("div");
  details.innerHTML = `
    <p>Rarity: ${item.rarity}</p>
    <p>Level: ${item.level}</p>
    ${ item.itemType !== "TreasureBox" ? `<p>Power: ${item.power}</p>
    <p>Upgrade: +${item.upgradeLevel}</p>` : '' }
    ${ item.stats ? `
      <p>Stats:</p>
      <p>STR: ${item.stats.str}</p>
      <p>AGI: ${item.stats.agi}</p>
      <p>VIT: ${item.stats.vit}</p>
      <p>INT: ${item.stats.int}</p>
      <p>DEX: ${item.stats.dex}</p>
      <p>LUK: ${item.stats.luk}</p>
    ` : `<p>Stats: No stats available.</p>` }
    ${ item.itemType === "Scroll" ? `<p><em>Scrolls are used to craft your weapons to become more powerful. Stats matter.</em></p>` : '' }
    ${ item.itemType === "TreasureBox" ? `<p><em>Open this to get random items.</em></p>` : '' }
  `;
  rightColumn.appendChild(details);

  // Footer for buttons
  const footer = document.createElement("div");
  footer.style.marginTop = "20px";
  footer.style.textAlign = "center";

  const messageDiv = document.createElement("div");
  messageDiv.style.marginBottom = "10px";
  messageDiv.style.fontSize = "10px";
  messageDiv.style.color = "#FFD700";
  footer.appendChild(messageDiv);

  const sellBtn = createGamingButton("Sell", function(){
    const sellPrice = Math.floor(item.power / 2);
    showConfirmModal("Are you sure you want to sell this item for " + sellPrice + " gold?", function(confirmed) {
      if (confirmed) {
        if(window.resources) {
          window.resources.gold = (window.resources.gold || 0) + sellPrice;
        }
        const index = playerInventory.findIndex(i => i.name === item.name && i.level === item.level && i.adjective === item.adjective);
        if(index !== -1) {
          playerInventory.splice(index, 1);
          saveData();
          updateInventoryStats();
        }
        messageDiv.innerText = `Item sold for ${sellPrice} gold.`;
        setTimeout(() => {
          if(tabContent) {
            tabContent.innerHTML = "";
            renderInventoryTab();
          }
          document.body.removeChild(modal);
        }, 1500);
      }
    });
  });
  footer.appendChild(sellBtn);

  const upgradeBtn = createGamingButton("Upgrade", function(){
    const upgradeCost = 2 * item.power;
    showConfirmModal("Upgrading this item will cost " + upgradeCost + " gold. Do you want to proceed?", function(confirmed) {
      if (!confirmed) return;
      if (window.resources && window.resources.gold < upgradeCost) {
        messageDiv.innerText = `Not enough gold to upgrade. Required: ${upgradeCost} gold.`;
        return;
      }
      let chanceToBreak = 0;
      if(item.upgradeLevel >= 5 && item.upgradeLevel < 9) {
        chanceToBreak = 0.3;
      } else if(item.upgradeLevel >= 9 && item.upgradeLevel < 20) {
        chanceToBreak = 0.5;
      }
      function processUpgrade() {
        window.resources.gold -= upgradeCost;
        if (!item.basePower) {
          item.basePower = item.power;
        }
        item.upgradeLevel += 1;
        item.power = Math.floor(item.basePower * (1 + 0.1 * item.upgradeLevel));
        if(chanceToBreak > 0 && Math.random() < chanceToBreak) {
          messageDiv.innerText = "Upgrade failed! The item broke.";
          const index = playerInventory.findIndex(i => i.name === item.name && i.level === item.level && i.adjective === item.adjective);
          if(index !== -1) {
            playerInventory.splice(index, 1);
            saveData();
            updateInventoryStats();
          }
          setTimeout(() => {
            if(tabContent) {
              tabContent.innerHTML = "";
              renderInventoryTab();
            }
            document.body.removeChild(modal);
          }, 1500);
          return;
        }
        const idx = playerInventory.findIndex(i => i.name === item.name && i.level === item.level && i.adjective === item.adjective);
        if(idx !== -1) {
          playerInventory[idx].upgradeLevel = item.upgradeLevel;
          playerInventory[idx].power = item.power;
          if(!playerInventory[idx].basePower) {
            playerInventory[idx].basePower = item.basePower;
          }
        }
        saveData();
        updateInventoryStats();
        messageDiv.innerText = `Upgraded to +${item.upgradeLevel}. New power: ${item.power}. ${upgradeCost} gold deducted.`;
        const existingLabel = imgContainer.querySelector(".upgrade-visual");
        if(existingLabel) {
          existingLabel.innerText = "+" + item.upgradeLevel;
        } else {
          const upgradeVisual = document.createElement("div");
          upgradeVisual.innerText = "+" + item.upgradeLevel;
          upgradeVisual.className = "upgrade-visual";
          upgradeVisual.style.position = "absolute";
          upgradeVisual.style.top = "5px";
          upgradeVisual.style.left = "5px";
          upgradeVisual.style.background = "#FFD700";
          upgradeVisual.style.color = "#222";
          upgradeVisual.style.padding = "2px 4px";
          upgradeVisual.style.fontSize = "10px";
          upgradeVisual.style.borderRadius = "3px";
          imgContainer.appendChild(upgradeVisual);
        }
        setTimeout(() => {
          if(tabContent) {
            tabContent.innerHTML = "";
            renderInventoryTab();
          }
          document.body.removeChild(modal);
        }, 1500);
      }
      if(chanceToBreak > 0) {
        showConfirmModal("Upgrading now has a " + (chanceToBreak * 100) + "% chance to break the item. Continue?", function(confirmUpgrade) {
          if(confirmUpgrade) {
            processUpgrade();
          }
        });
      } else {
        processUpgrade();
      }
    });
  });
  footer.appendChild(upgradeBtn);

  rightColumn.appendChild(footer);

  // Append left and right columns to the main content
  content.appendChild(leftColumn);
  content.appendChild(rightColumn);

  modal.appendChild(content);
  document.body.appendChild(modal);
}


  // ===========================
  // 6) Weighted Rarity and Custom Item Generation
  // ===========================
  const rarityWeights = [
    { rarity: "Common", weight: 90 },
    { rarity: "Uncommon", weight: 50 },
    { rarity: "Rare", weight: 30 },
    { rarity: "Epic", weight: 10 },
    { rarity: "Legendary", weight: 5 }
  ];
  const totalWeight = rarityWeights.reduce((acc, rw) => acc + rw.weight, 0);

  function chooseRarity() {
    let rnd = Math.floor(Math.random() * totalWeight) + 1;
    let cumulative = 0;
    for (let i = 0; i < rarityWeights.length; i++) {
      cumulative += rarityWeights[i].weight;
      if (rnd <= cumulative) {
        return rarityWeights[i].rarity;
      }
    }
    return "Common";
  }

  function generateCustomItem() {
    let item = window.generateRandomItem();
    const forcedRarity = chooseRarity();
    item.rarity = forcedRarity;

    let baseLevel = Math.floor(Math.random() * 100) + 1;
    switch (forcedRarity) {
      case "Uncommon": baseLevel = Math.max(baseLevel, 20); break;
      case "Rare": baseLevel = Math.max(baseLevel, 40); break;
      case "Epic": baseLevel = Math.max(baseLevel, 60); break;
      case "Legendary": baseLevel = Math.max(baseLevel, 80); break;
      default: break;
    }
    item.level = baseLevel;

    let basePwr = Math.floor(Math.random() * 11) + 5;
    let rarityMult = 1;
    switch (forcedRarity) {
      case "Uncommon": rarityMult = 1.2; break;
      case "Rare": rarityMult = 1.5; break;
      case "Epic": rarityMult = 2; break;
      case "Legendary": rarityMult = 3; break;
      default: rarityMult = 1; break;
    }
    item.power = Math.floor(basePwr * item.level * rarityMult);

    return item;
  }

  // ===========================
  // 7) Save & Update Functions
  // ===========================
  function saveData() {
    localStorage.setItem("playerInventory", JSON.stringify(playerInventory));
    localStorage.setItem("expeditionLoot", JSON.stringify(expeditionLoot));
    updateInventoryStats();
    updateResourceDisplay();
  }

  const statsContainer = document.createElement("div");
  statsContainer.style.display = "flex";
  statsContainer.style.flexDirection = "column";
  statsContainer.style.gap = "5px";
  statsContainer.style.marginBottom = "10px";

  const totalPowerDiv = document.createElement("div");
  totalPowerDiv.id = "totalPowerDiv";
  totalPowerDiv.style.fontFamily = "'Press Start 2P', monospace";
  totalPowerDiv.style.fontSize = "12px";
  totalPowerDiv.style.color = "#FFD700";

  const legendaryDiv = document.createElement("div");
  legendaryDiv.id = "legendaryDiv";
  legendaryDiv.style.fontFamily = "'Press Start 2P', monospace";
  legendaryDiv.style.fontSize = "12px";
  legendaryDiv.style.color = "#FFD700";

  const inventoryCountDiv = document.createElement("div");
  inventoryCountDiv.id = "inventoryCountDiv";
  inventoryCountDiv.style.fontFamily = "'Press Start 2P', monospace";
  inventoryCountDiv.style.fontSize = "12px";
  inventoryCountDiv.style.color = "#FFD700";

  statsContainer.appendChild(totalPowerDiv);
  statsContainer.appendChild(legendaryDiv);
  statsContainer.appendChild(inventoryCountDiv);

  function updateInventoryStats() {
    let totalPower = 0;
    let legendaryCount = 0;
    playerInventory.forEach(itemData => {
      totalPower += itemData.power;
      if (itemData.rarity === "Legendary") legendaryCount++;
    });
    totalPowerDiv.innerText = `Kingdom Power: ${totalPower}`;
    legendaryDiv.innerText = `Legendary: ${legendaryCount}`;
    inventoryCountDiv.innerText = `Inventory: ${playerInventory.length}/${MAX_INVENTORY}`;
    if (legendaryCount > 0) {
      legendaryDiv.style.animation = "blinkGold 1s infinite";
    } else {
      legendaryDiv.style.animation = "";
    }
    
    if (playerInventory.length >= 190) {
      if (!document.getElementById("inventoryReminderAlert")) {
        const reminder = document.createElement("div");
        reminder.id = "inventoryReminderAlert";
        reminder.style.position = "fixed";
        reminder.style.top = "20px";
        reminder.style.left = "50%";
        reminder.style.transform = "translateX(-50%)";
        reminder.style.background = "#222";
        reminder.style.border = "2px solid #FFD700";
        reminder.style.padding = "10px";
        reminder.style.fontFamily = "'Press Start 2P', monospace";
        reminder.style.fontSize = "12px";
        reminder.style.color = "#FFD700";
        reminder.style.zIndex = "1001";
        reminder.innerText = "Warning: Your inventory is nearly full! (" + playerInventory.length + "/200) Consider selling or using items.";
        document.body.appendChild(reminder);
        setTimeout(() => {
          if (reminder.parentNode) {
            reminder.parentNode.removeChild(reminder);
          }
        }, 3000);
      }
    }
  }
  
  function updateResourceDisplay() {
    console.log("Resources updated:", resources);
  }
  updateResourceDisplay();

  // ===========================
  // 8) Build the Right Menu
  // ===========================
  const rightMenuContainer = document.createElement("div");
  rightMenuContainer.id = "rightMenu";
  rightMenuContainer.style.position = "fixed";
  rightMenuContainer.style.top = "180px";
  rightMenuContainer.style.right = "30px";
  rightMenuContainer.style.width = "480px";
  rightMenuContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
  rightMenuContainer.style.borderLeft = "2px solid #FFD700";
  rightMenuContainer.style.padding = "20px";
  rightMenuContainer.style.zIndex = "200";
  rightMenuContainer.style.color = "#FFD700";
  rightMenuContainer.style.display = "block";
  document.body.appendChild(rightMenuContainer);

  rightMenuContainer.appendChild(statsContainer);

  const tabButtonsContainer = document.createElement("div");
  tabButtonsContainer.style.display = "block";
  tabButtonsContainer.style.marginBottom = "10px";
  rightMenuContainer.appendChild(tabButtonsContainer);

  const expeditionTabBtn = createGamingButton("Expedition", function() {
    showExpeditionPopup();
  });
  tabButtonsContainer.appendChild(expeditionTabBtn);

  const inventoryTabBtn = createGamingButton("Inventory", function() {
    tabContent.innerHTML = "";
    renderInventoryTab();
  });
  tabButtonsContainer.appendChild(inventoryTabBtn);

  const tabContent = document.createElement("div");
  tabContent.id = "rightMenuContent";
  tabContent.style.maxHeight = "400px";
  tabContent.style.overflowY = "auto";
  rightMenuContainer.appendChild(tabContent);

  // ===========================
  // 9) Expedition Overlay
  // ===========================
  const expeditionOverlay = document.createElement("div");
  expeditionOverlay.id = "expeditionOverlay";
  expeditionOverlay.style.display = "none";
  expeditionOverlay.style.alignItems = "center";
  expeditionOverlay.style.justifyContent = "center";
  document.body.appendChild(expeditionOverlay);

  const expeditionPopup = document.createElement("div");
  expeditionPopup.id = "expeditionPopup";
  expeditionPopup.style.position = "relative";
  expeditionOverlay.appendChild(expeditionPopup);

  function showExpeditionPopup() {
    expeditionPopup.innerHTML = "";
    const expCloseBtn = document.createElement("button");
    expCloseBtn.innerText = "X";
    expCloseBtn.style.position = "absolute";
    expCloseBtn.style.top = "5px";
    expCloseBtn.style.right = "5px";
    expCloseBtn.style.fontFamily = "'Press Start 2P', monospace";
    expCloseBtn.style.fontSize = "14px";
    expCloseBtn.style.background = "#FFD700";
    expCloseBtn.style.color = "#222";
    expCloseBtn.style.border = "none";
    expCloseBtn.style.cursor = "pointer";
    expCloseBtn.style.padding = "2px 6px";
    expCloseBtn.style.borderRadius = "4px";
    expCloseBtn.addEventListener("click", function() {
      expeditionOverlay.style.display = "none";
    });
    expeditionPopup.appendChild(expCloseBtn);

    const title = document.createElement("h3");
    title.innerText = "Choose Expedition Type";
    expeditionPopup.appendChild(title);

    const info = document.createElement("p");
    info.innerHTML = `
      <strong>Normal</strong>: <br>(1–2 loots, ~5mins)<br>
      <strong>Hardcore</strong>: <br>(2–3 loots, ~1hr)<br>
      <strong>Suicidal</strong>: <br>(3–10 loots, ~24hr)<br>
      <br>
      <em>Drop Rates:</em><br>
      Common(90%)<br> Uncommon(50%)<br> Rare(30%)<br> Epic(10%)<br> Legendary(5%)
    `;
    expeditionPopup.appendChild(info);

    const btnStyle = {
      fontSize: "16px",
      padding: "10px 20px"
    };

    const normalBtn = document.createElement("button");
    normalBtn.innerText = "Normal";
    normalBtn.style.fontSize = btnStyle.fontSize;
    normalBtn.style.padding = btnStyle.padding;
    normalBtn.addEventListener("click", function() {
      startExpedition("Normal", { duration: 360, lootMin: 1, lootMax: 2 });
    });
    expeditionPopup.appendChild(normalBtn);

    const hardcoreBtn = document.createElement("button");
    hardcoreBtn.innerText = "Hardcore";
    hardcoreBtn.style.fontSize = btnStyle.fontSize;
    hardcoreBtn.style.padding = btnStyle.padding;
    hardcoreBtn.addEventListener("click", function() {
      startExpedition("Hardcore", { duration: 3600, lootMin: 2, lootMax: 3 });
    });
    expeditionPopup.appendChild(hardcoreBtn);

    const suicidalBtn = document.createElement("button");
    suicidalBtn.innerText = "Suicidal";
    suicidalBtn.style.fontSize = btnStyle.fontSize;
    suicidalBtn.style.padding = btnStyle.padding;
    suicidalBtn.addEventListener("click", function() {
      startExpedition("Suicidal", { duration: 21600, lootMin: 3, lootMax: 10 });
    });
    expeditionPopup.appendChild(suicidalBtn);

    if (expeditionLoot.length > 0) {
      const keepAllBtn = document.createElement("button");
      keepAllBtn.innerText = "Keep All Loot";
      keepAllBtn.addEventListener("click", function() {
        keepAllLoot();
      });
      expeditionPopup.appendChild(keepAllBtn);
    }
    expeditionOverlay.style.display = "flex";
  }

  // ===========================
  // 10) Loot Overlay (for success)
  // ===========================
  const expeditionLootOverlay = document.createElement("div");
  expeditionLootOverlay.id = "expeditionLootOverlay";
  expeditionLootOverlay.style.display = "none";
  expeditionLootOverlay.style.alignItems = "center";
  expeditionLootOverlay.style.justifyContent = "center";
  document.body.appendChild(expeditionLootOverlay);

  const expeditionLootPopup = document.createElement("div");
  expeditionLootPopup.id = "expeditionLootPopup";
  expeditionLootOverlay.appendChild(expeditionLootPopup);

  const closeLootBtn = document.createElement("button");
  closeLootBtn.innerText = "Close";
  closeLootBtn.addEventListener("click", function() {
    expeditionLootOverlay.style.display = "none";
  });

  function showExpeditionLootOverlay(newLoot) {
    expeditionLootPopup.innerHTML = "";

    const title = document.createElement("h3");
    title.innerText = `Expedition Succeeded! Found ${newLoot.length} item(s).`;
    expeditionLootPopup.appendChild(title);

    const lootContainer = document.createElement("div");
    lootContainer.className = "loot-items";
    expeditionLootPopup.appendChild(lootContainer);

    newLoot.forEach(itemData => {
      const itemObj = rehydrateItem(itemData);
      lootContainer.appendChild(itemObj.render());
    });

    const keepAllBtn = document.createElement("button");
    keepAllBtn.innerText = "Keep All";
    keepAllBtn.addEventListener("click", function() {
      expeditionLoot.forEach(item => {
        if(playerInventory.length < MAX_INVENTORY) {
          playerInventory.push(item);
        }
      });
      expeditionLoot = [];
      saveData();
      expeditionLootOverlay.style.display = "none";
    });
    expeditionLootPopup.appendChild(keepAllBtn);

    expeditionLootPopup.appendChild(closeLootBtn);
    expeditionLootOverlay.style.display = "flex";
  }

  // Simple fail overlay
  function showFailOverlay(modeName) {
    const overlayId = "expeditionFailOverlay";
    let failOverlay = document.getElementById(overlayId);
    if (!failOverlay) {
      failOverlay = document.createElement("div");
      failOverlay.id = overlayId;
      failOverlay.style.position = "fixed";
      failOverlay.style.top = "0";
      failOverlay.style.left = "0";
      failOverlay.style.width = "100%";
      failOverlay.style.height = "100%";
      failOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      failOverlay.style.display = "flex";
      failOverlay.style.alignItems = "center";
      failOverlay.style.justifyContent = "center";
      failOverlay.style.zIndex = "3500";
      document.body.appendChild(failOverlay);
    }
    failOverlay.innerHTML = "";

    const failBox = document.createElement("div");
    failBox.style.backgroundColor = "#222";
    failBox.style.border = "2px solid #FFD700";
    failBox.style.color = "#FFD700";
    failBox.style.padding = "20px";
    failBox.style.fontFamily = "'Press Start 2P', monospace";
    failBox.style.fontSize = "12px";
    failBox.style.textAlign = "center";
    failBox.style.boxShadow = "4px 4px 0 #000";
    failOverlay.appendChild(failBox);

    const msg = document.createElement("p");
    msg.innerText = `Expedition (${modeName}) failed. Better luck next time!`;
    failBox.appendChild(msg);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    styleButton(closeBtn);
    closeBtn.addEventListener("click", function() {
      failOverlay.style.display = "flex";
    });
    failBox.appendChild(closeBtn);

    failOverlay.style.display = "flex";
  }

  // ===========================
  // 11) Tab click events and Inventory Tab
  // ===========================
  expeditionTabBtn.addEventListener("click", function() {
    showExpeditionPopup();
  });
  inventoryTabBtn.addEventListener("click", function() {
    inventoryVisible = !inventoryVisible;
    if (inventoryVisible) {
      renderInventoryTab();
    } else {
      tabContent.innerHTML = "";
    }
  });
  
  let inventoryVisible = false;

  function renderInventoryTab() {
    const heading = document.createElement("h3");
    heading.innerText = "Player Inventory";
    heading.style.fontFamily = "'Press Start 2P', monospace";
    heading.style.fontSize = "12px";
    heading.style.marginBottom = "10px";
    tabContent.innerHTML = "";
    tabContent.appendChild(heading);

    // Group items by itemType.
    const groups = {};
    playerInventory.forEach(itemData => {
      const type = itemData.itemType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(itemData);
    });
    // Rarity order.
    const rarityOrder = { "Legendary": 0, "Epic": 1, "Rare": 2, "Uncommon": 3, "Common": 4 };

    for (const type in groups) {
      const typeHeader = document.createElement("h4");
      typeHeader.innerText = type;
      typeHeader.style.margin = "10px 0 5px 0";
      tabContent.appendChild(typeHeader);

      groups[type].sort((a, b) => {
        if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        }
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.power - a.power;
      });
      const groupContainer = document.createElement("div");
      groupContainer.style.display = "flex";
      groupContainer.style.flexWrap = "wrap";
      groupContainer.style.marginBottom = "10px";
      groups[type].forEach(itemData => {
        const item = rehydrateItem(itemData);
        groupContainer.appendChild(item.render());
      });
      tabContent.appendChild(groupContainer);
    }
  }

  function keepAllLoot() {
    expeditionLoot.forEach(item => {
      if (playerInventory.length < MAX_INVENTORY) {
        playerInventory.push(item);
      }
    });
    expeditionLoot = [];
    saveData();
  }

  // ===========================
  // 12) Expedition logic
  // ===========================
  let currentExpedition = JSON.parse(localStorage.getItem("currentExpedition") || "null");

  function startExpedition(modeName, mode) {
    currentExpedition = {
      modeName: modeName,
      mode: mode,
      startTime: Date.now()
    };
    localStorage.setItem("currentExpedition", JSON.stringify(currentExpedition));
    expeditionOverlay.style.display = "none";
    resumeExpedition();
  }

  function resumeExpedition() {
    currentExpedition = JSON.parse(localStorage.getItem("currentExpedition") || "null");
    if (!currentExpedition) return;

    const duration = currentExpedition.mode.duration;
    let elapsed = (Date.now() - currentExpedition.startTime) / 1000;
    let remaining = duration - elapsed;

    if (remaining <= 0) {
      finishExpedition(currentExpedition);
      return;
    }
    let timerOverlay = document.getElementById("expeditionTimerOverlay");
    if (!timerOverlay) {
      timerOverlay = document.createElement("div");
      timerOverlay.id = "expeditionTimerOverlay";
      timerOverlay.style.position = "fixed";
      timerOverlay.style.top = "0";
      timerOverlay.style.left = "0";
      timerOverlay.style.width = "100%";
      timerOverlay.style.height = "100%";
      timerOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      timerOverlay.style.display = "flex";
      timerOverlay.style.flexDirection = "column";
      timerOverlay.style.alignItems = "center";
      timerOverlay.style.justifyContent = "center";
      timerOverlay.style.zIndex = "1500";
      document.body.appendChild(timerOverlay);
    }

    let timerBox = document.getElementById("expeditionTimerBox");
    if (!timerBox) {
      timerBox = document.createElement("div");
      timerBox.id = "expeditionTimerBox";
      timerBox.style.backgroundColor = "#222";
      timerBox.style.border = "2px solid #FFD700";
      timerBox.style.padding = "20px";
      timerBox.style.fontFamily = "'Press Start 2P', monospace";
      timerBox.style.fontSize = "16px";
      timerBox.style.color = "#FFD700";
      timerBox.style.textAlign = "center";
      timerOverlay.appendChild(timerBox);

      const cancelExpeditionBtn = document.createElement("button");
      cancelExpeditionBtn.innerText = "Cancel Expedition";
      styleButton(cancelExpeditionBtn);
      cancelExpeditionBtn.style.marginTop = "10px";
      cancelExpeditionBtn.addEventListener("click", function() {
        cancelExpedition();
      });
      timerOverlay.appendChild(cancelExpeditionBtn);
    }

    timerBox.innerText = `Expedition in progress...\n${currentExpedition.modeName} Mode\nTime remaining: ${Math.ceil(remaining)} sec`;

    if (window.expeditionIntervalId) clearInterval(window.expeditionIntervalId);
    window.expeditionIntervalId = setInterval(() => {
      currentExpedition = JSON.parse(localStorage.getItem("currentExpedition") || "null");
      if (!currentExpedition) {
        clearInterval(window.expeditionIntervalId);
        if (timerOverlay) timerOverlay.remove();
        return;
      }
      let nowElapsed = (Date.now() - currentExpedition.startTime) / 1000;
      let remain = duration - nowElapsed;
      if (remain <= 0) {
        clearInterval(window.expeditionIntervalId);
        timerOverlay.remove();
        finishExpedition(currentExpedition);
      } else {
        timerBox.innerText = `Expedition in progress...\n${currentExpedition.modeName} Mode\nTime remaining: ${Math.ceil(remain)} sec`;
      }
    }, 1000);
  }

  function finishExpedition(expeditionState) {
    localStorage.removeItem("currentExpedition");
    currentExpedition = null;
    let modeName = expeditionState.modeName;
    let mode = expeditionState.mode;

    const success = true;
    if (success) {
      let count = Math.floor(Math.random() * (mode.lootMax - mode.lootMin + 1)) + mode.lootMin;
      let newLoot = [];
      for (let i = 0; i < count; i++) {
        let customItem = generateCustomItem();
        newLoot.push(customItem);
      }
      newLoot.forEach(item => {
        expeditionLoot.push(item);
      });
      saveData();
      showExpeditionLootOverlay(newLoot);
    } else {
      showFailOverlay(modeName);
    }
  }

  function cancelExpedition() {
    localStorage.removeItem("currentExpedition");
    currentExpedition = null;
    if (window.expeditionIntervalId) {
      clearInterval(window.expeditionIntervalId);
    }
    const timerOverlay = document.getElementById("expeditionTimerOverlay");
    if (timerOverlay) timerOverlay.remove();
    showPopupAlert("Expedition canceled.");
  }

  // ===========================
  // 13) Initialization on load
  // ===========================
  updateInventoryStats();
  resumeExpedition();
  window.playerInventory = playerInventory;

  console.log("expedition.js loaded");
})();
// Function to create the mobile hamburger toggle for the right menu container
function createRightMenuToggle() {
  let toggle = document.getElementById("rightMenuToggle");
  
  if (window.innerWidth <= 768) {
    // If we're on mobile and the toggle doesn't exist, create it.
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.id = "rightMenuToggle";
      toggle.innerHTML = "☰"; // Hamburger icon
      
      document.body.appendChild(toggle);
      
      toggle.addEventListener("click", function() {
        const menu = document.getElementById("rightMenuContainer");
        if (menu) {
          menu.classList.toggle("active");
        }
      });
    }
  } else {
    // On desktop, remove the toggle if it exists.
    if (toggle) {
      toggle.remove();
    }
    // Ensure the right menu container is fully visible on desktop.
    const menu = document.getElementById("rightMenuContainer");
    if (menu) {
      menu.style.transform = "none";
      menu.classList.remove("active");
    }
  }
}

// Call the function once on load.
createRightMenuToggle();

// Update on window resize.
window.addEventListener("resize", createRightMenuToggle);
