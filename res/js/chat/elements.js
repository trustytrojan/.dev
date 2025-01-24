import { createElement } from '../utils/elements.js';

window.onresize = () => {
	document.body.style.height = innerHeight + 'px';
};

/** @type {HTMLDivElement} */
export const chatContainer = document.getElementById('chat-container');

/** @type {HTMLDivElement & { scrollToBottom: (_: ScrollBehavior) => void, scrollBottom: readonly number }} */
window.messagesView = document.getElementById('messages-view');

/** @param {ScrollBehavior} [behavior] */
messagesView.scrollToBottom = function(behavior) {
	this.scrollTo({ top: this.scrollHeight - this.clientHeight, behavior });
};

Object.defineProperty(messagesView, 'scrollBottom', {
	/**
	 * distance from the bottom of [`clientHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight)
	 * to the bottom of [`scrollHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)
	 */
	get: function() { return this.scrollHeight - this.scrollTop - this.clientHeight; }
});

export const newMessageIndicator = document.getElementById('nm-indicator');

/** @type {HTMLDialogElement} */
export const startDialog = document.getElementById('start-form');

/** @type {HTMLInputElement} */
export const usernameInput = document.getElementById('username-input');

/** @type {HTMLInputElement} */
export const messageInput = document.getElementById('message-input');

/** @type {HTMLDivElement} */
export const errorLabel = document.getElementById('error-label');

/** @type {HTMLDivElement} */
export const usernameLabel = document.getElementById('username-label');

/** @type {HTMLDivElement} */
export const typingLabel = document.getElementById('typing-label');
typingLabel.show = function() { this.style.opacity = 1; }
typingLabel.hide = function() { this.style.opacity = 0; }

/** @type {HTMLDivElement} */
export const typingUsernames = document.getElementById('typing-usernames');

export const hideInteractiveElements = () => {
	messageInput.hidden = true;
};

/**
 * @param {'user' | 'join' | 'leave'} type
 * @param {string} innerHTML
 */
const appendMessage = (type, innerHTML) => {
	const lastMessage = messagesView.lastElementChild;
	const oldScrollBottom = messagesView.scrollBottom;

	const newMessage = createElement('div', { className: `tt-border ${type}-msg`, innerHTML });
	messagesView.append(newMessage);

	if (messagesView.scrollHeight === messagesView.clientHeight)
		// return here if messagesView is not yet scrollable
		return;
	
	// if, before appending the new message, the most recent message was partially visible
	if (oldScrollBottom < lastMessage?.clientHeight)
		// force the scroll to the bottom
		newMessage.scrollIntoView();
	else
		// show the new message indicator
		newMessageIndicator.style.visibility = 'visible';
};

messagesView.onscrollend = () => {
	// if the distance from the bottom of the scroll view to the bottom of messagesView is less than 10 pixels
	if (messagesView.scrollBottom < 10)
		// hide the new message indicator
		newMessageIndicator.style.visibility = 'hidden';
};

export const appendUserMessage = ({ sender, content }) => appendMessage('user', `<b>${sender}</b><div>${content}</div>`);
export const appendJoinMessage = ({ username }) => appendMessage('join', `<b>${username}</b> has joined the chat`);
export const appendLeaveMessage = ({ username }) => appendMessage('leave', `<b>${username}</b> has left the chat`);
