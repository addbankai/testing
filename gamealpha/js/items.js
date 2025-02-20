// items.js

(function() {

  // -----------------------------
  // Helper function: Return a random element from an array.
  // -----------------------------
  function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // =======================
  // ITEM PROPERTIES
  // =======================
  const itemTypes = [
    "Sword", "Shield", "Armor", "Ring", "Amulet",
    "Potion", "Scroll", "Boots", "Helmet", "Gloves",
    "Bow", "Staff", "Katana", "Dagger", "Knuckles", "TreasureBox"
  ];

  const itemImages = {
    "Sword": "img/armory/sword1.png",
    "Shield": "img/armory/shield1.png",
    "Armor": "img/armory/armor1.png",
    "Ring": "img/armory/ring1.png",
    "Amulet": "img/armory/amulet1.png",
    "Potion": "img/armory/potion1.png",
    "Scroll": "img/armory/scroll1.png",
    "Boots": "img/armory/boots1.png",
    "Helmet": "img/armory/helmet1.png",
    "Gloves": "img/armory/glove4.png",
    "Bow": "img/armory/bow1.png",
    "Staff": "img/armory/staff1.png",
    "Katana": "img/armory/katana1.png",
    "Dagger": "img/armory/dagger1.png",
    "Knuckles": "img/armory/knuckles1.png",
    "TreasureBox": "img/armory/treasurebox1.png"
  };

  const materials = ["Iron", "Steel", "Wood", "Obsidian", "Crystal", "Gold", "Silver", "Bronze", "Emerald", "Sapphire"];
  const materialColors = {
    "Iron": "#4B4B4B",
    "Steel": "#6A6A6A",
    "Wood": "#8B4513",
    "Obsidian": "#2E2B2B",
    "Crystal": "#A8DADC",
    "Gold": "#FFD700",
    "Silver": "#C0C0C0",
    "Bronze": "#CD7F32",
    "Emerald": "#50C878",
    "Sapphire": "#0F52BA"
  };

  const adjectives = ["Ancient", "Mystic", "Cursed", "Divine", "Glorious", "Enchanted", "Forgotten", "Fabled", "Ethereal", "Shadow"];
  const adjectiveGlow = {
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

  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
  const rarityColors = {
    "Common": "#B0B0B0",
    "Uncommon": "#3CB371",
    "Rare": "#1E90FF",
    "Epic": "#8A2BE2",
    "Legendary": "#FF4500"
  };

  // =======================
  // ITEM GENERATION
  // =======================
  function generateRandomItem() {
    const adjective = randomElement(adjectives);
    const material = randomElement(materials);
    const itemType = randomElement(itemTypes);
    const rarity = randomElement(rarities);
    const image = itemImages[itemType] || "";
    
    // Determine the item's level.
    let level = Math.floor(Math.random() * 100) + 1;
    if (rarity === "Epic" || rarity === "Legendary") {
      level = Math.floor(Math.random() * 50) + 51;
    }
    
    // Define a rarity multiplier.
    let rarityMultiplier = 1;
    switch(rarity) {
      case "Uncommon": rarityMultiplier = 1.2; break;
      case "Rare": rarityMultiplier = 1.5; break;
      case "Epic": rarityMultiplier = 2; break;
      case "Legendary": rarityMultiplier = 3; break;
      default: rarityMultiplier = 1; break;
    }
    
    let power;
    let stats;
    
    if (itemType === "Scroll") {
      // Scroll items: stats range 1-20.
      stats = {
        str: Math.floor(Math.random() * 20) + 1,
        agi: Math.floor(Math.random() * 20) + 1,
        vit: Math.floor(Math.random() * 20) + 1,
        int: Math.floor(Math.random() * 20) + 1,
        dex: Math.floor(Math.random() * 20) + 1,
        luk: Math.floor(Math.random() * 20) + 1
      };
      power = Math.floor((stats.str + stats.agi + stats.vit + stats.int + stats.dex + stats.luk) * rarityMultiplier);
    } else if (itemType === "TreasureBox") {
      // For TreasureBox, remove stats (and power remains 0).
      stats = undefined;
      power = 0;
    } else {
      // All other items: stats range 1-5.
      stats = {
        str: Math.floor(Math.random() * 5) + 1,
        agi: Math.floor(Math.random() * 5) + 1,
        vit: Math.floor(Math.random() * 5) + 1,
        int: Math.floor(Math.random() * 5) + 1,
        dex: Math.floor(Math.random() * 5) + 1,
        luk: Math.floor(Math.random() * 5) + 1
      };
      const basePower = Math.floor(Math.random() * 11) + 5;
      const computedBasePower = Math.floor(basePower * level * rarityMultiplier);
      const bonus = stats.str * 5 + stats.agi * 5 + stats.vit * 3 +
                    stats.int * 5 + stats.dex * 5 + stats.luk * 3;
      power = computedBasePower + bonus;
    }
    
    const name = `${adjective} ${material} ${itemType}`;
    
    return {
      name: name,
      adjective: adjective,
      material: material,
      itemType: itemType,
      rarity: rarity,
      level: level,
      image: image,
      upgradeLevel: 0,
      craftedStatus: null,
      // Only assign stats if not a TreasureBox.
      stats: (itemType !== "TreasureBox") ? stats : undefined,
      // Only include power for non-TreasureBox items.
      power: (itemType !== "TreasureBox") ? power : undefined,
      render: function() {
        const itemDiv = document.createElement("div");
        itemDiv.style.position = "relative";
        itemDiv.style.width = "80px";
        itemDiv.style.height = "80px";
        itemDiv.style.margin = "5px";
        itemDiv.style.border = "1px solid #DDD";
        itemDiv.style.backgroundImage = `url('${this.image || "https://via.placeholder.com/80"}')`;
        itemDiv.style.backgroundSize = "cover";
        itemDiv.style.backgroundRepeat = "no-repeat";
        itemDiv.style.backgroundPosition = "center";
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = materialColors[this.material] || "transparent";
        overlay.style.opacity = "0.1";
        itemDiv.appendChild(overlay);
        const title = document.createElement("div");
        title.innerText = this.name;
        title.style.position = "absolute";
        title.style.bottom = "0";
        title.style.left = "0";
        title.style.right = "0";
        title.style.fontSize = "8px";
        title.style.textAlign = "center";
        title.style.backgroundColor = "rgba(0,0,0,0.5)";
        title.style.color = rarityColors[this.rarity] || "#FFF";
        title.style.padding = "2px 0";
        title.style.textShadow = "0 0 5px " + (adjectiveGlow[this.adjective] || "#FFD700");
        itemDiv.appendChild(title);
        return itemDiv;
      },
      getDescription: function() {
        let desc = `A ${this.rarity} item: ${this.name} (Level ${this.level}`;
        if (this.itemType !== "TreasureBox") {
          desc += `, Power ${this.power}, Upgrade +${this.upgradeLevel}`;
        }
        desc += ")\n";
        if (this.stats) {
          desc += `Stats: STR ${this.stats.str}, AGI ${this.stats.agi}, VIT ${this.stats.vit}, INT ${this.stats.int}, DEX ${this.stats.dex}, LUK ${this.stats.luk}`;
        }
        return desc;
      }
    };
  }
  
  function sortItems(inventory) {
    const order = { "Legendary": 0, "Epic": 1, "Rare": 2, "Uncommon": 3, "Common": 4 };
    return inventory.sort((a, b) => order[a.rarity] - order[b.rarity]);
  }
  
  function Expedition(numItems) {
    numItems = numItems || Math.floor(Math.random() * 5) + 1;
    const loot = [];
    for (let i = 0; i < numItems; i++) {
      loot.push(generateRandomItem());
    }
    return loot;
  }
  
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      generateRandomItem: generateRandomItem,
      sortItems: sortItems,
      Expedition: Expedition
    };
  } else {
    window.generateRandomItem = generateRandomItem;
    window.sortItems = sortItems;
    window.Expedition = Expedition;
  }
})();
