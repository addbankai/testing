(function(){
    // Define hero slot configuration.
    const heroSlots = [
        { slotName: "Weapon", allowedTypes: ["Sword", "Bow", "Staff", "Katana", "Dagger", "Knuckles"] },
        { slotName: "Helmet", allowedTypes: ["Helmet"] },
        { slotName: "Gloves", allowedTypes: ["Gloves"] },
        { slotName: "Ring", allowedTypes: ["Ring"] },
        { slotName: "Armor", allowedTypes: ["Armor"] },
        { slotName: "Shield", allowedTypes: ["Shield"] },
        { slotName: "Utility", allowedTypes: ["Amulet", "Potion"] },
        { slotName: "Potion", allowedTypes: ["Potion"] }
    ];

    // Insert custom CSS for scrollbars and additional styles.
    const styleElem = document.createElement("style");
    styleElem.innerHTML = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #222;
      border: 2px solid #FFD700;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #555;
      border: 2px solid #FFD700;
      border-radius: 5px;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #555 #222;
    }
    .locked-status {
      border-top: 2px solid #FFD700;
      margin-top: 20px;
      padding-top: 10px;
      text-align: center;
      font-size: 36px;
      color: #FFD700;
      filter: blur(2px);
    }
    .modal-title {
      font-family: 'Press Start 2P', monospace;
      font-size: 16px;
      border: 2px solid #FFD700;
      padding: 10px;
      margin-bottom: 10px;
      color: #FFD700;
      text-align: center;
    }
    `;
    document.head.appendChild(styleElem);

    // Load hero equipment from localStorage if it exists; otherwise, create 8 empty slots.
    let savedEquip = localStorage.getItem("heroEquipment");
    const hero = {
        equipment: savedEquip ? JSON.parse(savedEquip) : new Array(8).fill(null),
        // Hero stats:
        level: 1,
        exp: 0,
        wins: 0,
        losses: 0,
        getTotalPower: function(){
            return this.equipment.reduce((sum, item) => item ? sum + item.power : sum, 0);
        }
    };

    // Load hero stats if saved.
    let savedStats = localStorage.getItem("heroStats");
    if(savedStats) {
        const stats = JSON.parse(savedStats);
        hero.level = stats.level;
        hero.exp = stats.exp;
        hero.wins = stats.wins;
        hero.losses = stats.losses;
    }

    function saveHeroEquipment(){
        localStorage.setItem("heroEquipment", JSON.stringify(hero.equipment));
    }
    function saveHeroStats(){
        localStorage.setItem("heroStats", JSON.stringify({
            level: hero.level,
            exp: hero.exp,
            wins: hero.wins,
            losses: hero.losses
        }));
    }

    // Ensure global inventory exists.
    if (!window.playerInventory) {
      window.playerInventory = JSON.parse(localStorage.getItem("playerInventory") || "[]");
    }
    console.log("Loaded inventory:", window.playerInventory);

    // Helper: Create a styled gaming button.
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

    // Custom modal alert function.
    function showModalAlert(message) {
        const alertModal = document.createElement("div");
        alertModal.style.position = "fixed";
        alertModal.style.top = "0";
        alertModal.style.left = "0";
        alertModal.style.width = "100%";
        alertModal.style.height = "100%";
        alertModal.style.backgroundColor = "rgba(0,0,0,0.7)";
        alertModal.style.display = "flex";
        alertModal.style.alignItems = "center";
        alertModal.style.justifyContent = "center";
        alertModal.style.zIndex = "4000";

        const alertContent = document.createElement("div");
        alertContent.style.background = "#222";
        alertContent.style.border = "2px solid #FFD700";
        alertContent.style.padding = "20px";
        alertContent.style.fontFamily = "'Press Start 2P', monospace";
        alertContent.style.fontSize = "12px";
        alertContent.style.textAlign = "center";
        alertContent.innerText = message;
        
        const closeBtn = createGamingButton("OK", function() {
            document.body.removeChild(alertModal);
        });
        alertContent.appendChild(closeBtn);
        alertModal.appendChild(alertContent);
        document.body.appendChild(alertModal);
    }

    // Show a modal for selecting an item from the inventory.
    // In this selection modal, full item info is shown.
    function showInventorySelection(parentModal, slotIndex, callback){
        const invModal = document.createElement('div');
        invModal.style.position = 'fixed';
        invModal.style.top = '0';
        invModal.style.left = '0';
        invModal.style.width = '100%';
        invModal.style.height = '100%';
        invModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        invModal.style.display = 'flex';
        invModal.style.alignItems = 'center';
        invModal.style.justifyContent = 'center';
        invModal.style.zIndex = '3000';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content custom-scrollbar';
        modalContent.style.background = '#222';
        modalContent.style.border = '2px solid #FFD700';
        modalContent.style.padding = '20px';
        modalContent.style.fontFamily = "'Press Start 2P', monospace";
        modalContent.style.fontSize = '10px';
        modalContent.style.textAlign = 'center';
        modalContent.style.width = '98%';
        modalContent.style.maxWidth = '1000px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        invModal.appendChild(modalContent);

        const title = document.createElement('h3');
        title.innerText = "Select an Item to Equip";
        modalContent.appendChild(title);

        // Define rarityColors (or use window.rarityColors if available)
        const rarityColors = window.rarityColors || {
            "Common": "#B0B0B0",
            "Uncommon": "#3CB371",
            "Rare": "#1E90FF",
            "Epic": "#8A2BE2",
            "Legendary": "#FF4500"
        };

        // Filter inventory: show only items that match allowed types for this slot.
        const allowed = heroSlots[slotIndex].allowedTypes;
        let filteredInventory = window.playerInventory.slice().filter(item => allowed.indexOf(item.itemType) !== -1);

        // Then sort:
        // 1. Equipable items (within ±20 of hero.level) first, then by descending power.
        let sortedInventory = filteredInventory.sort((a, b) => {
            let aEquipable = (a.level >= hero.level - 20 && a.level <= hero.level + 20) ? 1 : 0;
            let bEquipable = (b.level >= hero.level - 20 && b.level <= hero.level + 20) ? 1 : 0;
            if(aEquipable !== bEquipable){
                return bEquipable - aEquipable;
            }
            return b.power - a.power;
        });

        const itemsContainer = document.createElement('div');
        itemsContainer.style.display = 'grid';
        itemsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        itemsContainer.style.gap = '10px';
        if(sortedInventory.length > 40){
            itemsContainer.style.maxHeight = '300px';
            itemsContainer.style.overflowY = 'auto';
            itemsContainer.classList.add('custom-scrollbar');
        }

        if(sortedInventory.length === 0){
            const noItemMsg = document.createElement('p');
            noItemMsg.innerText = "No available items in inventory for this slot.";
            modalContent.appendChild(noItemMsg);
        } else {
            sortedInventory.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.border = '2px solid #FFD700';
                itemDiv.style.padding = '10px';
                itemDiv.style.textAlign = 'center';
                itemDiv.style.cursor = 'pointer';
                // Full details for item selection:
                itemDiv.innerHTML = `<img src="${item.image}" style="width:60px;height:60px;"><br>
                ${item.name}<br>
                <span style="color:${rarityColors[item.rarity] || "#FFF"}; font-weight:bold;">${item.rarity}</span><br>
                Effect: ${item.adjective}<br>
                Power: ${item.power}<br>
                (Lvl: ${item.level})`;
                itemDiv.addEventListener('click', function(){
                    if(item.level < hero.level - 20 || item.level > hero.level + 20){
                        showModalAlert("This item's level is not within ±20 of your hero level.");
                        return;
                    }
                    hero.equipment[slotIndex] = item;
                    let origIndex = window.playerInventory.findIndex(it => it.name === item.name && it.power === item.power && it.level === item.level);
                    if(origIndex !== -1) {
                        window.playerInventory.splice(origIndex, 1);
                    }
                    saveHeroEquipment();
                    document.body.removeChild(invModal);
                    if(callback) callback();
                });
                itemsContainer.appendChild(itemDiv);
            });
            modalContent.appendChild(itemsContainer);
        }

        const closeSelBtn = createGamingButton("Cancel", function(){
            document.body.removeChild(invModal);
        });
        modalContent.appendChild(closeSelBtn);
        document.body.appendChild(invModal);
    }

    // Create and show the hero equipment modal with a 80% scale.
    function showHeroEquipModal() {
        // Create modal overlay
        const modalOverlay = document.createElement("div");
        modalOverlay.style.position = "fixed";
        modalOverlay.style.top = "0";
        modalOverlay.style.left = "0";
        modalOverlay.style.width = "100%";
        modalOverlay.style.height = "100%";
        modalOverlay.style.backgroundColor = "rgba(0,0,0,0.7)";
        modalOverlay.style.display = "flex";
        modalOverlay.style.alignItems = "center";
        modalOverlay.style.justifyContent = "center";
        modalOverlay.style.zIndex = "2000";

        // Modal content container with fixed dimensions
        const content = document.createElement("div");
        content.className = "modal-content custom-scrollbar";
        content.style.position = "relative";
        content.style.background = "#222";
        content.style.border = "2px solid #FFD700";
        content.style.fontFamily = "'Press Start 2P', monospace";
        content.style.fontSize = "12px";
        content.style.width = "550px";
        content.style.height = "900px";
        content.style.overflow = "auto";  // allow scrolling if needed
        content.style.borderRadius = "8px";
        content.style.textAlign = "center";
        // Use flex layout to stack the title, equipment, and info in a column
        content.style.display = "flex";
        content.style.flexDirection = "column";
        // **Scale everything** to 80%
        content.style.transform = "scale(0.8)";
        content.style.transformOrigin = "center top";

        // Header Title with Border
        const headerTitle = document.createElement("div");
        headerTitle.className = "modal-title";
        headerTitle.innerText = "Character Equipment Info";
        headerTitle.style.margin = "10px";
        content.appendChild(headerTitle);

        // Close button in upper-right
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "X";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        closeBtn.style.fontFamily = "'Press Start 2P', monospace";
        closeBtn.style.fontSize = "16px";
        closeBtn.style.background = "#FFD700";
        closeBtn.style.color = "#222";
        closeBtn.style.border = "none";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.padding = "5px 10px";
        closeBtn.style.borderRadius = "4px";
        closeBtn.addEventListener("click", function() {
            document.body.removeChild(modalOverlay);
        });
        content.appendChild(closeBtn);

        // Equipment container wrapper (flex: 1) to fill the vertical space
        const equipmentWrapper = document.createElement("div");
        equipmentWrapper.style.flex = "1";
        equipmentWrapper.style.display = "flex";
        equipmentWrapper.style.alignItems = "center";
        equipmentWrapper.style.justifyContent = "center";
        equipmentWrapper.style.padding = "10px";

        // The actual container for left/middle/right columns
        const equipmentContainer = document.createElement("div");
        equipmentContainer.style.display = "flex";
        equipmentContainer.style.justifyContent = "center";
        equipmentContainer.style.alignItems = "center";
        equipmentContainer.style.height = "100%";

        // Left Column
        const leftColumn = document.createElement("div");
        leftColumn.style.width = "150px";
        leftColumn.style.display = "flex";
        leftColumn.style.flexDirection = "column";
        leftColumn.style.justifyContent = "space-around";
        leftColumn.style.alignItems = "center";
        for (let i = 0; i < 4; i++){
            const slotDiv = document.createElement("div");
            slotDiv.style.width = "150px";
            slotDiv.style.height = "150px";
            slotDiv.style.border = "2px solid #FFD700";
            slotDiv.style.textAlign = "center";
            slotDiv.dataset.slot = i;
            const slotName = document.createElement("div");
            slotName.style.fontWeight = "bold";
            slotName.style.marginBottom = "2px";
            slotName.style.fontSize = "10px";
            slotName.innerText = heroSlots[i].slotName;
            slotDiv.appendChild(slotName);
            
            if(hero.equipment[i]){
                const item = hero.equipment[i];
                const itemDiv = document.createElement("div");
                itemDiv.style.width = "80px";
                itemDiv.style.height = "80px";
                itemDiv.style.margin = "auto";
                itemDiv.style.backgroundImage = `url('${item.image}')`;
                itemDiv.style.backgroundSize = "cover";
                itemDiv.style.border = "none";
                if(window.adjectiveGlow && window.adjectiveGlow[item.adjective]){
                    itemDiv.style.boxShadow = "0 0 10px " + window.adjectiveGlow[item.adjective];
                } else {
                    itemDiv.style.boxShadow = "0 0 10px #FFD700";
                }
                if(item.upgradeLevel > 0){
                    const upgradeLabel = document.createElement("div");
                    upgradeLabel.innerText = "+" + item.upgradeLevel;
                    upgradeLabel.style.position = "absolute";
                    upgradeLabel.style.top = "2px";
                    upgradeLabel.style.left = "2px";
                    upgradeLabel.style.background = "#FFD700";
                    upgradeLabel.style.color = "#222";
                    upgradeLabel.style.fontSize = "10px";
                    upgradeLabel.style.padding = "1px 3px";
                    upgradeLabel.style.borderRadius = "2px";
                    itemDiv.appendChild(upgradeLabel);
                }
                slotDiv.appendChild(itemDiv);
                const unequipBtn = createGamingButton("Unequip", function(){
                    window.playerInventory.push(hero.equipment[i]);
                    hero.equipment[i] = null;
                    saveHeroEquipment();
                    document.body.removeChild(modalOverlay);
                    showHeroEquipModal();
                });
                unequipBtn.style.fontSize = "10px";
                unequipBtn.style.padding = "3px 6px";
                slotDiv.appendChild(unequipBtn);
            } else {
                const equipBtn = createGamingButton("Equip", function(){
                    showInventorySelection(modalOverlay, i, function(){
                        document.body.removeChild(modalOverlay);
                        showHeroEquipModal();
                    });
                });
                equipBtn.style.fontSize = "10px";
                equipBtn.style.padding = "3px 6px";
                slotDiv.appendChild(equipBtn);
            }
            leftColumn.appendChild(slotDiv);
        }

        // Middle Column: hero portrait
        const middleColumn = document.createElement("div");
        middleColumn.style.width = "200px";
        middleColumn.style.display = "flex";
        middleColumn.style.alignItems = "center";
        middleColumn.style.justifyContent = "center";
        const portraitContainer = document.createElement("div");
        portraitContainer.style.width = "200px";
        portraitContainer.style.height = "400px"; // 2:1 ratio
        portraitContainer.style.display = "flex";
        portraitContainer.style.alignItems = "center";
        portraitContainer.style.justifyContent = "center";
        portraitContainer.style.border = "2px solid #FFD700";
        portraitContainer.style.borderRadius = "5px";
        const heroPortrait = document.createElement("img");
        heroPortrait.src = "img/char/aze1.png";
        heroPortrait.style.width = "200px";
        heroPortrait.style.height = "auto";
        heroPortrait.style.border = "2px solid #FFD700";
        heroPortrait.style.borderRadius = "5px";
        portraitContainer.appendChild(heroPortrait);
        middleColumn.appendChild(portraitContainer);

        // Right Column
        const rightColumn = document.createElement("div");
        rightColumn.style.width = "150px";
        rightColumn.style.display = "flex";
        rightColumn.style.flexDirection = "column";
        rightColumn.style.justifyContent = "space-around";
        rightColumn.style.alignItems = "center";
        for (let i = 4; i < 8; i++){
            const slotDiv = document.createElement("div");
            slotDiv.style.width = "150px";
            slotDiv.style.height = "150px";
            slotDiv.style.border = "2px solid #FFD700";
            slotDiv.style.textAlign = "center";
            slotDiv.dataset.slot = i;
            const slotName = document.createElement("div");
            slotName.style.fontWeight = "bold";
            slotName.style.marginBottom = "2px";
            slotName.style.fontSize = "10px";
            slotName.innerText = heroSlots[i].slotName;
            slotDiv.appendChild(slotName);
            
            if(hero.equipment[i]){
                const item = hero.equipment[i];
                const itemDiv = document.createElement("div");
                itemDiv.style.width = "80px";
                itemDiv.style.height = "80px";
                itemDiv.style.margin = "auto";
                itemDiv.style.backgroundImage = `url('${item.image}')`;
                itemDiv.style.backgroundSize = "cover";
                itemDiv.style.border = "none";
                if(window.adjectiveGlow && window.adjectiveGlow[item.adjective]){
                    itemDiv.style.boxShadow = "0 0 10px " + window.adjectiveGlow[item.adjective];
                } else {
                    itemDiv.style.boxShadow = "0 0 10px #FFD700";
                }
                if(item.upgradeLevel > 0){
                    const upgradeLabel = document.createElement("div");
                    upgradeLabel.innerText = "+" + item.upgradeLevel;
                    upgradeLabel.style.position = "absolute";
                    upgradeLabel.style.top = "2px";
                    upgradeLabel.style.left = "2px";
                    upgradeLabel.style.background = "#FFD700";
                    upgradeLabel.style.color = "#222";
                    upgradeLabel.style.fontSize = "10px";
                    upgradeLabel.style.padding = "1px 3px";
                    upgradeLabel.style.borderRadius = "2px";
                    itemDiv.appendChild(upgradeLabel);
                }
                slotDiv.appendChild(itemDiv);
                const unequipBtn = createGamingButton("Unequip", function(){
                    window.playerInventory.push(hero.equipment[i]);
                    hero.equipment[i] = null;
                    saveHeroEquipment();
                    document.body.removeChild(modalOverlay);
                    showHeroEquipModal();
                });
                unequipBtn.style.fontSize = "10px";
                unequipBtn.style.padding = "3px 6px";
                slotDiv.appendChild(unequipBtn);
            } else {
                const equipBtn = createGamingButton("Equip", function(){
                    showInventorySelection(modalOverlay, i, function(){
                        document.body.removeChild(modalOverlay);
                        showHeroEquipModal();
                    });
                });
                equipBtn.style.fontSize = "10px";
                equipBtn.style.padding = "3px 6px";
                slotDiv.appendChild(equipBtn);
            }
            rightColumn.appendChild(slotDiv);
        }

        // Assemble columns
        equipmentContainer.appendChild(leftColumn);
        equipmentContainer.appendChild(middleColumn);
        equipmentContainer.appendChild(rightColumn);

        // Add equipment container to the wrapper
        equipmentWrapper.appendChild(equipmentContainer);

        // Now append the equipmentWrapper to content
        content.appendChild(equipmentWrapper);

        // Info container at the bottom
        const infoContainer = document.createElement("div");
        infoContainer.style.margin = "10px 0";
        infoContainer.style.borderTop = "2px solid #FFD700";
        infoContainer.style.paddingTop = "10px";
        infoContainer.style.textAlign = "center";
        infoContainer.style.fontSize = "14px";
        infoContainer.style.lineHeight = "1.8";

        let totalEquippedPower = 0;
        let totalStats = { str: 0, agi: 0, vit: 0, int: 0, dex: 0, luk: 0 };
        hero.equipment.forEach(item => {
            if(item){
                totalEquippedPower += item.power;
                if(item.stats){
                    totalStats.str += item.stats.str;
                    totalStats.agi += item.stats.agi;
                    totalStats.vit += item.stats.vit;
                    totalStats.int += item.stats.int;
                    totalStats.dex += item.stats.dex;
                    totalStats.luk += item.stats.luk;
                }
            }
        });

        infoContainer.innerHTML = `
            <p><strong>${window.hero.name || "Hero"}</strong></p>
            <p>Level: ${window.hero.level || "N/A"}</p>
            <p>Total Power: ${typeof window.hero.getTotalPower === "function" ? window.hero.getTotalPower() : "N/A"} (Equipped: ${totalEquippedPower})</p>
            <p>Wins: ${window.hero.wins || 0} | Losses: ${window.hero.losses || 0}</p>
            <p>STR: ${totalStats.str} | AGI: ${totalStats.agi} | VIT: ${totalStats.vit}</p>
            <p>INT: ${totalStats.int} | DEX: ${totalStats.dex} | LUK: ${totalStats.luk}</p>
        `;

        content.appendChild(infoContainer);

        modalOverlay.appendChild(content);
        document.body.appendChild(modalOverlay);
    }

    // Add a "Hero Equip" button to the right menu.
    function addHeroEquipButton(){
        let rightMenu = document.getElementById("rightMenu");
        if(!rightMenu){
            rightMenu = document.createElement("div");
            rightMenu.id = "rightMenu";
            document.body.appendChild(rightMenu);
        }
        const btn = createGamingButton("Hero Equip", showHeroEquipModal);
        rightMenu.appendChild(btn);
    }

    addHeroEquipButton();
    window.hero = hero;  // Expose hero globally.
})();
