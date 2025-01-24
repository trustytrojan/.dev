import { createElement } from '../utils/elements.js';
// import { FFmpeg } from '../@ffmpeg/ffmpeg/package/dist/esm/index.js';
import { FFmpeg } from 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js';
// import { fetchFile } from '../@ffmpeg/util/package/dist/esm/index.js';
import { fetchFile } from 'https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js';

const ffmpeg = new FFmpeg;

export default async (formats, details, logFunc) => {
	ffmpeg.on('log', ({ message }) => logFunc(message));

	if (!ffmpeg.loaded)
		await ffmpeg.load({ coreURL: '/res/js/@ffmpeg/core-mt/package/dist/esm/ffmpeg-core.js' });

	const onlyOneAudio = (formats.length === 1) && (formats[0].type === 'audio');
	const urls = formats.map(f => f.url);

	let promises = [];
	promises.push(fetchFile(urls[0]).then(f => ffmpeg.writeFile('f1', f)));
	if (urls[1])
		promises.push(fetchFile(urls[1]).then(f => ffmpeg.writeFile('f2', f)));
	logFunc('Downloading media...');
	await Promise.all(promises);

	await ffmpeg.exec([
		'-hide_banner',
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