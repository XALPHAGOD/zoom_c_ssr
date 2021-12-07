const index = window.location.href.lastIndexOf("/");
history.replaceState({}, null, window.location.href.substring(0, index));
const videosContainer = document.getElementById("videos-container");
const chatBox = document.getElementById("chat-box");

const socket = io(); //socket connection
const peer = new Peer(undefined, {
  host: "/",
  path: "/peerjs",
  port: 3000, // or prod use 443
});

peer.on("open", (peerId) => {
  socket.emit("join-a-room", { roomId, user, peerId });
});

let myStream = null;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myStream = stream;
    const newVideo = document.createElement("div");
    addNewVideo(newVideo, stream, "Me");
  });

function addNewVideo(cont, stream, displayName) {
  const newVideo = document.createElement("video");
  newVideo.srcObject = stream;
  newVideo.classList.add("videoObj");
  newVideo.muted = true;
  newVideo.addEventListener("loadedmetadata", () => newVideo.play());
  const nameCont = document.createElement("div");
  nameCont.classList.add("videoName");
  nameCont.textContent = displayName;
  cont.classList.add("video-container");
  cont.appendChild(newVideo);
  cont.appendChild(nameCont);
  videosContainer.append(cont);
}

function appendChat(chat, user, align) {
  if (chat == "") return;
  const parent_container = document.createElement("div");
  const child_container = document.createElement("div");
  const userName = document.createElement("div");
  const chatMsg = document.createElement("div");
  userName.classList.add("chat-user");
  userName.textContent = user;
  chatMsg.textContent = chat;
  child_container.appendChild(userName);
  child_container.appendChild(chatMsg);
  parent_container.classList.add(align);
  parent_container.appendChild(child_container);
  chatBox.appendChild(parent_container);
  chatBox.scrollTo(0, chatBox.scrollHeight);
}

document.getElementById("chat-form").addEventListener("submit", (evt) => {
  evt.preventDefault();
  const chat = document.getElementById("chat");
  socket.emit("chat", {
    user,
    roomId,
    chat: chat.value,
  });
  appendChat(chat.value, "", "chat-right");
  chat.value = "";
});

socket.on("chat", (data) => appendChat(data.chat, data.user, "chat-left"));

const users = {};

socket.on("new-user", async ({ newUser, newUserPeerId }) => {
  const elem = document.createElement("div");
  elem.classList.add("text-center");
  elem.textContent = newUser + " joined";
  chatBox.appendChild(elem);

  const newVideo = document.createElement("div");
  const call = peer.call(newUserPeerId, myStream, {
    metadata: { user, peerId: peer.id },
  }); //my stream
  let flag = false;
  call.on("stream", (newUserStream) => {
    if (flag) return;
    flag = true;
    addNewVideo(newVideo, newUserStream, newUser);
  });
  users[newUserPeerId] = call;
  call.on("close", () => newVideo.remove());
});

socket.on("disconnected", ({ user, peerId }) => {
  if (users[peerId]) {
    users[peerId].close();
    users[peerId] = null;
    const elem = document.createElement("div");
    elem.classList.add("text-center");
    elem.textContent = user + " left";
    chatBox.appendChild(elem);
  }
});

peer.on("call", async (call) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  const newVideo = document.createElement("div");
  call.answer(myStream); // answer with my stream
  let flag = false;
  call.on("stream", (newUserStream) => {
    if (flag) return;
    flag = true;
    addNewVideo(newVideo, newUserStream, call.metadata.user);
    users[call.metadata.peerId] = call;
  });
  call.on("close", () => newVideo.remove());
});

function toggleMute() {
  myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
  const muteBtn = document.getElementById("mute-btn");

  if (myStream.getAudioTracks()[0].enabled)
    muteBtn.style.backgroundColor = "transparent";
  else muteBtn.style.backgroundColor = "red";
}

function toggleVideo() {
  myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
  const videoBtn = document.getElementById("video-btn");

  if (myStream.getVideoTracks()[0].enabled)
    videoBtn.style.backgroundColor = "transparent";
  else videoBtn.style.backgroundColor = "red";
}
