const socket = io();
let currentUserName = '';
let selectedUser = '';

// Set username and emit to server
document.getElementById('set-username').onclick = () => {
    const userNameInput = document.getElementById('username').value.trim();
    if (userNameInput) {
        currentUserName = userNameInput;
        socket.emit('setUsername', currentUserName);
        document.getElementById('username-modal').style.display = 'none';
        document.querySelector('.chat-container').style.display = 'flex';
    }
};

// Update user list when new users join
socket.on('userList', (users) => {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear current list
    users.forEach(user => {
        if (user !== currentUserName) { // Don't show the current user in the list
            const userItem = document.createElement('li');
            userItem.textContent = user;
            userItem.onclick = () => {
                openChat(user);
            };
            userList.appendChild(userItem);
        }
    });
});

// Function to open chat with a specific user
function openChat(user) {
    selectedUser = user;
    document.getElementById('chat-user').textContent = `Chat with ${user}`;

    // Hide all chat windows first
    const allChats = document.querySelectorAll('.chat-box');
    allChats.forEach(chat => chat.style.display = 'none');

    // Show the selected user's chat
    let chatBox = document.getElementById(`chat-box-${user}`);
    if (!chatBox) {
        // Create a new chat box if it doesn't exist
        chatBox = document.createElement('div');
        chatBox.classList.add('chat-box');
        chatBox.id = `chat-box-${user}`;
        document.querySelector('.chat-window').appendChild(chatBox);
    }
    chatBox.style.display = 'block';
    document.querySelector('.chat-input').style.display = 'flex'; // Show chat input
}

// Send private message
document.getElementById('send-message').onclick = () => {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();

    if (message && selectedUser) {
        // Display the message in the chat box
        const chatBox = document.getElementById(`chat-box-${selectedUser}`);
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'sent');
        newMessage.textContent = message;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Send message to the server for the selected user
        socket.emit('privateMessage', { recipient: selectedUser, message });
        messageInput.value = ''; // Clear input after sending
    }
};

// Receive private message
socket.on('privateMessage', ({ sender, message }) => {
    let chatBox = document.getElementById(`chat-box-${sender}`);
    if (!chatBox) {
        // Create a new chat box if it doesn't exist
        chatBox = document.createElement('div');
        chatBox.classList.add('chat-box');
        chatBox.id = `chat-box-${sender}`;
        document.querySelector('.chat-window').appendChild(chatBox);
    }

    const newMessage = document.createElement('div');
    newMessage.classList.add('message', 'received');
    newMessage.textContent = `${sender}: ${message}`;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Logout functionality
document.getElementById('logout').onclick = () => {
    location.reload(); // Reload the page to reset
};

// Handle username taken event
socket.on('usernameTaken', () => {
    alert('Username is already taken. Please click on logout button and choose another one.');
    document.getElementById('username').value = ''; // Clear the input
});
