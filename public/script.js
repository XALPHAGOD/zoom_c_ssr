const index = window.location.href.lastIndexOf("/");
history.replaceState({}, null, window.location.href.substring(0, index));
const socket = io(); //socket connection
socket.on("connect", () => socket.emit("join-a-room", roomId));

const videosContainer = document.getElementById("videos-container");
const chatBox = document.getElementById("chat-box");

async function getUserMediaAccess() {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
    addNewVideo(stream);
  } catch (err) {
    console.log(err);
  }
}
getUserMediaAccess();

function addNewVideo(stream) {
  const newVideo = document.createElement("video");
  newVideo.srcObject = stream;
  newVideo.classList.add("videoObj");
  newVideo.muted = true;
  newVideo.addEventListener("loadedmetadata", () => newVideo.play());
  videosContainer.append(newVideo);
}

function appendChat(chat, user, align) {
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
}

document.getElementById("chat-form").addEventListener("submit", (evt) => {
  evt.preventDefault();
  const chat = document.getElementById("chat");
  socket.emit("chat", {
    user,
    roomId,
    chat: chat.value,
  });
  appendChat(chat.value, "Me", "chat-right");
  chat.value = "";
});

socket.on("new-user", (data) => console.log(data));
socket.on("chat", (data) => appendChat(data.chat, data.user, "chat-left"));
