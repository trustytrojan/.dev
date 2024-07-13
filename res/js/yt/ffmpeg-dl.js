import { createElement } from '../utils/elements.js';
import { FFmpeg } from 'https://unpkg.com/@ffmpeg/ffmpeg/dist/esm/index.js';
import { fetchFile } from 'https://unpkg.com/@ffmpeg/util/dist/esm/index.js';

/** @type {FFmpeg} */
let ffmpeg;
let ffmpegLoaded = false;

export default async (formats, details, onLog) => {
	if (!ffmpeg) {
		ffmpeg = new FFmpeg();
		ffmpeg.on('log', onLog);
		ffmpegLoaded = false;
	}

	if (!ffmpegLoaded) {
		await ffmpeg.load();
		ffmpegLoaded = true;
	}

	const onlyOneAudio = (formats.length === 1) && (formats[0].type === 'audio');
	const urls = formats.map(f => f.url);

	let promises = [];
	promises.push(fetchFile(urls[0]).then(f => ffmpeg.writeFile('f1', f)));
	if (urls[1]) promises.push(fetchFile(urls[1]).then(f => ffmpeg.writeFile('f2', f)));
	await Promise.all(promises);

	await ffmpeg.exec([
		'-i', 'f1',
		...(urls[1] ? ['-i', 'f2'] : []),
		...(!onlyOneAudio ? ['-c', 'copy'] : []),
		'-metadata', `title=${details.title}`,
		'-metadata', `artist=${details.author}`,
		'-metadata', `date=${details.publishDate.substring(0, 10)}`,
		'-metadata', `duration=${details.lengthSeconds}`,
		'-f', (onlyOneAudio ? 'mp3' : 'matroska'),
		'output'
	]);

	const fileData = await ffmpeg.readFile('output');
	const blob = new Blob([fileData], { type: onlyOneAudio ? 'audio/mp3' : 'video/mkv' });
	createElement('a', {
		href: URL.createObjectURL(blob),
		download: `${details.title}.${onlyOneAudio ? 'mp3' : 'mkv'}`
	}).click();
};