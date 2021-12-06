const express = require("express");
const path = require("path");
// const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = createServer(app);
const io = new Server(server);

// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("home", { room: "" }));
app.get("/:roomId", (req, res) =>
  res.render("home", { room: req.params.roomId })
);

app.post("/:user", (req, res) => {
  if (req.body.room) res.redirect(`/room/${req.body.room}/${req.params.user}`);
  else res.redirect(`/room/${uuidv4()}/${req.params.user}`);
});

app.get("/room/:roomID", (req, res) => res.redirect(`/${req.params.roomID}`));
app.get("/room/:roomID/:user", (req, res) =>
  res.render("room", { roomId: req.params.roomID, user: req.params.user })
);

io.on("connection", (socket) => {
  socket.on("join-a-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("new-user", socket.id);
  });
  socket.on("chat", (data) => {
    socket.to(data.roomId).emit("chat", data);
  });
});

server.listen(process.env.PORT || 3000);
