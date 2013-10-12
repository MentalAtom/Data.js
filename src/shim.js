(function () {

	"use strict";

	//https://gist.github.com/dhm116/1790197

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

	// Add ECMA262-5 string trim if not supported natively
	//
	if (!('trim' in String.prototype)) {
		String.prototype.trim= function() {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

}());