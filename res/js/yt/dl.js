import { createElement } from '../utils/elements.js';
import * as els from './dl-elements.js';
import { secondsToHms, threeDigitAbbreviation, extendFormat, selectedFormat, itagFromId } from './shared.js';

let baseHref;

const updateDlButtonHref = () => {
	const { audio, video, av } = selectedFormat;
	if (av)
		els.dlButton.href = `${baseHref}?itags=${itagFromId(av)}`;
	else if (audio || video) {
		if (audio && video)
			els.dlButton.href = `${baseHref}?itags=${itagFromId(audio)},${itagFromId(video)}`;
		else {
			if (audio)
				els.dlButton.href = `${baseHref}?itags=${itagFromId(audio)}`;
			if (video)
				els.dlButton.href = `${baseHref}?itags=${itagFromId(video)}`;
		}
	} else {
		els.dlButton.href = '';
	}
};

const createTableRow = (
	{ itag, type, codecs, hasVideo, bitrateKbpsText, qualityLabel, audioQuality, url },
	{ videoId }
) => {
	const tr = createElement('tr', {
		id: `${videoId}-${itag}`,

		// easiest way to catch right-clicks
		oncontextmenu: (ev) => {
			ev.preventDefault();
			navigator.clipboard.writeText(url).then(() => els.copiedPopup.showAt(ev));
		},

		onclick: () => {
			// get references to currently selected formats
			let { audio, video, av } = selectedFormat;

			if (selectedFormat[type] === tr) {
				// if this format is already selected, de-select it
				tr.classList.remove('selected-format');
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
				tr.classList.add('selected-format');
				selectedFormat[type]?.classList.remove('selected-format');
				selectedFormat[type] = tr;
			}

			updateDlButtonHref();
		},
	}, [
		createElement('td', { innerText: itag }),
		createElement('td', { innerText: hasVideo ? qualityLabel : audioQuality.split('_')[2].toLowerCase() }),
		createElement('td', { innerText: (type === 'av') ? codecs.replace(', ', '\n') : codecs }),
		createElement('td', { innerText: bitrateKbpsText })
	]);
	return tr;
};

const baseUrl = 'https://api.trustytrojan.dev';

export const getInfo = async () => {
	const idOrUrl = els.ytIdOrUrl.value;
	if (!idOrUrl.length) return;

	els.loading.hidden = false;
	els.everythingElse.style.display = 'none';
	els.videoTb.replaceChildren();
	els.audioTb.replaceChildren();
	for (const k in selectedFormat)
		selectedFormat[k] = null;

	const url = `${baseUrl}/yt/info/${encodeURIComponent(idOrUrl)}`;
	const { formats, details } = await (await fetch(url)).json();

	els.details.root.href = `https://youtu.be/${details.videoId}`;
	els.details.thumbnail.src = details.thumbnails[0].url;
	els.details.title.innerHTML = details.title;
	els.details.channel.innerHTML = details.ownerChannelName;
	els.details.viewsLength.innerHTML = `${threeDigitAbbreviation(details.viewCount)} views • ${secondsToHms(details.lengthSeconds)}`;

	for (const format of formats) {
		extendFormat(format);
		els[format.type + 'Tb'].append(createTableRow(format, details));
	}

	baseHref = `${baseUrl}/yt/dl/${details.videoId}`;
	els.hqBtn.href = baseHref;
	els.hqvBtn.href = baseHref + '?only=video';
	els.hqaBtn.href = baseHref + '?only=audio';

	els.everythingElse.style.display = 'flex';
	els.loading.hidden = true;
};
