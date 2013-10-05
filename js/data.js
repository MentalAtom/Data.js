if (typeof data !== "object") {

	data = {};

}

(function () {

	"use strict";

	data.extendObject = function (base, additions) {

		var prop,
			owns = Object.prototype.hasOwnProperty;

		for (prop in additions) {

			if (owns.call(additions, prop)) {
				base[prop] = additions[prop];
			}

		}

	};

	data.createClass = function (base, proto) {

		function B () {}

		function Initializr () {
			this.init.apply(this, arguments);
		}

		if (!proto) {
			proto = base;
			base = new Object();
		}

		B.prototype = base;

		data.extendObject(B.prototype, proto);

		Initializr.prototype = new B();

		return Initializr;

	};

}());