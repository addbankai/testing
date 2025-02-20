(function(){

  // Insert custom CSS for scrollbars if not already inserted
  if (!document.getElementById("custom-scrollbar-style")) {
    const styleElem = document.createElement("style");
    styleElem.id = "custom-scrollbar-style";
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
    `;
    document.head.appendChild(styleElem);
  }

  // Helper: Get move (rock, paper, scissors) from an item.
  function getMove(item) {
    if (!item) return null;
    const moves = ["rock", "paper", "scissors"];
    const code = item.name.charCodeAt(0);
    return moves[code % 3];
  }

  // Decide round winner with a bias: if enemy would win, 60% chance to switch to hero.
  function decideRound(heroItem, enemyItem) {
    const heroMove = getMove(heroItem);
    const enemyMove = getMove(enemyItem);
    let result;
    if (!heroItem && enemyItem) result = "enemy";
    else if (heroItem && !enemyItem) result = "hero";
    else if (!heroItem && !enemyItem) result = "tie";
    else if(heroMove !== enemyMove) {
      if((heroMove === "rock" && enemyMove === "scissors") ||
         (heroMove === "paper" && enemyMove === "rock") ||
         (heroMove === "scissors" && enemyMove === "paper")) {
        result = "hero";
      } else {
        result = "enemy";
      }
    } else {
      if(heroItem.power > enemyItem.power) result = "hero";
      else if(heroItem.power < enemyItem.power) result = "enemy";
      else result = "tie";
    }
    if(result === "enemy") {
      if(Math.random() < 0.6) result = "hero";
    }
    return result;
  }

  // Modified generateEnemyHero: enemy's item power is close to your hero's equipment.
  function generateEnemyHero() {
    const enemy = {
      equipment: new Array(8).fill(null),
      getTotalPower: function(){
        return this.equipment.reduce((sum, item) => item ? sum + item.power : sum, 0);
      }
    };
    for (let i = 0; i < 8; i++){
      if (window.hero && window.hero.equipment[i]) {
        let heroItem = window.hero.equipment[i];
        let newItem = Object.assign({}, heroItem);
        newItem.power = Math.floor(heroItem.power * (0.95 + Math.random() * 0.1));
        enemy.equipment[i] = newItem;
      } else {
        let item = (typeof window.generateRandomItem === "function") ? window.generateRandomItem() : null;
        if (item) {
          item.power = Math.floor(item.power * (0.9 + Math.random() * 0.2));
        }
        enemy.equipment[i] = item;
      }
    }
    return enemy;
  }

  // Helper: Save the global player inventory to localStorage.
  function savePlayerInventory(){
    localStorage.setItem("playerInventory", JSON.stringify(window.playerInventory));
  }

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

  // Modified updateHeroStats: double EXP reward in "exp" mode and show level-up modal.
  function updateHeroStats(win, mode) {
    if(!window.hero) return;
    if(win) {
      window.hero.wins++;
      let expReward = window.hero.level * 20;
      if(mode === "exp") expReward *= 2;
      window.hero.exp += expReward;
      while(window.hero.exp >= window.hero.level * 100) {
        window.hero.exp -= window.hero.level * 100;
        window.hero.level++;
        showLevelUpModal(window.hero.level);
      }
    } else {
      window.hero.losses++;
    }
    localStorage.setItem("heroStats", JSON.stringify({
      level: window.hero.level,
      exp: window.hero.exp,
      wins: window.hero.wins,
      losses: window.hero.losses
    }));
  }

  // New: Show a level-up modal instead of an alert.
  function showLevelUpModal(newLevel) {
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
    modal.style.zIndex = "3000";
    
    const content = document.createElement("div");
    content.style.position = "relative";
    content.style.background = "#222";
    content.style.border = "2px solid #FFD700";
    content.style.padding = "20px";
    content.style.fontFamily = "'Press Start 2P', monospace";
    content.style.fontSize = "12px";
    content.style.textAlign = "center";
    content.style.borderRadius = "8px";
    
    const msg = document.createElement("p");
    msg.innerText = "Level Up! Your hero is now level " + newLevel;
    content.appendChild(msg);
    
    const closeBtn = createGamingButton("Close", function(){
      document.body.removeChild(modal);
    });
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    content.appendChild(closeBtn);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  // New: Render hero info with a two-column layout.
  function renderHeroInfo() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";
    container.style.marginBottom = "10px";
    
    // Left column: Hero image.
    const leftCol = document.createElement("div");
    leftCol.style.flex = "0 0 auto";
    leftCol.style.marginRight = "20px";
    const heroImg = document.createElement("img");
    // Use hero.image if available, otherwise the provided URL.
    heroImg.src = window.hero && window.hero.image ? window.hero.image : "http://idleconomy.fun/img/char/azemove2.gif";
    heroImg.style.width = "100px";
    heroImg.style.height = "100px";
    heroImg.style.border = "2px solid #FFD700";
    heroImg.style.borderRadius = "50%";
    leftCol.appendChild(heroImg);
    
    // Right column: Hero details and equipment info.
    const rightCol = document.createElement("div");
    rightCol.style.flex = "1";
    rightCol.style.textAlign = "left";
    
    // Hero basic info.
    const heroBasic = document.createElement("div");
    heroBasic.innerHTML = `<strong>${window.hero.name || "Hero"}</strong><br>Level: ${window.hero.level || "N/A"}<br>Total Power: ${(typeof window.hero.getTotalPower === "function") ? window.hero.getTotalPower() : "N/A"}`;
    heroBasic.style.marginBottom = "10px";
    rightCol.appendChild(heroBasic);
    
    // Equipment info table.
    const equipTable = document.createElement("table");
    equipTable.style.width = "100%";
    equipTable.style.borderCollapse = "collapse";
    if(window.hero.equipment) {
      window.hero.equipment.forEach((item, index) => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #FFD700";
        const cellLabel = document.createElement("td");
        cellLabel.style.padding = "4px";
        cellLabel.style.fontSize = "10px";
        cellLabel.style.color = "#FFD700";
        // Label by itemType if available; otherwise, show slot number.
        cellLabel.innerText = item ? item.itemType || ("Slot " + (index+1)) : ("Slot " + (index+1) + " (Empty)");
        const cellPower = document.createElement("td");
        cellPower.style.padding = "4px";
        cellPower.style.fontSize = "10px";
        cellPower.style.color = "#FFD700";
        cellPower.style.textAlign = "right";
        cellPower.innerText = item ? item.power : "-";
        row.appendChild(cellLabel);
        row.appendChild(cellPower);
        equipTable.appendChild(row);
      });
    }
    rightCol.appendChild(equipTable);
    
    container.appendChild(leftCol);
    container.appendChild(rightCol);
    return container;
  }

  // New helper: Render item reward info.
  function renderItemReward(item) {
    const container = document.createElement('div');
    container.style.border = "2px solid #FFD700";
    container.style.padding = "10px";
    container.style.margin = "5px";
    container.style.textAlign = "center";
    container.style.display = "inline-block";
    container.style.background = "#222";
    if(item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.display = "block";
      img.style.margin = "0 auto 5px auto";
      container.appendChild(img);
    }
    const info = document.createElement("p");
    info.style.fontSize = "10px";
    info.style.margin = "0";
    info.innerHTML = `<strong>${item.name}</strong><br>
                      Level: ${item.level}<br>
                      Power: ${item.power}<br>
                      Rarity: ${item.rarity}`;
    container.appendChild(info);
    return container;
  }

  // New: Show loot reward popup modal with item info.
  function showLootRewardModal(rewardMessage, rewardItems) {
    const lootModal = document.createElement('div');
    lootModal.style.position = 'fixed';
    lootModal.style.top = '0';
    lootModal.style.left = '0';
    lootModal.style.width = '100%';
    lootModal.style.height = '100%';
    lootModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    lootModal.style.display = 'flex';
    lootModal.style.alignItems = 'center';
    lootModal.style.justifyContent = 'center';
    lootModal.style.zIndex = '3000';

    const modalContent = document.createElement('div');
    modalContent.style.position = 'relative';
    modalContent.style.background = '#222';
    modalContent.style.border = '2px solid #FFD700';
    modalContent.style.padding = '20px';
    modalContent.style.fontFamily = "'Press Start 2P', monospace";
    modalContent.style.fontSize = '10px';
    modalContent.style.textAlign = 'center';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.borderRadius = '8px';

    const messageElem = document.createElement('p');
    messageElem.innerText = rewardMessage;
    modalContent.appendChild(messageElem);

    if(rewardItems && rewardItems.length > 0) {
      const itemsContainer = document.createElement('div');
      itemsContainer.style.display = 'flex';
      itemsContainer.style.flexWrap = 'wrap';
      itemsContainer.style.justifyContent = 'center';
      rewardItems.forEach(item => {
        const itemElem = renderItemReward(item);
        itemsContainer.appendChild(itemElem);
      });
      modalContent.appendChild(itemsContainer);
    }

    const closeBtn = createGamingButton("Close", function(){
      document.body.removeChild(lootModal);
    });
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    modalContent.appendChild(closeBtn);

    lootModal.appendChild(modalContent);
    document.body.appendChild(lootModal);
  }

  // Show the PvP modal and simulate 8 rounds.
  function showPvpModal(mode) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    
    const content = document.createElement('div');
    content.className = 'modal-content custom-scrollbar';
    content.style.position = 'relative';
    content.style.background = '#222';
    content.style.border = '2px solid #FFD700';
    content.style.padding = '20px';
    content.style.fontFamily = "'Press Start 2P', monospace";
    content.style.fontSize = '10px';
    content.style.textAlign = 'center';
    content.style.width = '98%';
    content.style.maxWidth = '1000px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Display Hero Info using our new renderHeroInfo function.
    if(window.hero) {
      const heroInfo = renderHeroInfo();
      content.appendChild(heroInfo);
    } else {
      const noHeroMsg = document.createElement("div");
      noHeroMsg.style.marginBottom = "10px";
      noHeroMsg.innerHTML = "<strong>No hero set.</strong>";
      content.appendChild(noHeroMsg);
    }
    
    const heroPower = window.hero && typeof window.hero.getTotalPower === "function" ? window.hero.getTotalPower() : 0;
    const info = document.createElement('div');
    info.innerHTML = `<p>Your Hero Total Power: ${heroPower}</p>`;
    content.appendChild(info);
    
    const roundsContainer = document.createElement('div');
    content.appendChild(roundsContainer);
    let roundResults = [];
    let currentRound = 0;
    const enemy = generateEnemyHero();
    
    let rewardItems = [];
    let rewardText = "";
    
    function simulateRound(){
      if (currentRound >= 8) {
        let heroWins = roundResults.filter(r => r === "hero").length;
        let enemyWins = roundResults.filter(r => r === "enemy").length;
        const finalResult = document.createElement('p');
        let win = false;
        if(heroWins > enemyWins) {
          finalResult.innerText = `You win the match! (Hero: ${heroWins} - Enemy: ${enemyWins})`;
          win = true;
        } else if(enemyWins > heroWins) {
          finalResult.innerText = `Enemy wins the match! (Enemy: ${enemyWins} - Hero: ${heroWins})`;
        } else {
          finalResult.innerText = `The match is a tie! (Hero: ${heroWins} - Enemy: ${enemyWins})`;
        }
        roundsContainer.appendChild(finalResult);
        
        if(win) {
          if(mode === "item") {
            let enemyItems = enemy.equipment.filter(item => item);
            if(enemyItems.length > 0) {
              let randomEnemyItem = enemyItems[Math.floor(Math.random() * enemyItems.length)];
              window.playerInventory.push(randomEnemyItem);
              rewardItems.push(randomEnemyItem);
            }
            if(typeof window.generateRandomItem === "function"){
              let lootReward = window.generateRandomItem();
              window.playerInventory.push(lootReward);
              rewardItems.push(lootReward);
            }
            rewardText = "You won! You've received one enemy equipment and an extra loot item!";
          } else if(mode === "exp") {
            if(typeof window.generateRandomItem === "function"){
              let lootReward = window.generateRandomItem();
              window.playerInventory.push(lootReward);
              rewardItems.push(lootReward);
            }
            rewardText = "You won! You've received an extra loot item!";
          }
          savePlayerInventory();
          showLootRewardModal(rewardText, rewardItems);
        } else {
          if(mode === "item") {
            let equippedItems = window.hero.equipment.filter(item => item !== null);
            if(equippedItems.length > 0) {
              let removeIndexInEquip = window.hero.equipment.indexOf(equippedItems[Math.floor(Math.random() * equippedItems.length)]);
              if(removeIndexInEquip !== -1) {
                window.hero.equipment[removeIndexInEquip] = null;
                finalResult.innerText = "You lost the match! One of your equipped items has been lost.";
                localStorage.setItem("heroEquipment", JSON.stringify(window.hero.equipment));
              }
            }
            showLootRewardModal("You lost the match! No rewards.", []);
          }
        }
        roundsContainer.appendChild(document.createElement('br'));
        updateHeroStats(win, mode);
        
        const enemyEquipDiv = document.createElement('div');
        enemyEquipDiv.style.marginTop = '10px';
        enemyEquipDiv.innerHTML = `<h4>Enemy Equipment:</h4>`;
        enemy.equipment.forEach(item => {
          if(item){
            enemyEquipDiv.innerHTML += `<div style="border:2px solid #FFD700; margin:4px; padding:4px; display:inline-block;">
              <img src="${item.image}" style="width:50px;height:50px;"><br>${item.name}<br>Power: ${item.power}
              </div>`;
          }
        });
        content.appendChild(enemyEquipDiv);
        const closeBtn = createGamingButton("Close", function(){
          document.body.removeChild(modal);
        });
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        content.appendChild(closeBtn);
        return;
      }
      const heroItem = window.hero && window.hero.equipment ? window.hero.equipment[currentRound] : null;
      const enemyItem = enemy.equipment[currentRound];
      const result = decideRound(heroItem, enemyItem);
      roundResults.push(result);
      const roundDiv = document.createElement('div');
      roundDiv.style.marginTop = '10px';
      roundDiv.innerHTML = `<strong>Round ${currentRound+1}:</strong><br>
        Your item: ${heroItem ? heroItem.name + " (Power: " + heroItem.power + ", Move: " + getMove(heroItem) + ")" : "None"}<br>
        Enemy item: ${enemyItem ? enemyItem.name + " (Power: " + enemyItem.power + ", Move: " + getMove(enemyItem) + ")" : "None"}<br>
        Result: ${result.toUpperCase()}`;
      roundsContainer.appendChild(roundDiv);
      currentRound++;
      setTimeout(simulateRound, 2000);
    }
    simulateRound();
  }

  // Modal for choosing PvP options.
  function showPvpOptionsModal(){
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    
    const content = document.createElement('div');
    content.className = 'modal-content custom-scrollbar';
    content.style.position = 'relative';
    content.style.background = '#222';
    content.style.border = '2px solid #FFD700';
    content.style.padding = '20px';
    content.style.fontFamily = "'Press Start 2P', monospace";
    content.style.fontSize = '10px';
    content.style.textAlign = 'center';
    content.style.width = '98%';
    content.style.maxWidth = '1000px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';
    modal.appendChild(content);
    
    // Display hero equipment info (organized) before mode selection.
    if(window.hero && window.hero.equipment) {
      const equipInfo = renderHeroInfo();
      content.appendChild(equipInfo);
    }
    
    const title = document.createElement('h3');
    title.innerText = "PvP Options";
    content.appendChild(title);
    const itemBetBtn = createGamingButton("Item Bet PvP", function(){
      document.body.removeChild(modal);
      showPvpModal("item");
    });
    content.appendChild(itemBetBtn);
    const expPvpBtn = createGamingButton("Exp PvP", function(){
      document.body.removeChild(modal);
      showPvpModal("exp");
    });
    content.appendChild(expPvpBtn);
    const onlinePvpBtn = createGamingButton("Online PvP (SOON)", function(){});
    onlinePvpBtn.disabled = true;
    content.appendChild(onlinePvpBtn);
    const closeBtn = createGamingButton("Cancel", function(){
      document.body.removeChild(modal);
    });
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    content.appendChild(closeBtn);
    document.body.appendChild(modal);
  }

  // Add a "PVP" button to the right menu.
  function addPvpButton(){
    const rightMenu = document.getElementById("rightMenu");
    if(rightMenu){
      const btn = createGamingButton("PVP", function(){
        showPvpOptionsModal();
      });
      rightMenu.appendChild(btn);
    }
  }
  addPvpButton();

})();
