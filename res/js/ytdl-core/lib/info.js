import * as sig from './sig.js';
import * as util from './utils.js';
import * as extras from './info-extras.js';
import * as formatUtils from './format-utils.js';

const BASE_URL = 'https://www.youtube.com/watch?v=';
const getWatchHTMLURL = (id, options) =>
	`${BASE_URL + id}&hl=${options.lang || 'en'}&bpctr=${Math.ceil(Date.now() / 1000)}&has_verified=1`;
const getWatchHTMLPageBody = async (id, options) => await (await fetch(getWatchHTMLURL(id, options))).text();

const EMBED_URL = 'https://www.youtube.com/embed/';
const getEmbedPageBody = async (id, options) => await (await fetch(`${EMBED_URL + id}?hl=${options.lang || 'en'}`)).text();

const jsonClosingChars = /^[)\]}'\s]+/;
const parseJSON = (source, varName, json) => {
	if (!json || typeof json === 'object') {
		return json;
	} else {
		try {
			json = json.replace(jsonClosingChars, '');
			return JSON.parse(json);
		} catch (err) {
			throw Error(`Error parsing ${varName} in ${source}: ${err.message}`);
		}
	}
};

const findJSON = (source, varName, body, left, right, prependJSON) => {
	let jsonStr = util.between(body, left, right);
	if (!jsonStr)
		throw Error(`Could not find ${varName} in ${source}`);
	return parseJSON(source, varName, util.cutAfterJS(`${prependJSON}${jsonStr}`));
};

const findPlayerResponse = (source, info) => {
	const player_response = info && (
		(info.args && info.args.player_response) ||
		info.player_response || info.playerResponse || info.embedded_player_response);
	return parseJSON(source, 'player_response', player_response);
};

const getHTML5player = body => {
	const html5playerRes =
		/<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/
			.exec(body);
	return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
};

const getWatchHTMLPage = async (id, options) => {
	const body = await getWatchHTMLPageBody(id, options);
	const info = { page: 'watch' };
	try {
		info.player_response =
			util.tryParseBetween(body, 'var ytInitialPlayerResponse = ', '}};', '', '}}') ||
			util.tryParseBetween(body, 'var ytInitialPlayerResponse = ', ';var') ||
			util.tryParseBetween(body, 'var ytInitialPlayerResponse = ', ';</script>') ||
			findJSON('watch.html', 'player_response', body, /\bytInitialPlayerResponse\s*=\s*\{/i, '</script>', '{');
	} catch {
		const args = findJSON('watch.html', 'player_response', body, /\bytplayer\.config\s*=\s*{/, '</script>', '{');
		info.player_response = findPlayerResponse('watch.html', args);
	}
	info.response =
		util.tryParseBetween(body, 'var ytInitialData = ', '}};', '', '}}') ||
		util.tryParseBetween(body, 'var ytInitialData = ', ';</script>') ||
		util.tryParseBetween(body, 'window["ytInitialData"] = ', '}};', '', '}}') ||
		util.tryParseBetween(body, 'window["ytInitialData"] = ', ';</script>') ||
		findJSON('watch.html', 'response', body, /\bytInitialData("\])?\s*=\s*\{/i, '</script>', '{');
	info.html5player = getHTML5player(body);
	return info;
};

const parseFormats = (player_response) => {
	let formats = [];
	if (player_response?.streamingData)
		formats = formats
			.concat(player_response.streamingData.formats || [])
			.concat(player_response.streamingData.adaptiveFormats || []);
	return formats;
};

export const getBasicInfo = async (id, options = {}) => {
	const info = await getWatchHTMLPage(id, options);
	info.formats = parseFormats(info.player_response);
	// info.videoDetails = extras.cleanVideoDetails(Object.assign({},
	// 	info.player_response?.microformat?.playerMicroformatRenderer,
	// 	info.player_response?.videoDetails), info);
	info.videoDetails = extras.cleanVideoDetails({
		...info.player_response?.microformat?.playerMicroformatRenderer,
		...info.player_response?.videoDetails
	}, info);
	return info;
};

export const getInfo = async (id, options = {}) => {
	const info = await getBasicInfo(id, options);
	if (info.formats.length) {
		info.html5player = info.html5player
			|| getHTML5player(await getWatchHTMLPageBody(id, options))
			|| getHTML5player(await getEmbedPageBody(id, options));
		if (!info.html5player)
			throw Error('Unable to find html5player file');
		const html5player = new URL(info.html5player, BASE_URL).toString();
		await sig.decipherFormats(info.formats, html5player, options);
	}
	info.formats.forEach(formatUtils.addFormatMeta);
	info.formats.sort(formatUtils.sortFormats);
	return info;
};