(function (xmlr) {

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
		var rows = CSVData.split('\n'),
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

}(data));