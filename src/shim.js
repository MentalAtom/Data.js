(function () {

	"use strict";

	/**
	 * An incomplete shim for Array.indexOf
	 */
	if (Array.prototype.indexOf === undefined) {

		Array.prototype.indexOf = function (SearchKey) {

			var i;

			for (i in this) {

				if (this[i] === SearchKey) {
					return i;
				}

			}

			return -1;

		};

	}

}());