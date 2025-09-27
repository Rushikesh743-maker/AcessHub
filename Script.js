
// ========== Accessibility Toolbar ==========
let fontSize = 16;

document.addEventListener('DOMContentLoaded', () => {

  const easyRead = document.getElementById("easyRead");

  document.getElementById("increaseText").addEventListener("click", () => {
    fontSize += 2;
    document.body.style.fontSize = fontSize + "px";
  });

  document.getElementById("decreaseText").addEventListener("click", () => {
    fontSize = Math.max(12, fontSize - 2);
    document.body.style.fontSize = fontSize + "px";
  });

  document.getElementById("easyReadBtn").addEventListener("click", () => {
    easyRead.classList.toggle("hidden");
  });

  document.getElementById("contrastSelect").addEventListener("change", (e) => {
    document.body.classList.remove("high-contrast", "deuteranopia", "tritanopia");
    if (e.target.value !== "default") document.body.classList.add(e.target.value);
  });

  document.getElementById("fontSelect").addEventListener("change", (e) => {
    document.body.classList.remove("opendyslexic", "arial");
    if (e.target.value !== "default") document.body.classList.add(e.target.value);
  });

  // ========== Text-to-Speech ==========
  let synth = window.speechSynthesis, utter = null;
  const ttsTextContainer = document.getElementById("ttsText");

  function highlightTTS(text, container) {
    if (synth.speaking) synth.cancel();
    container.innerHTML = "";
    const words = text.split(" ");
    let index = 0;
    utter = new SpeechSynthesisUtterance(text);
    utter.onboundary = function (e) {
      if (e.charIndex >= 0) {
        const chars = text.slice(0, e.charIndex);
        const currentWord = words[index] || "";
        container.innerHTML = text.replace(
          currentWord,
          `<mark>${currentWord}</mark>`
        );
        index++;
      }
    };
    synth.speak(utter);
  }

  document.getElementById("playTTS").addEventListener("click", () => {
    highlightTTS(ttsTextContainer.innerText, ttsTextContainer);
  });
  document.getElementById("pauseTTS").addEventListener("click", () => { if(synth.speaking) synth.pause(); });
  document.getElementById("stopTTS").addEventListener("click", () => { if(synth.speaking) synth.cancel(); });

  // ========== Maze Game ==========
  const mazeContainer = document.getElementById("mazeContainer");
  const mazeLevelEl = document.getElementById("mazeLevel");
  const mazeTimeEl = document.getElementById("mazeTime");
  const mazeScoreEl = document.getElementById("mazeScore");
  const mazeBadgesEl = document.getElementById("mazeBadges");

  let mazeLevel = 1, mazeScore = 0, mazeBadges = [], playerPos = {x:0,y:0}, maze=[], timer=0, timerInterval=null;

  const mazes = [
    [
      [0,1,0,0,0,1,0,0,0,0],
      [0,1,0,1,0,1,0,1,1,0],
      [0,0,0,1,0,0,0,0,1,0],
      [1,1,0,1,1,1,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,"F"],
      [0,1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,0]
    ],
    [
      [0,1,0,1,0,1,0,0,1,"F"],
      [0,1,0,1,0,1,0,1,1,1],
      [0,0,0,0,0,0,0,0,1,0],
      [1,1,1,1,1,1,1,0,1,0],
      [0,0,0,0,0,0,1,0,0,0],
      [0,1,1,1,1,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,1,0],
      [1,1,1,1,1,1,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,0]
    ],
    [
      [0,0,1,1,0,1,0,1,0,"F"],
      [1,0,1,1,0,1,0,1,0,1],
      [0,0,0,0,0,0,0,1,0,0],
      [0,1,1,1,1,1,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,0],
      [1,1,0,1,1,1,1,1,0,1],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,0]
    ]
  ];

  function initMaze(level){
    maze = JSON.parse(JSON.stringify(mazes[level-1]));
    playerPos = {x:0,y:0};
    mazeContainer.innerHTML="";
    mazeContainer.style.gridTemplateRows=`repeat(${maze.length},1fr)`;
    mazeContainer.style.gridTemplateColumns=`repeat(${maze[0].length},1fr)`;
    renderMaze();
    timer = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(()=>mazeTimeEl.textContent=++timer,1000);
    mazeLevelEl.textContent = mazeLevel;
  }

  function renderMaze(){
    mazeContainer.innerHTML="";
    for(let y=0;y<maze.length;y++){
      for(let x=0;x<maze[y].length;x++){
        const cell = document.createElement("div");
        cell.classList.add("maze-cell");
        const value = maze[y][x];
        if(value===1) cell.classList.add("wall");
        if(x===playerPos.x && y===playerPos.y){
          cell.classList.add("player");
          cell.textContent="👤";
        } else if(value==="F"){
          cell.classList.add("finish");
          cell.textContent="⭐";
        }
        mazeContainer.appendChild(cell);
      }
    }
  }

  function movePlayer(dx,dy){
    const newX=playerPos.x+dx, newY=playerPos.y+dy;
    if(newX<0||newY<0||newY>=maze.length||newX>=maze[0].length) return;
    if(maze[newY][newX]===1) return;
    playerPos={x:newX,y:newY};
    renderMaze();
    if(maze[newY][newX]==="F") finishLevel();
  }

  function finishLevel(){
    mazeScore+=10*mazeLevel;
    mazeScoreEl.textContent=mazeScore;
    mazeBadges.push(`Maze Level ${mazeLevel} Completed`);
    mazeBadgesEl.textContent=mazeBadges.join(", ");
    confetti({particleCount:150,spread:90,origin:{y:0.6}});
    clearInterval(timerInterval);
    if(mazeLevel<3){
      alert(`Level ${mazeLevel} completed! Next level.`);
      mazeLevel++;
      initMaze(mazeLevel);
    } else alert("🎉 You completed all maze levels!");
  }

  document.addEventListener("keydown",(e)=>{
    switch(e.key){
      case "ArrowUp": movePlayer(0,-1); break;
      case "ArrowDown": movePlayer(0,1); break;
      case "ArrowLeft": movePlayer(-1,0); break;
      case "ArrowRight": movePlayer(1,0); break;
    }
  });

  document.getElementById("voiceCommand").addEventListener("click",()=>{
    if(!("webkitSpeechRecognition" in window)){ alert("Voice recognition not supported."); return; }
    const recognition = new webkitSpeechRecognition();
    recognition.lang="en-US";
    recognition.continuous=true;
    recognition.start();
    recognition.onresult=(event)=>{
      const command=event.results[event.results.length-1][0].transcript.toLowerCase();
      if(command.includes("up")) movePlayer(0,-1);
      if(command.includes("down")) movePlayer(0,1);
      if(command.includes("left")) movePlayer(-1,0);
      if(command.includes("right")) movePlayer(1,0);
    }
  });

  // ========== Memory Game ==========
  const memoryGame=document.getElementById("memoryGame");
  const memorySymbols=["🔵","🔺","🟩","⭐","❤️","🌀"];
  let memoryCards=[...memorySymbols,...memorySymbols], flipped=[], matched=0;

  function initMemory(){
    memoryCards = [...memorySymbols, ...memorySymbols].sort(()=>Math.random()-0.5);
    memoryGame.innerHTML="";
    flipped=[]; matched=0;
    memoryCards.forEach((symbol,i)=>{
      const card=document.createElement("div");
      card.classList.add("memory-card");
      card.dataset.symbol=symbol;
      card.dataset.index=i;
      card.textContent="?";
      card.addEventListener("click",flipCard);
      memoryGame.appendChild(card);
    });
  }

  function flipCard(e){
    const card=e.target;
    if(flipped.length===2 || card.classList.contains("matched")) return;
    card.textContent=card.dataset.symbol;
    flipped.push(card);
    if(flipped.length===2){
      if(flipped[0].dataset.symbol===flipped[1].dataset.symbol){
        flipped.forEach(c=>c.classList.add("matched"));
        matched++;
        if(matched===memorySymbols.length) alert("🎉 Memory Game Completed!");
        flipped=[];
      } else {
        setTimeout(()=>{flipped.forEach(c=>c.textContent="?"); flipped=[];},800);
      }
    }
  }

  initMemory();
  initMaze(1);

  // ========== Voice Quiz ==========
  const quizBox=document.getElementById("quizBox");
  const quizBtn=document.getElementById("startQuiz");
  const quizQuestions=[
    {q:"Which is an accessibility feature?",a:"High Contrast Mode",b:"Complex Fonts",correct:"a"},
    {q:"Which helps colorblind users?",a:"Rainbow gradients",b:"Shape indicators",correct:"b"}
  ];
  let qIndex=0;

  quizBtn.addEventListener("click",()=>{qIndex=0; askQuestion(); startQuizVoice();});

  function askQuestion(){
    if(qIndex>=quizQuestions.length){ quizBox.innerHTML="<p>🎉 Quiz Completed!</p>"; return; }
    const q=quizQuestions[qIndex];
    quizBox.innerHTML=`<p>${q.q}</p><p>A) ${q.a}</p><p>B) ${q.b}</p>`;
  }

  function checkAnswer(ans){
    if(ans===quizQuestions[qIndex].correct){ quizBox.innerHTML+="<p>✅ Correct!</p>"; } 
    else { quizBox.innerHTML+="<p>❌ Wrong!</p>"; }
    qIndex++;
    setTimeout(askQuestion,1000);
  }

  function startQuizVoice(){
    if(!("webkitSpeechRecognition" in window)) return;
    const recognition=new webkitSpeechRecognition();
    recognition.lang="en-US";
    recognition.continuous=true;
    recognition.start();
    recognition.onresult=(event)=>{
      const command=event.results[event.results.length-1][0].transcript.toLowerCase();
      if(command.includes("option a")) checkAnswer("a");
      if(command.includes("option b")) checkAnswer("b");
    }
  }

  // ========== Community Stories ==========
  const storyForm=document.getElementById("storyForm");
  const storyInput=document.getElementById("storyInput");
  const storyList=document.getElementById("storyList");

  storyForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(!storyInput.value.trim()) return;
    const story=document.createElement("p");
    story.textContent="📝 "+storyInput.value;
    storyList.appendChild(story);
    storyInput.value="";
  });

});
