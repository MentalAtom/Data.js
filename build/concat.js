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
(function (xmlr) {

	"use strict";

	/**
	 * Converts a CSV File (or other CSV data source) into a JSON object.
	 * @param  {String} CSVData - The CSV to convert
	 * @param  {[String]} delimeter  - The delimeter for the string (defaults to comma)
	 * @return {Object} The JSON Object created from the CSV
	 * @{@link http://tools.ietf.org/html/rfc4180 RFC 4108 - Common Format and MIME Type for Comma-Separated Values}
	 */
	data.CSVtoJSON = function (CSVData, delimeter) {

		//Assume commas if we dont have a delimeter set
		if (!delimeter) {
			delimeter = ",";
		}

		//Replace the delimeters with commas
		if (delimeter !== ",") {
			CSVData = CSVData.replace(delimeter, ',');
		}

		//Remove the end of line commas
		CSVData = CSVData.replace(/,(?=\n\r|\n|\r)/g, '');

		//Get the column headings and rows (Split at newlines not inside double quotes. Avoid commas inside double quotes)
		var rows = CSVData.split(/\n(?![\w]+["])/g),
			columnHeadings = rows[0].split(/(?!"),(?![\w]+["])/g),
			newData = [],
			rowFields,
			colNum = columnHeadings.length;

		//Remove the column heading rows from the data
		rows.splice(0, 1);

		data.forEach(rows, function (index, row) {

			//Split the rows by commas (which aren't in quotation marks)
			rowFields = row.split(/(?!"),(?![\w]+["])/g);

			var tempObject = {};

			//Make an object containing the colun header as key, and value as value
			data.forEach(rowFields, function (i, value) {

				// Remove all double quotes (except those escaped by double quotes)
				// See RFC 14801
				tempObject[columnHeadings[i]] = value.replace(/(?=[\w]*)"(?!")/g, '');

			});

			//And push this into the object
			newData.push(tempObject);

		});

		return newData;

	};

	/**
	 * Converts JSON back into a CSV File again. Useful for editing data in JS, and then returning it back to a useful format
	 * @param {Object} JSON The JSON to encode as a CSV
	 * @returns {String} The CSV String
	 */
	data.JSONtoCSV = function (JSON) {

		var props = [],
			rows = [],
			prop;

		//First, let's get the keys
		for (var i = 0; i < JSON.length; i += 1) {

			data.forEach(JSON[i], function (key, value) {

				if (props.indexOf(key) < 0) {
					props.push(key);
				}

			});

			//Push into the rows array the new row (once CSV parsed)
			rows.push(data.delimit(JSON[i]) + "\n");

		}

		//Add the headings back into the top of the file
		rows.unshift(data.delimit(props) + "\n");

		//Return a CSV (Join the rows array)
		return rows.join('');

	};

	/**
	 * Coverts an object literal into a CSV-Safe string
	 * @param  {Object} JSON The Object to encode as a CSV
	 * @return {String} CSV-Encoded data for the object
	 */
	data.delimit = function (JSON) {

		var str = "";

		data.forEach(JSON, function (key, value) {

			/* If the value contains a newline, comma, or double quote, then wrap in quotes,
			 * if it contains quotes then encode these with another quote (see RFC 4108)
			 */
			if (value.match(/["\n,]/g)) {

				var newVal = value.replace(/"/g, '""');

				str += '"' + newVal + '",';

			} else {

				str +=  value + ',';

			}

		});

		str = str.replace(/(\r\n|\n|\r)/gm,"");

		return str;

	};

	/**
	 * Counts the number of rows in a CSV file
	 * @param  {String} CSV              The CSV Data
	 * @param  {Boolean} includeHeadings True to include the headings row, false not to. If not set, this is assumed false.
	 * @return {Number}                  The number of rows
	 */
	data.countRows = function (CSV, includeHeadings) {

		if (includeHeadings === undefined) {
			includeHeadings = false;
		}

		var rows = CSV.split(/\n(?![\w]+["])/g).length;

		if (!includeHeadings) {
			rows -= 1;
		}

		return rows;

	};

	/**
	 * Check the CSV for validity (Basic check, checks that all rows have the same number of columns)
	 * @param  {String}  CSV The CSV File Contents
	 * @return {Boolean}     True if file is valid, false if not.
	 */
	data.isValidCSV = function (CSV) {

		//Remove the end of line commas and remove the final comma
		CSV = CSV.replace(/,(?=\n\r|\n|\r)/g, '');

		console.log(CSV);

		var rows = CSV.split(/\n(?![\w]+["])/g),
			cols = rows[0].split(/(?!"),(?![\w]+["])/g).length,
			returnVal = true,
			rowlen;

		rows.splice(0,1);

		data.forEach(rows, function (i, row) {

			rowlen = row.split(/(?!"),(?![\w]+["])/g).length;

			if (rowlen !== cols && i !== rows.length) {
				returnVal = false;
			}

		});

		return returnVal;

	};

	/**
	 * Find rows in a CSV matching the given criteria
	 * @param {String|Object} CSV A processed or unprocessed CSV
	 * @param {String} sum A criteria for the search e.g. "one equals two" to find rows where column one equals two
	 */
	data.CSVrowsWhere = function (CSV, sum, returnType) {

		//Get the data into a format we can handle
		if (typeof CSV !== 'object') {
			CSV = data.CSVtoJSON(CSV);
		}

		var caseType,
			caseSplit,
			column,
			comparison,
			trimmed,
			returnRows = [];

		if (sum.indexOf("equals") > 0) {
			caseType = 1;
			caseSplit = "equals";
		} else if (sum.indexOf("===") > 0) {
			caseType = 1;
			caseSplit = "===";
		}

		if (!caseType) {
			throw new Error("No valid criteria specified, sorry :(");
		}

		switch (caseType) 
		{
		case 1:
			//Equal to..
			column = sum.substr(0, sum.indexOf(caseSplit) - 1).toString();
			comparison = sum.substring(sum.indexOf(caseSplit) + (caseSplit.length + 1), sum.length);

			comparison.trim();
			column = column.trim().toString();

			data.forEach(CSV, function (rowNum, rowData) {

				data.forEach(rowData, function (col, val) {

					trimmed = col.toString().replace(/\s/g, "").trim();

					if (trimmed === column && val === comparison) {
						returnRows.push(rowNum);
					}

				});

			});
			break;
		}

		return returnRows;

	};

}(data));
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

	if (String.prototype.trim === undefined) {

		String.prototype.trim = function () {
			return this.replace(/[\s]+/g, "");
		};

	}

}());
(function (xmlr) {

	/**
	 * Gets the name of the root element of an XML object
	 * @param  {Object} XML The XML to determine the root object for
	 * @return {String}     The name of the root element
	 */
	xmlr.getRootElementName = function (XML) {

		var index;

		for (index in XML.childNodes) {

			if (XML.childNodes[index].nodeType === 1) {
				return XML.childNodes[index].tagName;
			}

		}
		
		throw new Error("Could not find root element");

	};

	/**
	 * Counts the direct children of the root element in an XML document
	 * @param  {Object} XML The XML document
	 * @returns {Number} The number of children of the root element
	 */
	xmlr.countChildNodes = function (XML) {

		var count = 0,
			child,
			rootTag = xmlr.getRootElementName(XML),
			children = XML.getElementsByTagName(rootTag)[0].childNodes;

		for (child in children) {

			if (children[child].nodeType && children[child].nodeType !== 3) {
				count += 1;
			}

		}

		return count;

	};

	xmlr.JSONtoXML = function (JSON, rootTagName) {

		var defaults = {
			rootTagName: "JSON"
		};

		if (!rootTagName) {
			rootTagName = defaults.rootTagName;
		}

		var newDoc = document.implementation.createDocument(null, null, null),
			rootEl;

		//Let us make the root element
		rootEl = document.createElement(rootTagName);
		newDoc.appendChild(rootEl);

		xmlr.forEach(JSON, function (key, value) {

			var newEl = document.createElement(key);

			newEl.innerHTML = value;

			rootEl.appendChild(newEl);

		});

		console.log(newDoc);

	};

})(data);