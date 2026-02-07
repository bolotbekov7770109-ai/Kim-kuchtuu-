const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const questions = {
  ky: [
    { q: "2, 4, 8, ?", a: "16" },
    { q: "Кайсысы ашыкча: алма, банан, сабиз, алмурут?", a: "сабиз" },
    { q: "5 алманын экөөн берсең канча калат?", a: "3" }
  ],
  ru: [
    { q: "2, 4, 8, ?", a: "16" },
    { q: "Что лишнее: яблоко, банан, морковь, груша?", a: "морковь" },
    { q: "Если было 5 яблок и 2 отдал, сколько осталось?", a: "3" }
  ]
};

let rooms = {};

function randomQuestion(lang) {
  const list = questions[lang];
  return list[Math.floor(Math.random() * list.length)];
}

io.on("connection", socket => {

  socket.on("joinRoom", data => {
    const { room, lang, name, avatar } = data;
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        rope: 0,
        lang: lang,
        question: randomQuestion(lang),
        answered: false,
        players: {}
      };
    }

    rooms[room].players[socket.id] = { name, avatar };

    io.to(room).emit("players", Object.values(rooms[room].players));
    socket.emit("question", rooms[room].question.q);
    io.to(room).emit("rope", rooms[room].rope);
  });

  socket.on("answer", data => {
    const room = rooms[data.room];
    if (!room || room.answered) return;

    if (data.answer.toLowerCase().trim() === room.question.a.toLowerCase()) {
      room.answered = true;
      room.rope += data.player === 2 ? 1 : -1;

      io.to(data.room).emit("result", data.player);
      io.to