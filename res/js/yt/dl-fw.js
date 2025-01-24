import { createElement } from '../utils/elements.js';
import * as els from './dl-fw-elements.js';
import ffmpegDl from './ffmpeg-dl.js';
import { max } from '../utils/arrays.js';
import * as ytdl from '../ytdl-core/lib/info.js';
import { secondsToHms, threeDigitAbbreviation, extendFormat, selectedFormat, itagFromId } from './shared.js';

let formats, details;

const clearFfmpegOutput = () => {
	els.ffmpegOutput.hidden = false;
	els.ffmpegOutputCode.innerText = '';
};

const printFfmpegOutput = (line) => els.ffmpegOutputCode.innerHTML += (line + '\n');

const updateDlButton = () => {
	const { audio, video, av } = selectedFormat;

	if (els.dlButton.disabled = (!av && !audio && !video))
		return;

	els.dlButton.onclick = () => {
		clearFfmpegOutput();
		let _formats;
		// need to use == instead of === because the format itags are numbers and not strings
		if (av)
			_formats = formats.filter(f => f.itag == itagFromId(av));
		else if (audio && video)
			_formats = formats.filter(f => f.itag == itagFromId(audio) || f.itag == itagFromId(video));
		else
			_formats = formats.filter(f => f.itag == itagFromId(audio ?? video));
		ffmpegDl(_formats, details, printFfmpegOutput);
	};
};

const createTableRow = (
	{ itag, type, codecs, hasVideo, bitrateKbpsText, qualityLabel, audioQuality, url },
	{ videoId }
) => {
	const el = createElement('tr', {
		id: `${videoId}-${itag}`,

		// easiest way to catch right-clicks
		oncontextmenu: (ev) => {
			ev.preventDefault();
			navigator.clipboard.writeText(url).then(() => els.copiedPopup.showAt(ev));
		},

		onclick: () => {
			// get references to currently selected formats
			let { audio, video, av } = selectedFormat;

			if (selectedFormat[type] === el) {
				// if this format is already selected, de-select it
				el.classList.remove('selected-format');
				selectedFormat[type] = null;
			} else {
				// keep mutual exclusivity
				if (type === 'av') {
					audio?.classList.remove('selected-format');
					video?.classList.remove('selected-format');
					selectedFormat.audio = null;
					selectedFormat.video = null;
				} else {
					av?.classList.remove('selected-format');
					selectedFormat.av = null;
				}

				// select self, deselect other
				el.classList.add('selected-format');
				selectedFormat[type]?.classList.remove('selected-format');
				selectedFormat[type] = el;
			}

			updateDlButton();
		},
	}, [
		createElement('td', { innerText: itag }),
		createElement('td', { innerText: hasVideo ? qualityLabel : audioQuality.split('_')[2].toLowerCase() }),
		createElement('td', { innerText: (type === 'av') ? codecs.replace(', ', '\n') : codecs }),
		createElement('td', { innerText: bitrateKbpsText })
	]);
	return el;
};

export const getInfo = async () => {
	const idOrUrl = els.ytIdOrUrl.value;
	if (!idOrUrl.length) return;

	els.loading.hidden = false;
	els.loading.innerHTML = 'loading...';
	els.everythingElse.style.display = 'none';
	els.videoTb.replaceChildren();
	els.audioTb.replaceChildren();
	for (const k in selectedFormat)
		selectedFormat[k] = null;
	updateDlButton();

	({ formats, videoDetails: details } = await ytdl.getInfo(idOrUrl)
		.catch(err => {
			if (err.message === 'Failed to fetch')
				els.loading.innerHTML = 'cors error! you need an extension like <a href="https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino">CORS Unblock</a> for this page to work.';
		})
	);

	els.details.root.href = `https://youtu.be/${details.videoId}`;
	els.details.thumbnail.src = details.thumbnails[0].url;
	els.details.title.innerHTML = details.title;
	els.details.channel.innerHTML = details.ownerChannelName;
	els.details.viewsLength.innerHTML = `${threeDigitAbbreviation(details.viewCount)} views • ${secondsToHms(details.lengthSeconds)}`;

	for (const format of formats) {
		extendFormat(format);
		els[format.type + 'Tb'].append(createTableRow(format, details));
	}

	const hqa = max(formats.filter(f => f.type === 'audio'), f => f.audioBitrate);
	const hqv = max(formats.filter(f => f.type === 'video'), f => f.bitrate);

	els.hqBtn.onclick = () => {
		clearFfmpegOutput();
		ffmpegDl([hqa, hqv], details, printFfmpegOutput);
	};

	els.hqaBtn.onclick = () => {
		clearFfmpegOutput();
		ffmpegDl([hqa], details, printFfmpegOutput);
	};

	els.hqvBtn.onclick = () => {
		clearFfmpegOutput();
		ffmpegDl([hqv], details, printFfmpegOutput);
	};

	els.everythingElse.style.display = 'flex';
	els.loading.hidden = true;
};
