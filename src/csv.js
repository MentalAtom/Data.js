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

}(data));