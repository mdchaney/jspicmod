onmessage = function(image_data) {
	console.log("Got image data in worker");
	// Convert an image to grayscale
	let data = image_data.data;
	for (var i = 0; i < data.length; i += 4) {
		var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		data[i]     = avg; // red
		data[i + 1] = avg; // green
		data[i + 2] = avg; // blue
	}
	console.log("Sending gray scale data back");
	postMessage(image_data);
}
