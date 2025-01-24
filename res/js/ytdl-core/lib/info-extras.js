// import utils from './utils.js';

const getText = obj => //obj ? (obj.runs ? obj.runs[0].text : obj.simpleText) : null;
	obj ? (obj.runs?.[0].text ?? obj.simpleText) : null;

export const cleanVideoDetails = (videoDetails, info) => {
	videoDetails.thumbnails = videoDetails.thumbnail.thumbnails;
	delete videoDetails.thumbnail;
	// utils.deprecate(videoDetails, 'thumbnail', { thumbnails: videoDetails.thumbnails },
	// 	'videoDetails.thumbnail.thumbnails', 'videoDetails.thumbnails');
	videoDetails.description = videoDetails.shortDescription || getText(videoDetails.description);
	delete videoDetails.shortDescription;
	// utils.deprecate(videoDetails, 'shortDescription', videoDetails.description,
	// 	'videoDetails.shortDescription', 'videoDetails.description');

	// Use more reliable `lengthSeconds` from `playerMicroformatRenderer`.
	videoDetails.lengthSeconds =
		info.player_response.microformat?.playerMicroformatRenderer.lengthSeconds ||
		info.player_response.videoDetails.lengthSeconds;
	return videoDetails;
};