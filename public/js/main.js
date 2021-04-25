const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');



//get user and room
const {username, room} = Qs.parse(location.search,{
  ignoreQueryPrefix:true
});

//pesan konfirmasi user dari server
const socket = io();

socket.emit('joinRoom', {username, room});

//get room and users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users)

});

socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  //auto scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;
})

//pesan chat
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  
  //mengirim pesan ke server
  socket.emit('chatMessage', msg );

  //clear input form
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();

});


//output ke html
function outputMessage(message){

  if(message.username==username){
    const div = document.createElement('div');
    div.classList.add('self');
    div.innerHTML = `
    <div class="self" style="float:right; width:100%;">
      <div class="message-self">
        <p class="meta">  <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
      </div>
    </div>

  `;
  document.querySelector('.chat-messages').appendChild(div);
  }
  else{
    const div = document.createElement('div');
    div.classList.add('another');
    div.innerHTML = `
    <div class="another" style="float:right; width:100%;">
      <div class="message">
        <p class="meta"><b>${message.username}</b>   <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
      </div>
    </div>
  `;
  document.querySelector('.chat-messages').appendChild(div);
  }

  
}


//add room name
function outputRoomName(room){
  roomName.innerText = room;
}

//add user list

function outputUsers(users){
  userList.innerHTML=`
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}