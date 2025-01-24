import { argv, exit } from 'process';
import { getInfo } from '../lib/info.js';

if (!argv[2]) {
	console.error('YouTube video ID or URL required');
	exit(1);
}

const { formats, videoDetails: details } = await getInfo(argv[2]);
console.log(JSON.stringify({ formats, details }, null, '\t'));
