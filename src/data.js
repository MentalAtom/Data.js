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
			base = {};
		}

		B.prototype = base.prototype;

		Initializr.prototype = new B();

		//Allow us to access the functions of the base from the proto
		Initializr.parent = base.prototype;

		data.extendObject(Initializr.prototype, proto);

		return Initializr;

	};

}());