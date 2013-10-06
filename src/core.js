(function (xmlr) {

	xmlr.load = function (URL, options) {

		var xhr = new XMLHttpRequest(),
			defaults = {
				type: "GET",
				data: ''
			};

		xhr.open(options.type, URL);

		xhr.onload = function () {
			options.callback(xhr.responseText);
		};

		xhr.send(JSON.stringify(options.data));

	};

	xmlr.forEach = function (data, callback) {

		var i;

		for (i in data) {

			callback(i, data[i]);

		}

	};

})(data);