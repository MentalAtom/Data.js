(function (data) {

	data.load = function (URL, options) {

		if (!options) {
			options = {};
		}

		var xhr = new XMLHttpRequest(),
			xdr,
			defaults = {
				type: "GET",
				data: ''
			},
			onload;

		options = data.extendObject(options, defaults);

		if (!window.XDomainRequest) {

			onload = function () {
				options.callback(xhr.responseText);
			};

			xhr.open(options.type, URL);

			xhr.onload = onload;

			xhr.send(JSON.stringify(options.data));

		} else {

			onload = function () {
				options.callback(xdr.responseText);
			};

			xdr = new XDomainRequest();

			xdr.open(options.type, URL);

			xdr.onload = onload;

			xdr.send(JSON.stringify(options.data));

		}

	};

	data.forEach = function (data, callback) {

		var i,
			owns = Object.prototype.hasOwnProperty;

		for (i in data) {

			if (owns.call(data, i)) {
				callback(i, data[i]);
			}

		}

	};

	data.forEachDeep = function (data, callback) {

		var i,
			a,
			owns = Object.prototype.hasOwnProperty;

			for (i in data) {

				for (a in data[i]) {
					callback(i, a, data[i][a]);
				}

			}

	};

})(data);