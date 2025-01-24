import { createElement } from '../utils/elements.js';
import { hideInteractiveElements, appendJoinMessage, appendLeaveMessage, appendUserMessage, typingLabel, typingUsernames, errorLabel,
	usernameLabel, startDialog } from './elements.js';

const // object types for the JSON objects going through the WebSocket
	USER_JOIN = 0,
	USER_MESSAGE = 1,
	USER_LEAVE = 2,
	ERR_USERNAME_TAKEN = 3,
	USER_TYPING = 4,
	USER_STOPPED_TYPING = 5;

/** @type {string} */
let username;

const ws = new WebSocket('wss://chat.trustytrojan.dev');

ws.onopen = startDialog.showModal.bind(startDialog);

ws.onmessage = ({ data }) => {
	const obj = JSON.parse(data.toString());

	switch (obj.type) {
		case USER_JOIN:
			if (obj.username === username) {
				startDialog.close();
				startDialog.style.display = 'none';
				usernameLabel.hidden = false;
				usernameLabel.innerHTML = `Your username: <b>${username}</b>`;
			}
			appendJoinMessage(obj);
			break;

		case USER_MESSAGE:
			appendUserMessage(obj);
			// if this user sent this message
			if (obj.sender === username)
				// move it into view no matter where their scroll is
				messagesView.lastElementChild?.scrollIntoView();
			break;

		case USER_LEAVE:
			appendLeaveMessage(obj);
			if (obj.username === username) {
				ws.close(1000, 'left the chat');
				hideInteractiveElements();
				usernameLabel.hidden = true;
				document.body.appendChild(createElement('b', { innerHTML: 'You have left the chat.' }));
			}
			break;

		case USER_TYPING:
			if (obj.username === username) break;
			typingLabel.show();
			typingUsernames.appendChild(createElement('b', {
				id: `typing-${obj.username}`,
				innerHTML: obj.username,
				className: 'typing-username'
			}));
			break;

		case USER_STOPPED_TYPING:
			const typingUsernameLabel = document.getElementById(`typing-${obj.username}`);
			if (typingUsernameLabel)
				typingUsernames.removeChild(typingUsernameLabel);
			if (typingUsernames.children.length == 0)
				typingLabel.hide();
			break;

		case ERR_USERNAME_TAKEN:
			errorLabel.textContent = 'Error: username already taken!';
			break;
	}
};

ws.onerror = (ev) => { if (ev.type === 'error') errorLabel.textContent = 'Error connecting to chat server!'; };

ws.onclose = () => {
	hideInteractiveElements();
	document.body.appendChild(createElement('b', { innerHTML: 'You were disconnected from the server.' }));
};

/**
 * @param {number} type 
 * @param {object} obj 
 */
const sendChatData = (type, obj = {}) => ws.send(JSON.stringify({ type, ...obj }));

export const sendTyping = () => sendChatData(USER_TYPING);
export const sendStoppedTyping = () => sendChatData(USER_STOPPED_TYPING);

/**
 * @param {string} _username
 * @param {string} _chatroom
 */
export const sendJoin = (_username) => {
	username = _username;
	sendChatData(USER_JOIN, { username });
};

/**
 * @param {string} chatroom 
 */
export const sendLeave = () => sendChatData(USER_LEAVE, { username });

/**
 * @param {string} content
 */
export const sendMessage = (content) => sendChatData(USER_MESSAGE, { content });