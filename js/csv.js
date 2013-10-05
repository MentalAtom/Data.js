(function (xmlr) {

	"use strict";

	/**
	 * Converts a CSV File (or other CSV data source) into a JSON object.
	 * @param  {String} CSVData - The CSV to convert
	 * @param  {[String]} delimeter  - The delimeter for the string (defaults to comma)
	 * @return {Object} The JSON Object created from the CSV
	 * @{@link http://tools.ietf.org/html/rfc4180 RFC 4108 - Common Format and MIME Type for Comma-Separated Values}
	 */
	data.csvToJSON = function (CSVData, delimeter) {

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

		//Get the column headings and rows
		var rows = CSVData.split(/(?=,)\n/g),
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

			rows.push(data.delimit(JSON[i]) + "\n");

		}

		rows.unshift(data.delimit(props) + "\n");

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

}(data));