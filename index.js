const drone = require('drone-node');
const doUntil = require('async/doUntil');
const series = require('async/series');
const growl = require('growl');

// TODO jprokop: implement usage and basic validations/error handling
const builds = process.argv.slice(2).map((buildUrl) => {
	const [_, owner, repo, number] = new URL(buildUrl).pathname.split('/');
	return { buildUrl, owner, repo, number: parseInt(number, 10) };
});

require('dotenv').config();

const client = new drone.Client({
  url: process.env.DRONE_SERVER,
  token: process.env.DRONE_TOKEN
});

const finishedBuilds = [];

function getStatus(build) {
	const { owner, repo, number } = build
	return function (callback) {
		client.getBuild(owner, repo, number).then((res) => {
			callback(null, { status: res.status, build });
		}).catch((reason) => {
			callback(reason);
		})
	}
}

doUntil((callback) => {
	series(builds.map(getStatus), (err, results) => {
		if (err) {
			return callback(err);
		}

		results.forEach((result) => {
			if (result.status === 'success' || result.status === 'failure') {
				finishedBuilds.push(result);
				const index = builds.indexOf(result.build);
				builds.splice(index, 1);
			}

			if (result.status === 'failure' && (finishedBuilds.length + builds.length) > 1) {
				growl(`Build ${result.build.buildUrl} failed!`, { sticky: true });
			}
		})

		callback();
	})
}, (callback) => {
	if (builds.length > 0) {
		setTimeout(() => callback(null, false), 5000)
	} else {
		callback(null, true);
	}
}, (err) => {
	if (err) {
		// TODO jprokop: improve error reporting!
		console.error(err);
		growl('An error occurred while watching DroneCI build(s), check terminal for details.', { sticky: true });
		return
	} else {
		const [success, failed] = finishedBuilds.reduce((acc, { status, build: { buildUrl } }) => {
			if (status === 'success') {
				acc[0].push('- ' + buildUrl);
			} else {
				acc[1].push('- ' + buildUrl);
			}
			return acc;
		}, [[], []]);
		const message = [];

		if (failed.length > 0) {
			message.push(`${failed.length} build(s) failed:\n${failed.join('\n')}`);
		}

		if (success.length > 0) {
			message.push(`${success.length} build(s) finished successfully:\n${success.join('\n')}`);
		}

		growl(message.join('\n'), { sticky: true });
	}
})
