import { createElement } from '../utils/elements.js';
import * as els from './search-elements.js';
import * as yts from '../yts/yt-search.js';

/**
 * @param {yts.VideoResult[]} results 
 */
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
					createElement('a', { href: `https://youtu.be/${id}`, innerHTML: `<b>${title}</b>` }),
					createElement('div', { innerHTML: channel.title }),
					createElement('div', {
						innerHTML: `${viewsText.short} • ${live ? 'live!' : lengthText}`,
						title: viewsText.long
					}),
					createElement('div', { innerHTML: id, className: 'sr-id' }),
				]),
				createElement('div', { className: 'tt-vert sr-btns' }, [
					createElement('a', {
						className: 'tt-clickable',
						href: `/yt/dl?v=${id}`
					}, [createElement('img', { src: '/res/img/download-icon.png' })])
				])
			])
		);
};

/** @type {yts.NextPageContext} */
let nextPageCtx;

export const search = async () => {
	els.loadingDiv.hidden = false;
	els.loadingDiv.innerHTML = 'loading...';
	els.searchResultsDiv.replaceChildren();

	/** @type {yts.VideoResult[]} */
	let results;

	try { ({ results, nextPageCtx } = await yts.search(els.ytSearchInput.value, 'video')); }
	catch (err) {
		if (!(err instanceof Error))
			throw err;
		if (err.message === 'Failed to fetch')
			els.loadingDiv.innerHTML = 'fetch error! make sure you have an extension like <a href="https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino">CORS Unblock</a> installed.';
		return;
	}

	displaySearchResults(results);
	document.getElementById('sr-container').style.display = 'flex';
	els.loadingDiv.hidden = true;
};

export const nextPage = async () => {
	els.loadMoreBtn.innerHTML = 'loading...';
	let results;
	try { results = await yts.nextPage(nextPageCtx); }
	catch (err) {
		if (err === 'ip-blacklisted') {
			els.loadMoreBtn.innerHTML = `google has blacklisted your ip... try <a href="/yt/search?q=${els.ytSearchInput.value}" style="background-color:inherit">yt/search</a> instead`;
			els.loadMoreBtn.onclick = null;
			els.loadMoreBtn.style.backgroundColor = '#662e2e';
		} else if (err instanceof Error)
			els.loadMoreBtn.innerHTML = err.message;
		return;
	}
	displaySearchResults(results);
	els.loadMoreBtn.innerHTML = 'load more';
};