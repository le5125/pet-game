


 const apiKey = 'AIzaSyBYbCZQNBg5SJ5_msWws9sDok7fE2hPd20'; // 已插入你的 Gemini API 金鑰

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const chatbox = document.getElementById('chat-messages');
  const userMsg = input.value.trim();
  if (!userMsg) return;

  chatbox.innerHTML += `<div class="msg user">你：${userMsg}</div>`;
  input.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;

}

function showStarterPetModal() {
  const list = document.getElementById('starter-pet-list');
  list.innerHTML = ''; // 清空舊資料

  const starters = evolutionData.filter(e => parseInt(e.stage) === 1);
  starters.forEach(petOption => {
    const div = document.createElement('div');
    div.style.cursor = 'pointer';
    div.style.textAlign = 'center';

    const img = document.createElement('img');
    img.src = petOption.image;
    img.style.width = '150px';
    img.style.height = '150px';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '16px';

   const name = document.createElement('div');
name.textContent = petOption["名子"] || petOption["角色名稱"];

    div.appendChild(img);
    div.appendChild(name);

    div.addEventListener('click', () => {
      pet.spriteName = petOption.name;
      pet.stage = parseInt(petOption.stage);
      document.getElementById('choose-pet-modal').style.display = 'none';
      showNameModal(); // 選完後顯示命名視窗
      updateChickenSprite(); // 顯示選到的角色
    });

    list.appendChild(div);
  });

  document.getElementById('choose-pet-modal').style.display = 'flex';
}



// 🔄🔄🔄🔄🔄 初始化遊戲邏輯主流程 START 🔄🔄🔄🔄🔄
        function initPet() {
            // 嘗試從localStorage加載保存的遊戲
            loadGame();
            
            // 如果沒有名字，顯示選擇寵物模態框 → 再命名
if (!pet.name) {
    showStarterPetModal();  // 這是選寵物的視窗
} else {
    updateNameDisplay();
}

            updateChickenSprite(); // ✅ 初始化時讀取角色圖片
            updateStatusBars();
            updateSleepButton();

            autoSetWeatherByTime();  // ✅ 插在這邊
            
            // 設置計時器
           setInterval(updatePetStatus, 1000); // 每 1 秒更新一次狀態（飢餓、快樂、精力等變化）
           setInterval(autoMove, 1000);// 每 1秒自動走動一次
           setInterval(autoAction, 3000); // 每 3 秒檢查是否執行行為（自動吃、玩、睡）
           setInterval(checkNeeds, 3000); // 每 3 秒檢查是否需要提示需求（餓、髒、無聊）
           setInterval(poop, 300000);    // 每 60秒可能會大便一次
           setInterval(saveGame, 30000);  // 每 30 秒自動存檔
           setInterval(autoSetWeatherByTime, 3600000);   // 每 1 小時依時間變換天氣
            
            // 添加事件監聽器
            feedBtn.addEventListener('click', feedPet);
            playBtn.addEventListener('click', playWithPet);
            cleanBtn.addEventListener('click', cleanPet);
            sleepBtn.addEventListener('click', toggleSleep);
            confirmNameBtn.addEventListener('click', confirmName);
            confirmRenameBtn.addEventListener('click', confirmRename);
            renameBtn.addEventListener('click', showRenameModal);
 
      
document.getElementById('evolve-btn').addEventListener('click', () => {
  if (!evolutionData || evolutionData.length === 0) {
    alert("進化資料尚未載入完成，請稍後再試！");
    return;
  }

 checkEvolution();       // ✅ 只有按按鈕才觸發進化
  updateChickenSprite();
});
    
            document.getElementById('weather-btn').addEventListener('click', () => {
    const weathers = ['sunny', 'rainy', 'hot', 'night'];
    pet.weather = weathers[Math.floor(Math.random() * weathers.length)];
    updateWeather();
});
            
            // 初始位置
            const areaWidth = petArea.clientWidth;
            const areaHeight = petArea.clientHeight;
            pet.position.x = areaWidth / 2;
            pet.position.y = areaHeight / 2;
            updatePosition();
            
            if (pet.growthStage === 0) {
                addLog(`${pet.name}已經在線上啦！`);
            } else {
                addLog(`${pet.name}回來了！`);
            }
        }
// 🔄🔄🔄🔄🔄 初始化遊戲主流程 END 🔄🔄🔄🔄🔄

// 🐣🐣🐣🐣🐣🐣🐣🐣🐣🐣 寵物狀態資料區 START 🐣🐣🐣🐣🐣🐣🐣🐣🐣🐣
const pet = {
  name: "",                  // 🐤 寵物的名字（命名與顯示用）
  spriteName: "gugu_egg",
  level: 1,                  // 📈 等級（每7天升級一次，用於進化與難度調整）
  exp: 0,        // 從 0 開始
  maxExp: 100,   // 每級所需經驗
  stage: 1,               
  hunger: 100,               // 🍽️ 飢餓度（自動吃飯或需餵食）
  happiness: 100,           // 🎮 快樂度（與玩具或互動影響）
  energy: 100,              // 💤 精力（影響睡覺邏輯）
  cleanliness: 100,         // 🧼 清潔度（拉屎後會下降）
  isSleeping: false,        // 😴 是否正在睡覺
  isEating: false,          // 🍽️ 是否正在吃東西
  isPlaying: false,         // 🎲 是否正在玩耍
  position: { x: 0, y: 0 }, // 📍 當前座標位置（移動動畫與 autoMove 用）
  direction: 1,             // ➡️ 移動方向（1: 向右，-1: 向左）
  mood: 'happy',            // 😀 心情狀態（未使用，但可用於額外行為邏輯）
  lastActionTime: Date.now(),           // ⏱️ 上次自動行為的時間（如 autoAction）
  lastHungerDecrease: Date.now(),       // ⏱️ 上次飢餓下降時間
  lastHappinessDecrease: Date.now(),    // ⏱️ 上次快樂下降時間
  lastEnergyDecrease: Date.now(),       // ⏱️ 上次精力變動時間
  lastCleanlinessDecrease: Date.now(),  // ⏱️ 上次清潔度下降時間
  lastAgeIncrease: Date.now(),          // ⏱️ 上次年齡成長時間
  lastPoopTime: Date.now(),             // ⏱️ 上次大便時間
  lastSaveTime: Date.now(),             // 💾 上次存檔時間（判斷離線時間差）
  weather: 'sunny'          // 🌤️ 當前天氣狀態（sunny/rainy/hot/night）
};
let lastTalkTime = 0;
const talkCooldown = 5000; // 每 5 秒只能說話一次
     
// 🐣🐣🐣🐣🐣🐣🐣🐣🐣🐣 寵物狀態資料區 END 🐣🐣🐣🐣🐣🐣🐣🐣🐣🐣



// 📊📊📊📊📊 狀態條與 UI 顯示 START 📊📊📊📊📊
// 更新狀態條
        function updateStatusBars() {
  // 🔁 水平進度條更新（保留）
  hungerBar.style.width = `${pet.hunger}%`;
  happinessBar.style.width = `${pet.happiness}%`;
  energyBar.style.width = `${pet.energy}%`;
  cleanlinessBar.style.width = `${pet.cleanliness}%`;

  // ✅ 同步更新圓形條的百分比數字
  document.getElementById('hunger-value').textContent = `${pet.hunger}%`;
  document.getElementById('happiness-value').textContent = `${pet.happiness}%`;
  document.getElementById('energy-value').textContent = `${pet.energy}%`;
  document.getElementById('cleanliness-value').textContent = `${pet.cleanliness}%`;

  // ✅ 同步更新圓形條的 SVG 視覺進度
  setCircleProgress('hunger-bar', pet.hunger);
  setCircleProgress('happiness-bar', pet.happiness);
  setCircleProgress('energy-bar', pet.energy);
  setCircleProgress('cleanliness-bar', pet.cleanliness);

  // 等級顯示
  levelDisplay.textContent = pet.level;

  // 🧠 狀態文字邏輯
  if (document.body.classList.contains('exploring')) {
    statusDisplay.textContent = "🌲 探險中...";
    statusDisplay.className = "text-white font-bold";
    return;
  }

  if (pet.isSleeping) {
    statusDisplay.textContent = "😴 睡覺中";
    statusDisplay.className = "text-purple-600";
    randomTalk('sleeping');
  } else if (pet.isEating) {
    statusDisplay.textContent = "🍽️ 進食中";
    statusDisplay.className = "text-yellow-600";
    randomTalk('eating');
  } else if (pet.isPlaying) {
    statusDisplay.textContent = "🎮 玩耍中";
    statusDisplay.className = "text-blue-600";
    randomTalk('playing');
  } else if (pet.hunger < 30) {
    statusDisplay.textContent = "🍗 肚子好餓";
    statusDisplay.className = "text-red-500 font-bold";
    randomTalk('hungry');
  } else if (pet.energy < 30) {
    statusDisplay.textContent = "🥱 有點累";
    statusDisplay.className = "text-indigo-500 font-bold";
    randomTalk('tired');
  } else if (pet.happiness < 30) {
    statusDisplay.textContent = "😢 心情不好";
    statusDisplay.className = "text-gray-600 font-bold";
    randomTalk('bored');
  } else if (pet.cleanliness < 30) {
    statusDisplay.textContent = "🧼 髒兮兮";
    statusDisplay.className = "text-brown-500 font-bold";
    randomTalk('dirty');
  } else {
    statusDisplay.textContent = "😊 狀態良好";
    statusDisplay.className = "text-green-600";
    randomTalk('normal');
  }
  
}
function setCircleProgress(circleId, percent) {
  const circle = document.getElementById(circleId);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  circle.style.strokeDasharray = `${circumference - offset} ${circumference}`;
}

        // 更新位置
        function updatePosition() {
  chickenContainer.style.left = `${pet.position.x}px`;
  chickenContainer.style.top = `${pet.position.y}px`;

   // 根據方向翻轉圖像
  if (pet.direction === -1) {
    chicken.style.transform = 'scaleX(-1)';
  } else {
    chicken.style.transform = 'scaleX(1)';
  }
}
// 📊📊📊📊📊 狀態條與 UI 顯示 END 📊📊📊📊📊


// ✏️✏️✏️✏️ 命名與改名功能 START ✏️✏️✏️✏️
        function updateNameDisplay() {
            if (pet.name) {
                petNameDisplay.textContent = pet.name;
            } else {
                petNameDisplay.textContent = "未命名";
            }
        }

        // 顯示命名模態框
        function showNameModal() {
            nameModal.style.display = 'flex';
            petNameInput.focus();
        }

        // 顯示改名模態框
        function showRenameModal() {
            if (pet.isDead) return;
            
            renameInput.value = pet.name;
            renameModal.style.display = 'flex';
            renameInput.focus();
        }

        // 確認名字
        function confirmName() {
  const name = petNameInput.value.trim();
  if (name) {
    pet.name = name;
    nameModal.style.display = 'none';
    updateNameDisplay();
    updateNameTag();
    addLog(`你將寵物命名為「${pet.name}」`);
    saveGame(); // ✅ 命名後馬上存檔
  } else {
    alert("請輸入一個有效的名字！");
  }
}
        // 確認改名
        function confirmRename() {
            const newName = renameInput.value.trim();
            if (newName) {
                const oldName = pet.name;
                pet.name = newName;
                renameModal.style.display = 'none';
                updateNameDisplay();
                updateNameTag();
                addLog(`你將寵物「${oldName}」改名為「${newName}」`);
                saveGame();
            } else {
                alert("請輸入一個有效的名字！");
            }
        }

      
// ✏️✏️✏️✏️ 命名與改名功能 END ✏️✏️✏️✏️

// 🌤️🌤️🌤️ 自動設定天氣（根據時間） START
function autoSetWeatherByTime() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 18) {
        // 白天 → 隨機選擇 sunny / rainy / hot
        const dayWeathers = ['sunny', 'rainy', 'hot', 'storm'];
        pet.weather = dayWeathers[Math.floor(Math.random() * dayWeathers.length)];
    } else {
        // 晚上 → 固定 night
        pet.weather = 'night';
    }

    updateWeather();
}

// 🌤️🌤️🌤️🌤️🌤️🌤️自動設定天氣 END🌤️🌤️🌤️🌤️🌤️


// 🌤️🌤️🌤️🌤️ 天氣控制邏輯 START 🌤️🌤️🌤️🌤️
        function toggleWeather() {
    const weatherList = ['sunny', 'rainy', 'hot', 'storm', 'night'];
    const currentIndex = weatherList.indexOf(pet.weather);
    pet.weather = weatherList[(currentIndex + 1) % weatherList.length];

    

    updateWeather();
    addLog(`天氣變成了：${pet.weather}`);
    saveGame();
     // ✅ 根據新天氣呼叫不同的話語
  switch (pet.weather) {
    case 'sunny':
      randomTalk('weather_sunny');
      break;
    case 'rainy':
      randomTalk('weather_rainy');
      break;
    case 'hot':
      randomTalk('weather_hot');
      break;
      case 'storm':
    randomTalk('weather_storm');
    break;
    case 'night':
      randomTalk('weather_night');
      break;
  }
}
let lightningLoopInterval;


  function updateWeather() {
  petArea.style.backgroundImage = '';
  petArea.classList.remove('daytime', 'nighttime');

  document.getElementById('rainContainer').innerHTML = '';
  document.getElementById('starsContainer').innerHTML = '';
  document.querySelectorAll('.lightning-flash').forEach(flash => flash.remove());
  clearInterval(lightningLoopInterval);

  switch (pet.weather) {
    case 'sunny':
      petArea.style.backgroundImage = "url('https://i.imgur.com/qB5GmEI.png')";
      document.getElementById('weather-icon').className = "fas fa-cloud-sun text-yellow-500";
      break;
    case 'rainy':
      petArea.style.backgroundImage = "url('https://i.imgur.com/EKyxQMx.png')";
      document.getElementById('weather-icon').className = "fas fa-cloud-showers-heavy text-blue-500";
      createRainEffect();
      break;
    case 'hot':
      petArea.style.backgroundImage = "url('https://i.imgur.com/YrLNhPO.png')";
      document.getElementById('weather-icon').className = "fas fa-sun text-orange-500";
      break;
    case 'storm':
      petArea.style.backgroundImage = "url('https://i.imgur.com/uU3ed04.png')";
      document.getElementById('weather-icon').className = "fas fa-bolt text-purple-500";
      createRainEffect();
      createLightningEffect(2);
      lightningLoopInterval = setInterval(() => {
        const repeat = 2 + Math.floor(Math.random() * 2);
        createLightningEffect(repeat);
      }, 10000 + Math.random() * 5000);
      break;
    case 'night':
      petArea.style.backgroundImage = "url('https://i.imgur.com/UQS4dtr.png')";
      document.getElementById('weather-icon').className = "fas fa-moon text-yellow-500";
      createStars();
      break;
  }

  const moon = document.getElementById('moon');
  moon.style.display = pet.weather === 'night' ? 'block' : 'none';

  petArea.style.backgroundSize = 'cover';
  petArea.style.backgroundPosition = 'center';
}


function createLightningEffect(repeat = 3, delay = 300) {
  if (document.body.classList.contains('exploring')) return;

  let count = 0;
  const flashOnce = () => {
    const flash = document.createElement('div');
    flash.className = 'lightning-flash';
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 200);
    }, 100);

    count++;
    if (count < repeat) {
      setTimeout(flashOnce, delay + Math.random() * 200);
    }
  };

  flashOnce();
}




function createRainEffect() {
  const rainContainer = document.getElementById('rainContainer');
  rainContainer.innerHTML = ''; // ❗ 清掉之前的雨滴

  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    rainContainer.appendChild(drop); // ✅ 加入正確容器
  }
}

function createStars() {
  const starsContainer = document.getElementById('starsContainer');
  starsContainer.innerHTML = ''; // 清除舊星星 ✅

  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    starsContainer.appendChild(star);
  }
}
// 🌤️🌤️🌤️🌤️ 天氣控制邏輯 END 🌤️🌤️🌤️🌤️

// ✨✨✨✨✨ 自動行為控制 START ✨✨✨✨✨
      function autoMove() {
  if (pet.isSleeping || pet.isEating || pet.isPlaying || pet.isDead) return;

  const areaRect = petArea.getBoundingClientRect(); // 🟦 取得真正的可活動區域

  const marginX = 200;  // 左右安全邊距
  const leftLimit = areaRect.left + marginX;
  const rightLimit = areaRect.right - marginX;

  const topLimit = areaRect.top + 600; // 頂端 + 200 高度

  const buttonWrapper = document.querySelector('.button-wrapper');
  const buttonTop = buttonWrapper.getBoundingClientRect().top;
  const bottomLimit = buttonTop - 80;

  // 隨機是否要移動
  if (Math.random() > 0.3) {
    pet.direction = Math.random() > 0.5 ? 1 : -1;

    let newX = pet.position.x + (pet.direction * (20 + Math.random() * 30));
    let newY = pet.position.y + (Math.random() > 0.5 ? -10 : 10);

    // 限制 X, Y 不超出邊界
    newX = Math.max(leftLimit, Math.min(rightLimit, newX));
    newY = Math.max(topLimit, Math.min(bottomLimit, newY));

    pet.position.x = newX;
    pet.position.y = newY;

    // 動畫
    chicken.classList.add('walking');
    setTimeout(() => {
      chicken.classList.remove('walking');
    }, 500);

    updatePosition();

    if (Math.random() > 0.5) {
      randomTalk('walk');
    }
  }

  // ✅ 顯示框線 debug
  const moveRange = document.getElementById('move-range');
  if (moveRange) {
    moveRange.style.left = `${leftLimit}px`;
    moveRange.style.top = `${topLimit}px`;
    moveRange.style.width = `${rightLimit - leftLimit}px`;
    moveRange.style.height = `${bottomLimit - topLimit}px`;
  }
}

        function autoAction() {
    if (pet.isDead || pet.isEating || pet.isPlaying) return;

    const now = Date.now();

    // ✅ 若場上有食物且飢餓度不滿，優先走去吃
    const foodItems = document.querySelectorAll('.food-item');
    if (foodItems.length > 0 && pet.hunger < 90) {
        const food = foodItems[0];
        const foodName = food.title;

        pet.isEating = true;
        chicken.classList.add('eating');
        randomTalk('eating');

        // 模擬移動到食物位置
        const foodRect = food.getBoundingClientRect();
        const areaRect = petArea.getBoundingClientRect();
        pet.position.x = foodRect.left - areaRect.left + foodRect.width / 2;
        pet.position.y = foodRect.top - areaRect.top + foodRect.height / 2;
        updatePosition();

        setTimeout(() => {
            pet.hunger = Math.min(100, pet.hunger + 30);
            pet.isEating = false;
            chicken.classList.remove('eating');
            food.remove();
            addLog(`${pet.name}肚子餓，吃掉了${foodName}（+30）`);
            updateStatusBars();
            saveGame();
        }, 2000);
        return;
    }

    // ✅ 若場上有玩具且快樂度不滿，優先去玩
    const toyItems = document.querySelectorAll('.toy-item');
    if (toyItems.length > 0 && pet.happiness < 90) {
        const toy = toyItems[0];
        const toyName = toy.title;

        pet.isPlaying = true;
        chicken.classList.add('playing');
        randomTalk('playing');

        const toyRect = toy.getBoundingClientRect();
        const areaRect = petArea.getBoundingClientRect();
        pet.position.x = toyRect.left - areaRect.left + toyRect.width / 2;
        pet.position.y = toyRect.top - areaRect.top + toyRect.height / 2;
        updatePosition();

        setTimeout(() => {
            pet.happiness = Math.min(100, pet.happiness + 30);
            pet.energy = Math.max(0, pet.energy - 10);
            pet.cleanliness = Math.max(0, pet.cleanliness - 10);
            pet.hunger = Math.max(0, pet.hunger - 10);
            pet.isPlaying = false;
            chicken.classList.remove('playing');
            toy.remove();
            addLog(`${pet.name}自己玩了${toyName}（快樂+30、精力-10、清潔-10、飢餓-10）`);
            updateStatusBars();
            saveGame();
        }, 3000);
        return;
    }

    // 飢餓度低於 50 自動吃飯
    if (pet.hunger < 50 && !pet.isEating) {
        pet.isEating = true;
        chicken.classList.add('eating');
        randomTalk('eating');
        setTimeout(() => {
            pet.hunger = Math.min(100, pet.hunger + 30);
            pet.isEating = false;
            chicken.classList.remove('eating');
            addLog(`${pet.name}肚子餓，自動吃了飯（+30）`);
            updateStatusBars();
            saveGame();
        }, 2000);
        return;
    }

    // 快樂度低於 50 自動玩
    if (pet.happiness < 50 && !pet.isPlaying) {
        pet.isPlaying = true;
        chicken.classList.add('playing');
        randomTalk('playing');
        setTimeout(() => {
            pet.happiness = Math.min(100, pet.happiness + 30);
            pet.energy = Math.max(0, pet.energy - 10);
            pet.cleanliness = Math.max(0, pet.cleanliness - 10);
            pet.hunger = Math.max(0, pet.hunger - 10);
            pet.isPlaying = false;
            chicken.classList.remove('playing');
            addLog(`${pet.name}自己玩耍（快樂+30、精力-10、清潔-10、飢餓-10）`);
            updateStatusBars();
            saveGame();
        }, 3000);
        return;
    }

    // 精力低於 20 自動睡覺
    if (pet.energy < 20 && !pet.isSleeping) {
        pet.isSleeping = true;
        chicken.classList.add('sleeping');
        randomTalk('sleeping');
        startZzz();
        addLog(`${pet.name}太累了，自動睡覺`);
        return;
    }

    // 睡到 80 自動起床
    if (pet.isSleeping && pet.energy >= 80) {
        pet.isSleeping = false;
        chicken.classList.remove('sleeping');
        randomTalk('wake');
        clearZzz();
        pet.happiness = Math.min(100, pet.happiness + 5);
        pet.hunger = Math.max(0, pet.hunger - 5);
        addLog(`${pet.name}睡飽了，自動起床（快樂+5、飢餓-5）`);
        updateStatusBars();
        saveGame();
    }

    // 清潔度檢查與自動清潔
    if (pet.cleanliness < 50) {
        const cleanPenalty = Math.floor((50 - pet.cleanliness) / 5) * 5;
        pet.happiness = Math.max(0, pet.happiness - cleanPenalty);
        addLog(`${pet.name}太髒了，快樂度下降 ${cleanPenalty}`);

        if (pet.cleanliness < 30) {
            pet.cleanliness = 100;
            poopContainer.innerHTML = '';
            randomTalk('dirty');
            addLog(`${pet.name}太髒，自動清潔完畢`);
            updateStatusBars();
            saveGame();
        }
    }
}


        // 檢查需求（每 3 秒執行一次）
function checkNeeds() {
  if (pet.isDead) return;

  if (pet.hunger < 30) {
    if (Math.random() > 0.5) randomTalk('hungry');
  } else {
    pet.starvationTime = 0;
  }

  if (pet.happiness < 30) {
    if (Math.random() > 0.5) randomTalk('bored');
  }

  if (pet.cleanliness < 30) {
    if (Math.random() > 0.5) randomTalk('dirty');
  }
}

// ✨✨✨✨✨ 自動行為控制 END ✨✨✨✨✨

// 💩💩💩💩💩 大便行為邏輯 START 💩💩💩💩💩       
        // 大便
        function poop() {
            if (pet.isDead || pet.isSleeping || pet.growthStage === 0) return;
            
            // 20%機率大便
            if (Math.random() > 0.8) {
                const poopElement = document.createElement('div');
                poopElement.className = 'poop';
                
                // 寵物旁位置
                poopElement.style.left = `${pet.position.x + 50}px`; // 在寵物右邊一點
                poopElement.style.top = `${pet.position.y + 50}px`;  // 在寵物下方一點   
                
                poopContainer.appendChild(poopElement);
                
                // 清潔度下降20%
                pet.cleanliness = Math.max(0, pet.cleanliness - 20);
                updateStatusBars();
                
                addLog(`${pet.name}大便了，清潔度下降20%`);
                saveGame();
                
                // 10秒後自動消失
                setTimeout(() => {
                    if (poopElement.parentNode) {
                        poopElement.remove();
                    }
                }, 10000);
            }
        }

// 💩💩💩💩💩 大便行為邏輯 END 💩💩💩💩💩

// 🎁🎁🎁🎁🎁 食物與玩具生成 START 🎁🎁🎁🎁🎁
// 生成食物
        function spawnFood() {
            // 清除現有食物
            document.querySelectorAll('.food-item').forEach(item => item.remove());
            
            // 隨機生成1-3個食物
            const foodCount = 1 + Math.floor(Math.random() * 2);
            
            for (let i = 0; i < foodCount; i++) {
                const food = foods[Math.floor(Math.random() * foods.length)];
                const foodItem = document.createElement('div');
                foodItem.className = `food-item ${food.color} rounded-full flex items-center justify-center text-xl`;
                foodItem.textContent = food.emoji;
                foodItem.title = food.name;
                
                // 隨機位置
                const areaWidth = petArea.clientWidth;
                const areaHeight = petArea.clientHeight;
                const x = 30 + Math.random() * (areaWidth - 60);
                const y = 30 + Math.random() * (areaHeight - 90);
                
                foodItem.style.left = `${x}px`;
                foodItem.style.top = `${y}px`;
                
                // 點擊事件
                foodItem.addEventListener('click', () => {
                    if (pet.isDead) return;
                    
                    pet.hunger = Math.min(100, pet.hunger + food.restore);
                    updateStatusBars();
                    randomTalk('eating')
                    foodItem.remove();
                    addLog(`${pet.name}吃了${food.name}`);
                    saveGame();
                });
                
                petArea.appendChild(foodItem);
            }
        }

        // 生成玩具
        function spawnToy() {
            // 清除現有玩具
            document.querySelectorAll('.toy-item').forEach(item => item.remove());
            
            // 隨機生成1個玩具
            const toy = toys[Math.floor(Math.random() * toys.length)];
            const toyItem = document.createElement('div');
            toyItem.className = `toy-item ${toy.color} rounded-full flex items-center justify-center text-xl`;
            toyItem.textContent = toy.emoji;
            toyItem.title = toy.name;
            
            // 隨機位置
            const areaWidth = petArea.clientWidth;
            const areaHeight = petArea.clientHeight;
            const x = 30 + Math.random() * (areaWidth - 60);
            const y = 30 + Math.random() * (areaHeight - 90);
            
            toyItem.style.left = `${x}px`;
            toyItem.style.top = `${y}px`;
            
            // 點擊事件
            toyItem.addEventListener('click', () => {
                if (pet.isDead) return;
                
                pet.happiness = Math.min(100, pet.happiness + toy.restore);
                pet.energy = Math.max(0, pet.energy - 5);
                updateStatusBars();
               randomTalk('playing');
                toyItem.remove();
                addLog(`${pet.name}玩了${toy.name}`);
                saveGame();
            });
            
            petArea.appendChild(toyItem);
        }
// 🎁🎁🎁🎁🎁 食物與玩具生成 END 🎁🎁🎁🎁🎁

// 🍽️🍽️🍽️🍽️ 食物 / 玩具 / 造型資料定義區 START 🍽️🍽️🍽️🍽️
        const foods = [
            { name: '玉米', emoji: '🌽', color: 'bg-yellow-200', restore: 20 },
            { name: '蟲子', emoji: '🐛', color: 'bg-green-200', restore: 15 },
            { name: '種子', emoji: '🌱', color: 'bg-brown-200', restore: 10 }
        ];

        const toys = [
            { name: '球', emoji: '⚽', color: 'bg-red-200', restore: 15 },
            { name: '鈴鐺', emoji: '🔔', color: 'bg-yellow-200', restore: 10 },
            { name: '羽毛', emoji: '🪶', color: 'bg-white', restore: 20 }
        ];
        // 🎒 探險獎勵背包邏輯
let backpack = {};  // 背包資料，例如 { "羽毛": 2, "骨頭": 1 }
const dropTable = {
  '咕咕洞穴': ['羽毛', '種子', '蛋殼'],
  '神秘洞穴': ['水晶', '靈魂石', '毒菇'],
  '黑暗森林': ['骨頭', '黑羽', '詛咒種子']
};

// 🍽️🍽️🍽️🍽️ 食物 / 玩具 / 造型資料定義區 END 🍽️🍽️🍽️🍽️

function showSpeechBubble(text) {


  speechBubble.textContent = text;
  speechBubble.style.opacity = '1';

  // 計算氣泡寬度與螢幕限制
  setTimeout(() => {
    const bubbleRect = speechBubble.getBoundingClientRect();
    const containerRect = chickenContainer.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // 氣泡超出左邊界
    if (bubbleRect.left < 10) {
      const offset = 10 - bubbleRect.left;
      speechBubble.style.left = `calc(50% + ${offset}px)`;
    }

    // 氣泡超出右邊界
    if (bubbleRect.right > screenWidth - 10) {
      const offset = bubbleRect.right - (screenWidth - 10);
      speechBubble.style.left = `calc(50% - ${offset}px)`;
    }
  }, 10);  // 等待 DOM 更新位置後再判斷

  setTimeout(() => {
    speechBubble.style.opacity = '0';
    speechBubble.style.left = '50%';  // 回到原始置中狀態
  }, 5000);
}

 async function randomTalk(type) {

  const now = Date.now();
  if (now - lastTalkTime < talkCooldown) return;
  lastTalkTime = now;

  try {
    const characterName = pet.spriteName;
    const promptUrl = "https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getPrompt&name=" + characterName;
    
    const promptRes = await fetch(promptUrl);
    const promptData = await promptRes.json();
    const personalityPrompt = promptData.prompt || "你是一隻電子寵物，請根據情境說一句話：";
   

    // 根據當下狀態給 Gemini 題目
    const statusMap = {
      hungry: "你現在肚子很餓。",
      tired: "你覺得有點累。",
      playing: "你正在玩耍。",
      eating: "你正在吃東西。",
      sleeping: "你在睡覺。",
      wake: "你剛醒來。",
      bored: "你覺得有點無聊。",
      dirty: "你覺得身上髒髒的。",
      normal: "你目前感覺很好。",
      walk: "你正在自由走動。",
      explore: "你正在冒險探索。",
     };
    const statusText = statusMap[type] || "請你說一句話。";

    // 天氣描述
    const weatherMap = {
      sunny: "現在是晴天，陽光普照。",
      rainy: "外面正在下雨。",
      hot: "天氣很炎熱。",
      storm:"打雷啦，有點怕。",
      night: "現在是晚上，天色昏暗。"
    };
    const weatherText = weatherMap[pet.weather] || "";

    // 組合最終描述
    const situation = `${statusText}${weatherText}`;

    const bodyData = {
      contents: [
        {
          parts: [
            { text: personalityPrompt },
            { text: "情境描述：" + situation }
          ]
        }
      ]
    };

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      showSpeechBubble(reply);
    } else {
      throw new Error("Gemini 回傳空值");
    }

  } catch (err) {
    console.warn("⚠️ Gemini 失敗，改用試算表資料：", err);

    // ✅ 備援機制：抓試算表裡的對話內容
    if (petSpeech[type] && petSpeech[type].length > 0) {
      const fallbackMsg = petSpeech[type][Math.floor(Math.random() * petSpeech[type].length)];
      showSpeechBubble(fallbackMsg);
    } else {
      showSpeechBubble("......（沉默）");
    }
  }
}



function checkEvolution() {
  const possibleEvolutions = evolutionData.filter(evo =>
    evo.evolve_from === pet.spriteName &&
    !isNaN(parseInt(evo.level)) &&
    pet.level >= parseInt(evo.level)
  );

  if (possibleEvolutions.length > 0) {
    let total = 0;
    const weightedList = [];

    for (let evo of possibleEvolutions) {
      const weight = parseFloat(evo.chance) || 0;
      total += weight;
      weightedList.push({ evo, weight: total });
    }

    const rand = Math.random() * total;
    const selected = weightedList.find(e => rand < e.weight).evo;

    // ✅ 執行進化
    pet.spriteName = selected.name;
    pet.stage = parseInt(selected.stage);
    chicken.style.backgroundImage = `url('${selected.image}')`;
    addLog(`角色進化為：${selected.name}`);
    saveGame();
  }
}


function updateChickenSprite() {
  if (!evolutionData || evolutionData.length === 0) {
    console.warn("⚠️ 無法更新角色圖片：evolutionData 尚未載入");
    return;
  }

  const matched = evolutionData.find(evo => evo.name === pet.spriteName);
  if (matched && matched.image) {
    chicken.style.backgroundImage = `url('${matched.image}')`;
  } else {
    chicken.style.backgroundImage = `url('https://i.imgur.com/oxsoI8H.png')`; // 預設蛋圖
  }
}



function pickEvolutionByChance(evolutions) {
  let total = 0;
  const weighted = [];

  for (let evo of evolutions) {
    const weight = parseFloat(evo["chance"]) || 0;
    total += weight;
    weighted.push({ evo, weight: total });
  }

  const rand = Math.random() * total;
  return weighted.find(e => rand < e.weight).evo;
}







// 📦📦📦📦📦 DOM 元素快取區 START 📦📦📦📦📦
        // 🐔 角色相關元素
const chickenContainer = document.getElementById('chicken-container'); // 包裹雞的整體容器（用於移動定位）
const chicken = document.getElementById('chicken'); // 實際顯示雞的圖像元素

// 💬 對話泡泡
const speechBubble = document.getElementById('speech-bubble'); // 顯示對話內容的泡泡

// 🏞️ 遊戲區域與背景
const petArea = document.getElementById('pet-area'); // 寵物活動的主區域（背景）

// 📊 狀態條區塊
const hungerBar = document.getElementById('hunger-bar'); // 飢餓度條
const happinessBar = document.getElementById('happiness-bar'); // 快樂度條
const energyBar = document.getElementById('energy-bar'); // 精力度條
const cleanlinessBar = document.getElementById('cleanliness-bar'); // 清潔度條

// 📈 狀態條數值顯示
const hungerValue = document.getElementById('hunger-value'); // 飢餓數值
const happinessValue = document.getElementById('happiness-value'); // 快樂數值
const energyValue = document.getElementById('energy-value'); // 精力數值
const cleanlinessValue = document.getElementById('cleanliness-value'); // 清潔數值

// 🧬 等級與年齡顯示
const levelDisplay = document.getElementById('level'); // 等級顯示
const statusDisplay = document.getElementById('status'); // 當前狀態（如睡覺中等）

// 📜 遊戲日誌
const log = document.getElementById('log'); // 顯示遊戲歷程記錄的區塊

// 🍽️ 按鈕操作：互動功能
const feedBtn = document.getElementById('feed-btn'); // 餵食按鈕
const playBtn = document.getElementById('play-btn'); // 玩耍按鈕
const cleanBtn = document.getElementById('clean-btn'); // 清潔按鈕
const sleepBtn = document.getElementById('sleep-btn'); // 睡覺按鈕
const renameBtn = document.getElementById('rename-btn'); // 改名按鈕
const logDrawer = document.getElementById('log-drawer');
const logControls = document.getElementById('log-controls');

// 點擊查看日誌按鈕，切換 log-open 狀態
document.getElementById('toggle-log-btn').addEventListener('click', () => {
  document.body.classList.toggle('log-open');
  document.body.classList.remove('chat-open'); // 確保聊天室關閉
});

// 點擊聊天室按鈕，切換 chat-open 狀態
document.getElementById('chat-toggle-btn').addEventListener('click', () => {
  document.body.classList.toggle('chat-open');
  document.body.classList.remove('log-open'); // 確保日誌關閉
});

// 📌 點擊聊天室內的「X 按鈕」，關閉聊天室視窗
document.getElementById("close-chat-btn").addEventListener("click", () => {
  // ➖ 關閉聊天室，只需移除 chat-open class
  document.body.classList.remove("chat-open");
});

document.getElementById('send-btn').addEventListener('click', async function () {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const chatBox = document.getElementById('chat-messages');
  chatBox.innerHTML += `<p>你：${msg}</p>`;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const thinking = document.createElement('p');
  thinking.textContent = `寵物：思考中...`;
  chatBox.appendChild(thinking);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const characterName = pet.spriteName; // 可以改成變數 later
    const promptUrl = "https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getPrompt&name=" + characterName;

    const promptRes = await fetch(promptUrl);
    const promptData = await promptRes.json();
    const petPrompt = promptData.prompt || "你是一隻友善的電子寵物，請回答以下訊息：";

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    const bodyData = {
      contents: [
        {
          parts: [
            { text: petPrompt },
            { text: "玩家說：" + msg }
          ]
        }
      ]
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    thinking.remove();

    const petReply = data.candidates?.[0]?.content?.parts?.[0]?.text || '嗯？我剛剛打瞌睡了...再說一次好嗎？';
    chatBox.innerHTML += `<p>寵物：${petReply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (error) {
    thinking.remove();
    chatBox.innerHTML += `<p style="color:red">❌ 發送失敗：${error.message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});




// 💤 睡覺動畫
const zzzContainer = document.getElementById('zzz-container'); // 存放 ZZZ 動畫的小容器

// 💩 大便容器
const poopContainer = document.getElementById('poop-container'); // 存放寵物大便的容器

const petNameDisplay = document.getElementById('pet-name-display'); // 主介面上顯示的寵物名稱

// ✏️ 命名/改名模態框
const nameModal = document.getElementById('name-modal'); // 命名視窗
const renameModal = document.getElementById('rename-modal'); // 改名視窗
const petNameInput = document.getElementById('pet-name-input'); // 命名輸入框
const renameInput = document.getElementById('rename-input'); // 改名輸入框
const confirmNameBtn = document.getElementById('confirm-name-btn'); // 確認命名按鈕
const confirmRenameBtn = document.getElementById('confirm-rename-btn'); // 確認改名按鈕


// 📦📦📦📦📦 DOM 元素快取區 END 📦📦📦📦📦

function fetchPlayerRecord(playerId) {
  fetch("https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getPlayer&playerId=${playerId}")
    .then(response => response.json())
    .then(playerData => {
      if (playerData.error) {
        console.warn("⚠️ 找不到玩家資料，可能是第一次登入");
        return;
      }

      Object.assign(pet, playerData);  // ✅ 把資料寫入你的 pet 物件
      updateChickenSprite();          // ✅ 更新圖片
      updateStatusBars();             // ✅ 更新狀態條
      updateNameDisplay();            // ✅ 更新名稱
      console.log("✅ 玩家資料載入成功", playerData);
    })
    .catch(err => {
      console.error("❌ 玩家資料載入失敗", err);
    });
}


// 🛌🛌🛌🛌🛌 睡眠控制邏輯 START 🛌🛌🛌🛌🛌
        function updateSleepButton() {
            if (pet.isSleeping) {
                sleepBtn.innerHTML = '<i class="fas fa-sun mr-1"></i> 叫醒';
            } else {
                sleepBtn.innerHTML = '<i class="fas fa-moon mr-1"></i> 睡覺';
            }
        }
        // 睡覺/醒來
        function toggleSleep() {
            if (pet.isDead) return;
            
            if (pet.isEating || pet.isPlaying) {
               randomTalk('sleeping');  // 睡著
               randomTalk('wake');      // 醒來 

                return;
            }
            
            pet.isSleeping = !pet.isSleeping;
            updateSleepButton();
            
            if (pet.isSleeping) {
                chicken.classList.add('sleeping');
               randomTalk('sleeping');  // 睡著

                addLog(`${pet.name}睡覺了`);
                
                // 顯示ZZZ動畫
                startZzz();
            } else {
                chicken.classList.remove('sleeping');
                randomTalk('wake');      // 醒來
                addLog(`${pet.name}醒來了`);
                
                // 清除ZZZ動畫
                clearZzz();
            }
            
            saveGame();
        }

        // 開始ZZZ動畫
        function startZzz() {
            clearZzz();
            zzzContainer.classList.remove('hidden');
            
            // 創建3個ZZZ
            for (let i = 0; i < 3; i++) {
                const zzz = document.createElement('div');
                zzz.className = 'zzz';
                zzz.textContent = 'Z';
                zzz.style.left = `${i * 10}px`;
                zzz.style.animationDelay = `${i * 0.5}s`;
                zzzContainer.appendChild(zzz);
            }
        }

        // 清除ZZZ動畫
        function clearZzz() {
            zzzContainer.innerHTML = '';
            zzzContainer.classList.add('hidden');
        }
// 🛌🛌🛌🛌🛌 睡眠控制邏輯 END 🛌🛌🛌🛌🛌
function showBackpack() {
  const backpackModal = document.getElementById('backpack-modal');
  const backpackItems = document.getElementById('backpack-items');
  backpackItems.innerHTML = ''; // 清空舊內容

  if (!backpack || Object.keys(backpack).length === 0) {
    backpackItems.innerHTML = '<p class="col-span-6 text-2xl text-center text-gray-500">目前背包是空的</p>';
    backpackModal.style.display = 'flex';
    return;
  }

  // 展平所有物品為一格一格（每個最多99，超過要拆分成多格）
  const slots = [];
  for (const [itemName, count] of Object.entries(backpack)) {
    let remaining = count;
    while (remaining > 0) {
      const stack = Math.min(99, remaining);
      slots.push({ name: itemName, count: stack });
      remaining -= stack;
    }
  }

  // 渲染格子（每頁30格）
  const totalSlots = Math.max(slots.length, 30);
  for (let i = 0; i < totalSlots; i++) {
    const slot = slots[i];
    const slotDiv = document.createElement('div');
    slotDiv.className = 'backpack-slot';

    if (slot) {
      slotDiv.textContent = slot.name;
      const countSpan = document.createElement('span');
      countSpan.className = 'item-count';
      countSpan.textContent = slot.count;
      slotDiv.appendChild(countSpan);
    }

    backpackItems.appendChild(slotDiv);
  }

  backpackModal.style.display = 'flex';
}

function saveToSheet() {
  const playerId = localStorage.getItem('playerId');
  if (!playerId) return;

  const data = {
    playerId: playerId,
    petName: pet.name,
    spriteName: pet.spriteName,
    level: pet.level,
    exp: pet.exp,
    coins: pet.coins || 0, // 如果沒 coins 屬性就設 0
    hunger: pet.hunger,
    happy: pet.happiness, // 這邊你的欄位是 happy，不是 happiness
    energy: pet.energy,
    clean: pet.cleanliness, // clean 對應 cleanliness
    isSick: pet.isSick || false, // 預設為 false
    weather: pet.weather || "sunny",
    backpack: JSON.stringify(backpack || {}),
    lastUpdate: new Date().toLocaleString()
  };

  fetch('https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=savePlayer', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(txt => console.log("✅ 玩家資料已儲存到試算表", txt))
    .catch(err => console.error("❌ 儲存失敗", err));
}


// 📀📀📀📀📀 儲存與載入功能 START 📀📀📀📀📀
     function saveGame() {
  const now = Date.now();
  pet.lastSaveTime = now;

  const gameData = {
    pet: pet,
    logs: Array.from(log.children).map(el => el.textContent).slice(0, 20) // 保存最近的20條日誌
  };

  localStorage.setItem('virtualPetChicken', JSON.stringify(gameData));

  // ✅ 同步儲存到 Google 試算表
  saveToSheet();
}
        // 加載遊戲
        function loadGame() {
            const savedData = localStorage.getItem('virtualPetChicken');
            if (savedData) {
                try {
                    const gameData = JSON.parse(savedData);
                    
                    // 恢復寵物狀態
                    Object.assign(pet, gameData.pet);
                    updateChickenSprite(); // ✅ 加這一行，根據 spriteName 套用對應角色圖片
                    
                    // 恢復日誌
                    log.innerHTML = '';
                    if (gameData.logs && gameData.logs.length > 0) {
                        gameData.logs.forEach(msg => {
                            const logEntry = document.createElement('p');
                            logEntry.textContent = msg;
                            log.appendChild(logEntry);
                        });
                    } else {
                        addLog("歡迎回來！");
                    }
                    
                    // 計算離線時間
                    const offlineTime = Date.now() - pet.lastSaveTime;
                    if (offlineTime > 60000) { // 超過1分鐘才計算
                        const offlineHours = Math.floor(offlineTime / 3600000);
                        const offlineMinutes = Math.floor((offlineTime % 3600000) / 60000);
                        
                        if (offlineHours > 0 || offlineMinutes > 0) {
                            addLog(`你離開了 ${offlineHours > 0 ? offlineHours + '小時' : ''}${offlineMinutes}分鐘`);
                        }
                    }
                    
                    // 根據離線時間更新狀態
                    updateOfflineStatus(offlineTime);
                    
                } catch (e) {
                    console.error("加載遊戲失敗:", e);
                    addLog("加載保存的遊戲失敗，開始新遊戲");
                    localStorage.removeItem('virtualPetChicken'); // 移除壞資料避免下次再跳錯
                }
            }
        }
        // 更新離線狀態
        function updateOfflineStatus(offlineTime) {
            if (pet.isDead) return;
            
            const hoursOffline = offlineTime / 3600000;
            const minutesOffline = offlineTime / 60000;
            
            // 飢餓度下降 (每10分鐘下降1%)
            const hungerDecrease = Math.min(100, Math.floor(minutesOffline / 10));
            pet.hunger = Math.max(0, pet.hunger - hungerDecrease);
            
            // 快樂度下降 (每小時下降5%)
            const happinessDecrease = Math.min(100, Math.floor(hoursOffline * 5));
            pet.happiness = Math.max(0, pet.happiness - happinessDecrease);
            
            // 精力變化 (睡覺時恢復，否則下降)
            if (pet.isSleeping) {
                const energyIncrease = Math.min(100, Math.floor(minutesOffline * 0.5)); // 每分鐘恢復0.5%
                pet.energy = Math.min(100, pet.energy + energyIncrease);
            } else {
                const energyDecrease = Math.min(100, Math.floor(minutesOffline / 15)); // 每15分鐘下降1%
                pet.energy = Math.max(0, pet.energy - energyDecrease);
            }
            
            // 清潔度下降 (每20分鐘下降1%)
            const cleanlinessDecrease = Math.min(100, Math.floor(minutesOffline / 20));
            pet.cleanliness = Math.max(0, pet.cleanliness - cleanlinessDecrease);
            
            
            updateStatusBars();
        }       
        
 // 📀📀📀📀📀 儲存與載入功能 END 📀📀📀📀📀

      


// 🐔🐔🐔🐔🐔 成長與邏輯 START 🐔🐔🐔🐔🐔      
        // 年齡增長
        function agePet() {
            if (pet.isDead) return;
            
            pet.age++;
            
            // 檢查是否成長
            if (pet.age === 1 && pet.growthStage === 0) {
                // 孵化
                pet.growthStage = 1;
                updateChickenSprite();
               randomTalk('wake')

                addLog(`雞蛋孵化了！${pet.name}誕生了！`);
            } else if (pet.age === 3 && pet.growthStage === 1) {
                // 長大
                pet.growthStage = 2;
                updateChickenSprite();
               randomTalk('walk')

                addLog(`${pet.name}長成了一隻成年雞！`);
            } else if (pet.age % 7 === 0 && pet.growthStage === 2) {
                // 升級
                pet.level++;
                randomTalk('walk')

                addLog(`${pet.name}升級了！現在是等級 ${pet.level}`);
            }
            
            updateStatusBars();
            saveGame();
        }
// 🐔🐔🐔🐔🐔 成長與邏輯 END 🐔🐔🐔🐔🐔

function gainExp(amount) {
  pet.exp += amount;

  while (pet.exp >= pet.maxExp) {
    pet.exp -= pet.maxExp;
    pet.level += 1;
    pet.maxExp = 100 + (pet.level - 1) * 50;
    addLog(`升級了！目前等級：${pet.level}`);
    levelDisplay.textContent = pet.level;
  }

  updateExpRing(pet.exp, pet.maxExp);
  saveGame();
}

function updateExpRing(currentExp, maxExp) {
  const percentage = (currentExp / maxExp) * 100;
  const dash = percentage.toFixed(2);
  const ring = document.getElementById("exp-ring");
  ring.setAttribute("stroke-dasharray", `${dash} 100`);
}



// 📢📢📢📢📢 日誌與對話 START 📢📢📢📢📢
 // 顯示對話泡泡
        // 添加日誌
        function addLog(message) {
            const logEntry = document.createElement('p');
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            log.appendChild(logEntry);
            log.scrollTop = log.scrollHeight;
            
            // 限制日誌數量
            if (log.children.length > 20) {
                log.removeChild(log.children[0]);
            }
        }
// ✅ 探險主程式：進入洞穴
function startExploration(place) {
  document.getElementById('explore-modal').style.display = 'none';
  document.body.classList.add('exploring');
  addLog(`${pet.name} 前往 ${place} 探險中...`);

  // ✅ 改這一行：用 Gemini 說話而不是表格
  randomTalk('explore');

  switch (place) {
    case '咕咕洞穴':
      petArea.style.backgroundImage = "url('https://i.imgur.com/kc15Z8F.png')";
      break;
    case '神秘洞穴':
      petArea.style.backgroundImage = "url('https://i.imgur.com/pAeHXzQ.png')";
      break;
    case '黑暗森林':
      petArea.style.backgroundImage = "url('https://i.imgur.com/bEyKtwO.png')";
      break;
  }

  petArea.style.backgroundSize = 'cover';
  petArea.style.backgroundPosition = 'center';

  pet.position.x = window.innerWidth / 2;
  pet.position.y = window.innerHeight / 2;
  updatePosition();
  startExplorationMove();
}
// ✅ 關閉洞穴選單（還沒探險前）
function closeExploreModal() {
  document.getElementById('explore-modal').style.display = 'none';
}
// ✅ 探險結束，恢復原狀
function endExploration() {
  stopExplorationMove();  // 停止走動
  const drops = getExploreRewards();  // 探險掉落
  showRewardModal(drops);  // 顯示獎勵模態框

  // ✅ 停止左右移動
  stopExplorationMove();

  // ✅ 回復原本背景（根據天氣重設）
  updateWeather();
}
// ✅ 探險中的角色左右自動移動
let exploreInterval = null;



function showRewardModal(drops) {
  const modal = document.getElementById('explore-reward-modal');
  const rewardBox = document.getElementById('reward-items');
  rewardBox.innerHTML = drops.map(item => `🎁 ${item}`).join('<br>');
  modal.style.display = 'flex';
}


function startExplorationMove() {
  if (exploreInterval) return;

  let movingRight = true;
  exploreInterval = setInterval(() => {
    const areaWidth = petArea.clientWidth;

    if (movingRight) {
      pet.direction = 1;
      pet.position.x += 50;
      if (pet.position.x >= areaWidth - 100) movingRight = false;
    } else {
      pet.direction = -1;
      pet.position.x -= 50;
      if (pet.position.x <= 100) movingRight = true;
    }

    chicken.classList.add('walking');
    updatePosition();
    setTimeout(() => chicken.classList.remove('walking'), 400);

    // ✅ 改這一行：改成 Gemini 說話
    if (Math.random() > 0.5) {
      randomTalk('explore');
    }
  }, 1000);
}


function getExploreRewards() {
  const place = getCurrentExplorePlace();
  const table = dropTable[place] || [];
  const result = [];

  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
    const item = table[Math.floor(Math.random() * table.length)];
    result.push(item);
    backpack[item] = Math.min(99, (backpack[item] || 0) + 1);
  }
  return result;
}

function getCurrentExplorePlace() {
  const bg = petArea.style.backgroundImage;
  if (bg.includes("kc15Z8F")) return '咕咕洞穴';
  if (bg.includes("pAeHXzQ")) return '神秘洞穴';
  if (bg.includes("bEyKtwO")) return '黑暗森林';
  return '未知地點';
}

function showRewardModal(drops) {
  const modal = document.getElementById('explore-reward-modal');
  const rewardBox = document.getElementById('reward-items');
  rewardBox.innerHTML = drops.map(item => `🎁 ${item}`).join('<br>');
  modal.style.display = 'flex';
}



function stopExplorationMove() {
  clearInterval(exploreInterval);
  exploreInterval = null;
}
function confirmReward() {
  document.getElementById('explore-reward-modal').style.display = 'none';
  updateWeather(); // 還原背景
  document.body.classList.remove('exploring'); // 離開探險模式
  addLog(`${pet.name} 把獲得的寶物放進背包`);
  gainExp(200000); // 探險結束後增加 20 經驗值（可依情況調整）
  saveGame();
}
function closeBackpack() {
  document.getElementById('backpack-modal').style.display = 'none';
}


// 📢📢📢📢📢 日誌與對話 END 📢📢📢📢📢
        // 更新寵物狀態
        function updatePetStatus() {
            if (pet.isDead) return;
            
            const now = Date.now();
            
            // 飢餓度下降 (每10分鐘下降1%)
            if (now - pet.lastHungerDecrease > 600000) {
                pet.hunger = Math.max(0, pet.hunger - 1);
                pet.lastHungerDecrease = now;
            }
            
            // 快樂度下降
            if (now - pet.lastHappinessDecrease > 5000 && !pet.isSleeping) {
                pet.happiness = Math.max(0, pet.happiness - 1);
                pet.lastHappinessDecrease = now;
            }
            
            // 精力下降或恢復
            if (pet.isSleeping) {
                if (now - pet.lastEnergyDecrease > 2000) {
                    pet.energy = Math.min(100, pet.energy + 2);
                    pet.lastEnergyDecrease = now;
                }
            } else {
                // 每15分鐘下降1%
                if (now - pet.lastEnergyDecrease > 900000) {
                    pet.energy = Math.max(0, pet.energy - 1);
                    pet.lastEnergyDecrease = now;
                }
            }
            
            // 清潔度下降 (每20分鐘下降1%)
            if (now - pet.lastCleanlinessDecrease > 1200000) {
                pet.cleanliness = Math.max(0, pet.cleanliness - 1);
                pet.lastCleanlinessDecrease = now;
            }
            

            updateStatusBars();
            
            // 每5分鐘自動保存一次
            if (now - pet.lastSaveTime > 300000) {
                saveGame();
            }
        }

       
// 🧼🧼🧼🧼🧼 玩家互動功能區 START 🧼🧼🧼🧼🧼
        // 餵食
        function feedPet() {
            if (pet.isDead) return;
            
            if (pet.isSleeping) {
                randomTalk('eating');
                return;
            }
            
            if (pet.isEating) {
                randomTalk('eating');
                return;
            }
            
            pet.isEating = true;
            chicken.classList.add('eating');
            randomTalk('eating');
            
            // 生成食物
            spawnFood();
            
            setTimeout(() => {
                pet.hunger = Math.min(100, pet.hunger + 20);
                pet.isEating = false;
                chicken.classList.remove('eating');
                updateStatusBars();
                addLog(`你餵了${pet.name}`);
                saveGame();
            }, 2000);
        }

        // 玩耍
        function playWithPet() {
            if (pet.isDead) return;
            
            if (pet.isSleeping) {
               randomTalk('playing');
                return;
            }
            
            if (pet.isPlaying) {
                randomTalk('playing');

                return;
            }
            
            pet.isPlaying = true;
            chicken.classList.add('playing');
            randomTalk('playing');

            
            // 生成玩具
            spawnToy();
            
            setTimeout(() => {
                pet.happiness = Math.min(100, pet.happiness + 20);
                pet.energy = Math.max(0, pet.energy - 3); // 每次玩耍減少3%精力
                pet.isPlaying = false;
                chicken.classList.remove('playing');
                updateStatusBars();
                addLog(`你和${pet.name}玩耍了`);
                saveGame();
            }, 2000);
        }

        // 清潔
        function cleanPet() {
            if (pet.isDead) return;
            
            if (pet.isSleeping) {
               randomTalk('dirty');

                return;
            }
            
            randomTalk('dirty');
            pet.cleanliness = 100;
            
            // 清除所有大便
            poopContainer.innerHTML = '';
            
            updateStatusBars();
            addLog(`你清潔了${pet.name}`);
            saveGame();
        }
// 🧼🧼🧼🧼🧼 玩家互動功能區 END 🧼🧼🧼🧼🧼

// 🌐 載入對角色資料
let evolutionData = [];

function loadEvolutionData() {
  fetch("https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getEvolution")
    .then(response => response.json())
    .then(data => {
      evolutionData = data;
       console.log("✅ 進化資料已載入", loadEvolutionData);
  })
    .catch(err => console.error("進化資料載入失敗", err));
}


// 🌐 載入對話資料
let petSpeech = {};
fetch("https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getPetSpeech")
  .then(response => response.json())
  .then(data => {
    petSpeech = data;
    console.log("✅ 對話內容已載入", petSpeech);
  })
  .catch(error => {
    console.error("❌ 載入說話資料失敗", error);
  });


document.getElementById('login-btn').addEventListener('click', () => {
  const input = document.getElementById('player-id-input');
  const id = input.value.trim();

  if (!id) {
    alert('請輸入玩家帳號');
    return;
  }

  localStorage.setItem('playerId', id);
  document.getElementById('login-modal').style.display = 'none';

  // 如果要馬上載入玩家資料
  fetchPlayerRecord(id);
});



 // 初始化網頁載入完成後要做的事情
window.onload = () => {
 const playerId = localStorage.getItem('playerId');

  if (!playerId) {
    // ⛔ 沒登入 → 顯示登入視窗
    document.getElementById('login-modal').style.display = 'flex';
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec?action=getEvolution")
    .then(response => response.json())
    .then(data => {
      evolutionData = data;
      console.log("✅ 進化資料已載入");
      initPet(); // ✅ 資料載入後才初始化遊戲
       fetchPlayerRecord(playerId); // 這是你第 5 步要寫的函式
    })
    
    .catch(err => console.error("進化資料載入失敗", err));
};

document.getElementById('weather-toggle').addEventListener('click', toggleWeather);
updateWeather();

document.getElementById('explore-btn').addEventListener('click', () => {
  if (pet.isDead) return;
  document.getElementById('explore-modal').style.display = 'flex';
});

document.getElementById('end-explore-btn').addEventListener('click', endExploration);

// ✅ 這行一定要加，先抓到按鈕
const bagBtn = document.getElementById('bag-btn');

// ✅ 點背包按鈕顯示背包
bagBtn.addEventListener('click', showBackpack);

// 在頁面關閉前保存遊戲
window.addEventListener('beforeunload', () => {
  saveGame();
});

// ✅ 重置按鈕
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm("你確定要重置遊戲嗎？這會清除所有進度！")) {
    localStorage.removeItem('virtualPetChicken');

    // 顯示 "重置中..."
    document.body.innerHTML = `
      <div style="color: white; background: black; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 48px;">
        重置中...
      </div>
    `;

    setTimeout(() => {
      // ✅ 換成重新導向首頁網址（你的 GAS 網址）
      window.location.href = "https://script.google.com/macros/s/AKfycbwqwRG4dE2luydPA5osamt3AMhoh2zNhuOOkXw-fiGj-QR2SDzxK5M_4FP5kDjlti8l/exec";
    }, 500);
  }
});
// ✅ 登入按鈕事件處理
document.getElementById('login-confirm-btn').addEventListener('click', () => {
  const input = document.getElementById('player-id-input');
  const playerId = input.value.trim();

  if (!playerId) {
    alert("請輸入帳號！");
    return;
  }

  localStorage.setItem('playerId', playerId);             // ✅ 存入本機帳號
  document.getElementById('login-modal').style.display = 'none'; // ✅ 關閉登入視窗
  window.location.reload();                                // ✅ 重新載入畫面，啟動 onload 初始化流程
});


