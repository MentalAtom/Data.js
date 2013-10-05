(function (xmlr) {

	xmlr.getXML = function (URL, callback, isCrossDomain) {

		this.URL = URL;
		this.isDecentBrowser = typeof window.DOMParser !== "undefined";
		this.callback = callback;
		this.isCrossDomain = isCrossDomain;

		this.makeRequest();

	};

	xmlr.makeRequest = function () {

		this.request = new XMLHttpRequest();

		this.request.open("GET", this.URL);
		this.request.onload = this.onLoadHandler;

		this.request.send();

	};

	xmlr.onLoadHandler = function () {

		//This is called in the scope of the XMLHttpRequest

		var that = xmlr;

		that.XML = that.request.responseXML;

		that.parseXML();

	};

	xmlr.parseXML = function () {

		var XML = this.XML,
			that = this,
			parser;

		if (typeof XML !== "object" && this.isDecentBrowser) {

			parser = new DOMParser();

			that.XML = parser.parseFromString(XML);

			that.doCallback();

		} else if (!this.isDecentBrowser) {

			throw new Error("Get a decent browser already bro");

		} else {

			that.doCallback();

		}

	};

	xmlr.doCallback = function () {

		var that = this;

		if (typeof this.callback === "function") {
			that.callback(that.XML);
		}

	};

	xmlr.forEach = function (data, callback) {

		var i;

		for (i in data) {

			if (data instanceof Array) {

				callback(data[i]);

			} else {

				callback(i, data[i]);

			}

		}

	};

})(XMLr);