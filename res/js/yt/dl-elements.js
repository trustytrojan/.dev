/** @type {HTMLTableSectionElement} */
export const videoTb = document.getElementById('video-tb');

/** @type {HTMLTableSectionElement} */
export const audioTb = document.getElementById('audio-tb');

/** @type {HTMLTableSectionElement} */
export const avTb = document.getElementById('av-tb');

/** @type {HTMLInputElement} */
export const ytIdOrUrl = document.getElementById('yt-id-or-url');

export const details = Object.freeze({
	/** @type {HTMLAnchorElement} */
	root: document.getElementById('details-root'),

	/** @type {HTMLImageElement} */
	thumbnail: document.getElementById('details-thumbnail'),
	
	title: document.getElementById('details-title'),
	
	/** @type {HTMLDivElement} */
	channel: document.getElementById('details-channel'),
	
	/** @type {HTMLDivElement} */
	viewsLength: document.getElementById('details-views-length'),
});

/** @type {HTMLAnchorElement} */
export const hqBtn = document.getElementById('hq-btn');

/** @type {HTMLAnchorElement} */
export const hqvBtn = document.getElementById('hqv-btn');

/** @type {HTMLAnchorElement} */
export const hqaBtn = document.getElementById('hqa-btn');

/** @type {HTMLAnchorElement} */
export const dlButton = document.getElementById('dl-button');

/** @type {HTMLDivElement} */
export const everythingElse = document.getElementById('everything-else');

/** @type {HTMLDivElement} */
export const copiedPopup = document.getElementById('copied-popup');

/** @type {HTMLDivElement} */
export const loading = document.getElementById('loading');

/**
 * @param {MouseEvent} ev 
 */
copiedPopup.showAt = function(ev) {
	this.hidden = false;
	this.style.left = ev.pageX + 'px';
	this.style.top = ev.pageY + 'px';
	this.classList.add('cp-animation');
};
copiedPopup.onanimationend = function() {
	this.classList.remove('cp-animation');
	this.hidden = true;
};
