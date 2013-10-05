if (typeof XMLr !== "object") {

	XMLr = {};

}

(function () {

	"use strict";

	XMLr.extendObject = function (base, additions) {

		var prop,
			owns = Object.prototype.hasOwnProperty;

		for (prop in additions) {

			if (owns.call(additions, prop)) {
				base[prop] = additions[prop];
			}

		}

	};

	XMLr.createClass = function (base, proto) {

		function B () {}

		function Initializr () {
			this.init.apply(this, arguments);
		}

		if (!proto) {
			proto = base;
			base = new Object();
		}

		B.prototype = base;

		XMLr.extendObject(B.prototype, proto);

		Initializr.prototype = new B();

		return Initializr;

	}

}());