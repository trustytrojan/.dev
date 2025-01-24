import { createElement } from '../utils/elements.js';
import * as els from './search-elements.js';

const displaySearchResults = (results) => {
	for (const { title, channel, lengthText, thumbnails, id, live, viewsText } of results)
		els.searchResultsDiv.append(
			createElement('div', {
				className: 'search-result tt-border',
			}, [
				createElement('img', {
					src: thumbnails ? thumbnails[0].url : null,
					className: 'sr-thumbnail'
				}),
				createElement('div', { className: 'sr-metadata' }, [
					createElement('b', { innerHTML: title }),
					createElement('div', { innerHTML: channel.title }),
					createElement('div', { innerHTML: `${viewsText.short} • ${live ? 'live!' : lengthText}` }),
					createElement('div', { innerHTML: id, className: 'sr-id' }),
				]),
				createElement('div', { className: 'tt-vert sr-btns' }, [
					createElement('a', {
						className: 'tt-clickable',
						href: `/yt/dl?v=${id}`
					}, [createElement('img', { src: '/res/img/download-icon.png' })]),
					createElement('a', {
						className: 'tt-clickable',
						href: `https://youtu.be/${id}`
					}, [createElement('img', { src: 'https://youtube.com/s/desktop/375de707/img/favicon_32x32.png' })])
				])
			])
		);
};

const baseUrl = 'https://api.trustytrojan.dev/yt';
let nextPageCtx;

export const search = async () => {
	els.loadingDiv.hidden = false;
	els.searchResultsDiv.replaceChildren();
	const url = `${baseUrl}/search/?q=${encodeURIComponent(els.ytSearchInput.value)}&type=video`;
	let results;
	({ results, nextPageCtx } = await (await fetch(url)).json());
	displaySearchResults(results);
	document.getElementById('sr-container').style.display = 'flex';
	els.loadingDiv.hidden = true;
};

export const nextPage = async () => {
	const url = baseUrl + '/search/nextpage';
	const init = {
		method: 'POST',
		body: JSON.stringify(nextPageCtx),
		headers: { 'Content-Type': 'application/json' }
	};
	let results;
	({ results, nextPageCtx } = await (await fetch(url, init)).json());
	displaySearchResults(results);
};