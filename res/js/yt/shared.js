/**
 * @param {string | number} seconds 
 */
export const secondsToHms = (seconds) => {
	if (seconds < 0)
		throw TypeError('seconds must be nonnegative');
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	const pad = (x) => String(x).padStart(2, '0');
	return (h > 0)
		? `${h}:${pad(m)}:${pad(s)}`
		: `${m}:${pad(s)}`;
};

/**
 * @param {string | number} n 
 */
export const threeDigitAbbreviation = (n) => {
	const abbreviations = ['', 'K', 'M', 'B', 'T'];
	const suffixIndex = Math.floor(Math.log10(n) / 3);
	const abbreviatedNumber = (n / Math.pow(1000, suffixIndex)).toFixed(0);
	return abbreviatedNumber + abbreviations[suffixIndex];
};

export const extendFormat = (format) => {
	const bitrateKbps = format.hasVideo
		? Math.round((format.averageBitrate || format.bitrate) / 1000)
		: format.audioBitrate;
	format.bitrateKbpsText = `${bitrateKbps}kbps`;
	format.type = (format.hasVideo && format.hasAudio)
		? 'av'
		: (format.hasVideo ? 'video' : 'audio');
};

/** @type {Record<'audio' | 'video' | 'av', HTMLTableRowElement?>} */
export const selectedFormat = Object.preventExtensions({ audio: null, video: null, av: null });

/**
 * @param {HTMLElement} 
 */
export const itagFromId = ({ id }) => {
	const split = id.split('-');
	return split[split.length - 1];
};