$(function() {
	const is_ios = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
	const is_media_stream_api_supported = navigator && navigator.mediaDevices && 'enumerateDevices' in navigator.mediaDevices;

	if (!is_media_stream_api_supported) {
		alert("Media Stream API is not available.");
		return;
	}

	let has_camera_permission = false;

	let video_element = document.querySelector('video');
	let output_element = document.querySelector('canvas#output');
	let output_ctx = output_element.getContext('2d');

	let streaming = false;

	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	// Setup canvas based on the video input
	function setup_canvases() {
		canvas.width = video_element.scrollWidth;
		canvas.height = video_element.scrollHeight;
		output_element.width = video_element.scrollWidth;
		output_element.height = video_element.scrollHeight;
		console.log("Canvas size is " + video_element.scrollWidth + " x " + video_element.scrollHeight);
	}

	video_element.addEventListener('play', function(e) {
		if (!streaming) {
			streaming = true;
			setup_canvases();
		}
	}, false);

	// Connect the proper camera to the video element, trying
	// to get a camera with facing mode of "user".
	async function connect_camera() {
		try {
			let stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
				audio: false
			});
			video_element.srcObject = stream;
			video_element.setAttribute('playsinline', true);
			video_element.setAttribute('controls', true);
			// remove controls separately
			setTimeout(function() { video_element.removeAttribute('controls'); });
		} catch(error) {
			console.error("Got an error while looking for video camera: " + error);
			return null;
		}
	}

	let gray_worker = new Worker('gray_worker.js');

	gray_worker.onmessage = function(e) {
		// Write to output canvas
		output_ctx.putImageData(e.data, 0, 0);
		// run this again after 50 ms
		setTimeout(grab_frame, 50);
	}

	function grab_frame() {
		if (ctx) {
			// copy image from video element to canvas context
			ctx.drawImage(video_element, 0, 0, canvas.width, canvas.height);
			// grab image data from canvas context
			let image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			// send to worker
			console.log("Sending image data to worker.");
			gray_worker.postMessage(image_data);
		}
	}

	connect_camera();
	setTimeout(grab_frame);
});
