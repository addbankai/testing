// In modals.js

function showPopupAlert(message) {
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
  closeBtn.addEventListener("click", () => overlay.remove());
  
  alertBox.appendChild(closeBtn);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
}

function showConfirmModal(message, callback) {
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
  modal.style.zIndex = "2000";
  
  const content = document.createElement("div");
  content.style.background = "#222";
  content.style.border = "2px solid #FFD700";
  content.style.padding = "20px";
  content.style.fontFamily = "'Press Start 2P', monospace";
  content.style.fontSize = "12px";
  content.style.textAlign = "center";
  content.style.borderRadius = "8px";
  content.style.maxWidth = "400px";
  
  const msg = document.createElement("p");
  msg.innerText = message;
  content.appendChild(msg);
  
  const yesBtn = document.createElement("button");
  yesBtn.innerText = "Yes";
  yesBtn.style.margin = "5px";
  yesBtn.style.padding = "10px 15px";
  yesBtn.style.border = "2px solid #FFD700";
  yesBtn.style.background = "#333";
  yesBtn.style.color = "#FFD700";
  yesBtn.style.cursor = "pointer";
  yesBtn.style.boxShadow = "4px 4px 0 #000";
  yesBtn.addEventListener("click", () => {
    callback(true);
    modal.remove();
  });
  
  const noBtn = document.createElement("button");
  noBtn.innerText = "No";
  noBtn.style.margin = "5px";
  noBtn.style.padding = "10px 15px";
  noBtn.style.border = "2px solid #FFD700";
  noBtn.style.background = "#333";
  noBtn.style.color = "#FFD700";
  noBtn.style.cursor = "pointer";
  noBtn.style.boxShadow = "4px 4px 0 #000";
  noBtn.addEventListener("click", () => {
    callback(false);
    modal.remove();
  });
  
  content.appendChild(yesBtn);
  content.appendChild(noBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function showConstructionTimerModal(duration, callback) {
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
  
  const popup = document.createElement("div");
  popup.style.background = "#222";
  popup.style.border = "2px solid #FFD700";
  popup.style.padding = "20px";
  popup.style.fontFamily = "'Press Start 2P', monospace";
  popup.style.fontSize = "12px";
  popup.style.textAlign = "center";
  popup.style.width = "300px";
  popup.style.boxShadow = "4px 4px 0 #000";
  
  const header = document.createElement("h3");
  header.innerText = "Construction in Progress";
  popup.appendChild(header);
  
  const timerText = document.createElement("p");
  popup.appendChild(timerText);
  
  modal.appendChild(popup);
  document.body.appendChild(modal);
  
  let startTime = Date.now();
  const interval = setInterval(function() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(duration - elapsed, 0);
    timerText.innerText = "Time remaining: " + (remaining / 1000).toFixed(1) + " sec";
    if (remaining <= 0) {
      clearInterval(interval);
      modal.remove();
      callback();
    }
  }, 100);
}
