const socket = io();
let lang = "ky";
let avatar = "mickey.png";
const room = prompt("Бөлмө кодун киргиз:");
const player = Math.random() > 0.5 ? 1 : 2;

function setLang(l){ lang=l; }
function selectAvatar(file,event){
  avatar=file;
  document.querySelector(".avatars img.selected")?.classList.remove("selected");
  event.target.classList.add("selected");
}

function joinGame(){
  const name=document.getElementById("name").value || "Аты жок";
  socket.emit("joinRoom",{room,lang,name,avatar});
  document.getElementById("room").innerText=Салам ${name}! Бөлмө: ${room};
}

function sendAnswer(){
  const value=document.getElementById("answer").value;
  if(!value) return;
  socket.emit("answer",{room,answer:value,player});
  document.getElementById("answer").value="";
}

socket.on("players", list=>{
  if(!list[0]) list[0]={name:"Күтүү...",avatar:"mickey.png"};
  if(!list[1]) list[1]={name:"Күтүү...",avatar:"mickey.png"};
  document.getElementById("p1").innerHTML=<img src="avatars/${list[0].avatar}" class="player-avatar"> ${list[0].name};
  document.getElementById("p2").innerHTML=<img src="avatars/${list[1].avatar}" class="player-avatar"> ${list[1].name};
});

socket.on("question", q=>document.getElementById("question").innerText=q);
socket.on("rope", pos=>document.getElementById("rope").style.transform=translateX(${pos*18}px));

socket.on("result", p=>{
  const playerEl=p===1?document.getElementById("p1"):document.getElementById("p2");
  playerEl.classList.add("jump");
  new Audio('sounds/correct.mp3').play();
  setTimeout(()=>playerEl.classList.remove("jump"),600);
  document.getElementById("info").innerText=✅ Оюнчу ${p} туура жооп берди;
});

socket.on("wrong", p=>{
  const playerEl=p===1?document.getElementById("p1"):document.getElementById("p2");
  playerEl.classList.add("shake");
  new Audio('sounds/wrong.mp3').play();
  setTimeout(()=>playerEl.classList.remove("shake"),600);
});

socket.on("win", players=>{
  const list=Object.values(players);
  const winner=list[player-1];
  new Audio('sounds/win.mp3').play();
  alert(🏆 Жеңүүчү: ${winner.name});
  location.reload();
});