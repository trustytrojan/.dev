import { sendJoin, sendMessage, sendStoppedTyping, sendTyping } from './ws.js';
import { messageInput, usernameInput } from './elements.js';

/** @type {number} */
let stopTypingTimeout;

const stopTyping = () => {
	sendStoppedTyping();
	stopTypingTimeout = null;
};

messageInput.onkeydown = ({ key }) => {
	if (key !== 'Enter') return;
	clearTimeout(stopTypingTimeout);
	
	// send the message
	const content = messageInput.value;
	messageInput.value = '';
	if (!content.trim()) return;

	// TODO: FIGURE THIS OUT
	sendMessage(content);

	stopTyping();
};

messageInput.oninput = ({ target: { value } }) => {
	if (!value) // input is empty
		stopTyping();
	else {
		if (stopTypingTimeout)
			clearTimeout(stopTypingTimeout);
		else
			sendTyping();
		stopTypingTimeout = setTimeout(stopTyping, 1_500);
	}
};

window.joinChat = () => {
	const username = usernameInput.value;
	if (!username.trim()) { errorLabel.textContent = 'Error: username cannot be empty!'; return; }
	sendJoin(username);
};
