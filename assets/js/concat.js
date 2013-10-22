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

		return base;

	};

	data.createClass = function (base, proto) {

		function B () {}

		function DataObject () {
			this.init.apply(this, arguments);
		}

		if (!proto) {
			proto = base;
			base = {};
		}

		B.prototype = base.prototype;

		DataObject.prototype = new B();

		//Allow us to access the functions of the base from the proto
		DataObject.parent = base.prototype;

		data.extendObject(DataObject.prototype, proto);

		return DataObject;

	};

}());
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
(function (data) {

    data.load = function (URL, options) {

        if (!options) {
            options = {};
        }

        var xhr = new XMLHttpRequest(),
            xdr,
            defaults = {
                type: "GET",
                data: ''
            },
            onload,
            onerror;

        options = data.extendObject(options, defaults);

        if (!window.XDomainRequest) {

            onload = function () {
                if (!xhr.responseXML) {
                    options.callback(xhr.responseText);
                } else if (xhr.responseXML) {
                    options.callback(xhr.responseXML);
                }
            };

            onerror = function () {
                if (options.fail) {
                    options.fail(xhr.statusText);
                }
            };

            xhr.open(options.type, URL);

            // xhr.onload = onload;
            // Just for IE7 :)
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status === 200)) {
                    console.log(xhr);
                    onload();
                } else {
                    onerror();
                }
            };

            xhr.send(JSON.stringify(options.data));

        } else {

            onload = function () {
                options.callback(xdr.responseText);
            };

            xdr = new XDomainRequest();

            xdr.open(options.type, URL);

            xdr.onload = onload;

            xdr.send(JSON.stringify(options.data));

        }

    };

    data.forEach = function (data, callback) {

        var i,
            owns = Object.prototype.hasOwnProperty;

        for (i in data) {

            if (owns.call(data, i)) {
                callback(i, data[i]);
            }

        }

    };

    data.forEachDeep = function (data, callback) {

        var i,
            a,
            owns = Object.prototype.hasOwnProperty;

            for (i in data) {

                for (a in data[i]) {
                    callback(i, a, data[i][a]);
                }

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
    data.CSVtoJSON = function (CSVData, delimeter, callback) {

        // console.time("ProcessStart");

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
            newData = new data.CSVObject(),
            rowFields,
            colNum = columnHeadings.length,
            tempObject;

        //Push the columns into the new CSVObject
        columnHeadings = newData.setColumns(columnHeadings);

        //Remove the column heading rows from the data
        rows.splice(0, 1);

        data.forEach(rows, function (index, row) {

            //Split the rows by commas (which aren't in quotation marks)
            rowFields = row.split(/(?!"),(?![\w]+["])/g);

            tempObject = {};

            //Make an object containing the colun header as key, and value as value
            data.forEach(rowFields, function (i, value) {

                // Remove all double quotes (except those escaped by double quotes)
                // See RFC 14801
                tempObject[columnHeadings[i]] = value.replace(/(?=[\w]*)"(?!")/g, '');

                //Covert numbers into numbers
                if (/^[\-]?[0-9]+[\.]?[0-9]*$/g.test(tempObject[columnHeadings[i]])) {
                    tempObject[columnHeadings[i]] = data.parseNum(tempObject[columnHeadings[i]]);
                }

            });

            //And push this into the object
            newData.push(tempObject);

        });

        // console.timeEnd("ProcessStart");

        if (callback && typeof callback === "function") {
            callback(newData);
        }

        return newData;

    };

    /**
     * Converts JSON back into a CSV File again. Useful for editing data in JS, and then returning it back to a useful format
     * @param {Object} JSON The JSON to encode as a CSV
     * @returns {String} The CSV String
     */
    data.JSONtoCSV = function (JSON, delimeter) {

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
            rows.push(data.delimit(JSON[i], delimeter) + "\n");

        }

        //Add the headings back into the top of the file
        rows.unshift(data.delimit(props, delimeter) + "\n");

        //Return a CSV (Join the rows array)
        return rows.join('');

    };

    /**
     * Coverts an object literal into a CSV-Safe string
     * @param  {Object} JSON The Object to encode as a CSV
     * @return {String} CSV-Encoded data for the object
     */
    data.delimit = function (JSON, delimeter) {

        if (!delimeter) {
            delimeter = ",";
        }

        var str = "";

        data.forEach(JSON, function (key, value) {

            /**
             * Turn any number values back into a string for matching
             */
            if (typeof value !== "string") {
                value = value.toString();
            }

            /* If the value contains a newline, comma, or double quote, then wrap in quotes,
             * if it contains quotes then encode these with another quote (see RFC 4108)
             */
            if (value.match(/["\n,]/g)) {

                var newVal = value.replace(/"/g, '""');

                str += '"' + newVal + '",';

            } else {

                str +=  value + delimeter;

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

        var rows = CSV.split(/\n(?![\w]+["])/g),
            cols = rows[0].split(/(?!"),(?![\w]+["])/g).length,
            returnVal = true,
            rowlen;

        rows.splice(0,1);

        data.forEach(rows, function (i, row) {

            rowlen = row.split(/(?!"),(?![\w]+["])/g).length;

            if (rowlen !== cols && i !== rows.length && (row !== "" && i !== rows.length - 1)) {
                returnVal = false;
            }

        });

        return returnVal;

    };

    /**
     * Find rows in a CSV matching the given criteria and returns the row numbers
     * @param {String|Object} CSV A processed or unprocessed CSV
     * @param {String} sum A criteria for the search e.g. "one equals two" to find rows where column one equals two
     */
    data.CSVrowsWhere = function (CSV, sum, returnType) {

        var Matcher = new data.CSVMatcher(CSV, sum),
            returnRows;

        returnRows = Matcher.rows;

        return returnRows;

    };

    /**
     * Draw CSV Data into a HTML Table
     * @param  {Object} CSVData An instance of DataObject for a CSV
     * @param {Object} attributes An object containing attributes to be set on the table (for example {border: 0});
     */
    data.drawAsTable = function (CSVData, attributes, parent, callback) {

        var table = document.createElement("table"),
            tbody = document.createElement("tbody"),
            thead = document.createElement("thead"),
            i,
            a,
            column,
            rowcount,
            attr,
            tempData = {},
            owns = Object.prototype.hasOwnProperty,
            metaRows;

        // thead.insertRow(0);
        thead.appendChild(document.createElement("tr"));

        // Add columns into an object with an array each
        for (i = 0; i < CSVData.columns.length; i += 1) {
            tempData[CSVData.columns[i]] = [];
        }

        // and then add the cells by column, so they dont get mixed up when we output the table.
        data.forEach(CSVData.rows, function (a, row) {

            data.forEach(row, function (field, value) {

                tempData[field].push(value);

            });

        });

        // First, insert the correct number of rows to the tbody.
        for (i = 0; i < tempData[CSVData.columns[0]].length; i += 1) {
            tbody.appendChild(document.createElement("tr"));
        }

        if (!tbody.rows.length) {
            metaRows = tbody.getElementsByTagName("tr");
        }

        // Now, for each of the columns, add a th into the thead and add a cell into every row for the values
        for (i = 0; i < CSVData.columns.length; i += 1) {

            var newHeading = document.createElement("th");
            newHeading.appendChild(document.createTextNode(CSVData.columns[i]));

            thead.appendChild(newHeading);

            // Loop through the rows
            for (a = 0; a < tempData[CSVData.columns[i]].length; a += 1) {
                
                var newCell = document.createElement("td");
                newCell.appendChild(document.createTextNode(tempData[CSVData.columns[i]][a]));

                if (tbody.rows.length !== undefined && tbody.rows.length !== 0) {
                    tbody.rows[a].appendChild(newCell);
                } else {
                    metaRows[a].appendChild(newCell);
                }

            }

        }

        //Apply any given attributes
        
        for (attr in attributes) {

            table.setAttribute(attr, attributes[attr]);

        }

        table.appendChild(thead);
        table.appendChild(tbody);

        console.log(parent, $(parent));

        $(parent)[0].appendChild(table);

        if (callback && typeof callback === "function") {
            setTimeout(callback, 1000);
        }

        return table;

    };

    data.CSVfromTable = function (tableElement) {

        var thead = tableElement.getElementsByTagName("thead")[0],
            tbody = tableElement.getElementsByTagName("tbody")[0],
            headings = thead.getElementsByTagName("th"),
            rows = tbody.getElementsByTagName("tr"),
            owns = Object.prototype.hasOwnProperty,
            CSVData = {
                columns: [],
                rows: []
            },
            rowData,
            cellIndex = 0,
            returnObj = new data.CSVObject();

        //Get our column headings
        data.forEach(headings, function (i, th) {

            if (th.nodeType === 1) {
                CSVData.columns.push(th.innerHTML);
            }

        });

        //And now get the cells in each row
        data.forEach(rows, function (i, tr) {

            if (tr.nodeType === 1) {

                rowData = {};
                
                data.forEach(tr.childNodes, function (a, child) {

                    if (child.nodeType === 1 && child.tagName.toLowerCase() === "td") {
                        rowData[CSVData.columns[cellIndex]] = child.innerHTML;
                        cellIndex += 1;
                    }

                });

                returnObj.push(rowData);
                cellIndex = 0;

            }

        });

        returnObj.setColumns(CSVData.columns);

        return returnObj;

    };

    /**
     * Checks if a string is a valid number
     * and if it is returns it as a number rather
     * than as a string
     * @param  {String} number The string to check for containing an int
     * @return {String|Number}        String if the number cannot be parsed
     */
    data.parseNum = function (number) {

        if (isNaN(parseFloat(number, 10))) {
            return number;
        } else {
            return parseFloat(number, 10);
        }

    };

}(data));
data.CSVMatcher = (function () {

	"use strict";

	var config = {
		types: ["equals", "morethan", "lessthan", "notequal", "contains", "matches"],
		equals: {
			discover: /[\w\s]*\s(?=equals|[\=]{1,3}(?!=))/,
			//If we match this, then we have equals signs. If not, it must be the word equals.
			delimeter: /\s[\=]{1,3}(?!=)/,
			delimitMatch: /\s[\=]{1,3}/g,
			delimitFalse: "equals"
		},
		morethan: {
			discover: /[\w\s]*\s(?=greater than|[\>?]{1}(?=\s))/,
			delimeter: /\s[\>]{1}(?=\s)/,
			delimitMatch: /\s[\>]{1}/g,
			delimitFalse: "greater than"
		},
		lessthan: {
			discover: /[\w\s]*\s(?=less than|[\\<]{1}(?=\s))/,
			delimeter: /\s[\\<]{1}(?=\s)/,
			delimitMatch: /\s[\\<]{1}/g,
			delimitFalse: "less than"
		},
		notequal: {
			discover: /[\w\s]*\s(?=not equal to|[\!]{1}[\=]{2}(?=\s))/,
			delimeter: /\s[!]{1}[=]{2}(?=[\s])/,
			delimitMatch: /\s[!]{1}[=]{2}/g,
			delimitFalse: "not equal to"
		},
		contains: {
			discover: /[\w\s]*\s(?=contains)/g,
			delimeter: /\s(?=contains\s)/,
			delimitMatch: /\scontains\s/g
		},
		matches: {
			discover: /[\w\s]*\s(?=matches)/,
			delimeter: /\s(?=matches\s)/,
			delimitMatch: /\smatches\s/g
		}
	};

	return new data.createClass({

		/**
		 * A Class to match a value in a CSV to another value.
		 * @param  {[type]} CSV        [description]
		 * @param  {[type]} expression [description]
		 * @return {[type]}            [description]
		 */
		init: function (CSV, expression) {
			
			this.CSVData = CSV;
			this.testString = expression;
			this.matchers = {};
			this.rows = [];

			//Check if CSVData is a string or an Object, if it is string then convert and verify it.
			if (typeof this.CSVData !== 'object') {
				data.isValidCSV(this.CSVData);
				this.CSVData = data.CSVtoJSON(this.CSVData);
			}
			
			//Split into parts...
			this.findCombo();

			if (this.combos.length === 1) {
				//Work out the type of match...
				this.discoverType();
				//And then find the delimeter
				this.findDelimeter();
				//And then, get both parts of the query.
				this.findQueryParts();
				//Now we get the matchers warmed up, and fire the correct one.
				this.addMatchers();
				this.doMatch();
			} else {
				this.processMultiple();
			}

		},

		/**
		 * Matches the given expression to a type of match, throws an error if no match is found.
		 * @return {String} The match type;
		 */
		discoverType: function () {

			var that = this,
				returnVal;

			data.forEach(config.types, function (i, type) {

				if (config[type].discover.test(that.testString)) {
					that.testType = returnVal = type;
					// console.log("Matches test type: " + type);
				}

			});

			if (!returnVal) {
				throw new Error("No valid match expression found: " + that.testString);
			}

			return returnVal;

		},

		/**
		 * Finds the text which is delimiting the function (e.g. an equals sign)
		 * @return {String} The delimeter.
		 */
		findDelimeter: function () {

			var matches = config[this.testType].delimeter.test(this.testString),
				testConfig = config[this.testType];

			if (matches) {

				if (testConfig.delimitMatch instanceof RegExp) {
					this.delimeter = this.testString.match(testConfig.delimitMatch)[0];
				} else {
					this.delimeter = testConfig.delimitMatch;
				}

			} else if (this.testString.indexOf(testConfig.delimitFalse) > -1) {
				this.delimeter = testConfig.delimitFalse;
			} else {
				throw new Error("No valid delimeter found in match expression.\n (If you're seeing this error, I messed up somwehere)");
			}

			this.delimeter = this.delimeter.trim();

			return this.delimeter;

		},

		/**
		 * Finds the parts of the query and returns them
		 * @return {Array} An Array containing the part before and after the delimeter.
		 */
		findQueryParts: function () {

			var delimeter = this.delimeter,
				theString = this.testString,
				testConfig = config[this.testType],
				firstPart,
				lastPart;

			firstPart = theString.substring(0, theString.indexOf(delimeter) -1).trim();

			lastPart = theString.substring(theString.indexOf(delimeter) + delimeter.length + 1, theString.length).trim();

			//console.log(lastPart.indexOf("\\"));

			this.queryParts = [firstPart, lastPart];

			return [firstPart, lastPart];

		},

		/**
		 * Fires the matcher for the match type
		 */
		doMatch: function () {

			var matcher = this.matchers[this.testType],
				results;

			if (matcher !== undefined) {

				results = this[matcher].apply(this, this.queryParts);

				return results;

			} else {

				throw new TypeError("No match function found for type " + this.testType);

			}

		},

		/**
		 * Finds all matcher functions and adds them to an array so we can find them later :)
		 */
		addMatchers: function (searchObject) {

			var owns = Object.prototype.hasOwnProperty,
				prop,
				validMatches;

			if (!searchObject) {
				searchObject = this;
			}

			if (!this.matchers) {
				this.matchers = {};
			}

			for (prop in searchObject) {

				validMatches = prop.match(/[\w]*(?=Matcher)/);

				if (validMatches && validMatches.length > 0) {
					this.matchers[validMatches[0]] = prop;
				}

			}

			delete this.matchers.add;

			return this.matchers;

		},

		/**
		 * Checks if first equals last
		 * @param  {String|Number} first The first part of the expression
		 * @param  {String|Number} last  The last part of the expression
		 * @return {Array}       The row numbers which match
		 */
		equalsMatcher: function (first, last) {

			this.performBasicMatch("=", first, last);

			return this.rows;

		},

		/**
		 * Checks if first greater than last
		 * @param  {String|Number} first The first part of the expression
		 * @param  {String|Number} last  The last part of the expression
		 * @return {Array}       The row numbers which match
		 */
		morethanMatcher: function (first, last) {

			this.performBasicMatch(">", first, last);

			return this.rows;

		},

		/**
		 * Checks if first greater than last
		 * @param  {String|Number} first The first part of the expression
		 * @param  {String|Number} last  The last part of the expression
		 * @return {Array}       The row numbers which match
		 */
		lessthanMatcher: function (first, last) {

			this.performBasicMatch("<", first, last);

			return this.rows;

		},

		/**
		 * Checks if first greater than last
		 * @param  {String|Number} first The first part of the expression
		 * @param  {String|Number} last  The last part of the expression
		 * @return {Array}       The row numbers which match
		 */
		notequalMatcher: function (first, last) {

			this.performBasicMatch("!=", first, last);

			return this.rows;

		},

		/**
		 * Checks if first contains last
		 * @param  {String|Number} first The column name
		 * @param  {String|Number} last  The row value
		 * @return {Array}       The row numbers which match
		 */
		containsMatcher : function (first, last) {

			var that = this;

			data.forEachDeep(this.CSVData, function (rowIndex, fieldLabel, field) {

				field = field.toString().trim();
				fieldLabel = fieldLabel.trim();

				if (fieldLabel === first) {

					if (field.indexOf(last) > -1) {
						that.rows.push(that.CSVData[rowIndex]);
					}

				}

			});

		},

		/**
		 * Checks if first matches the RegExp
		 * @param  {String|Last} first The column name
		 * @param  {RegExp} last  The regex to match
		 * @return {Array}       The row numbers which match
		 */
		matchesMatcher : function (first, last) {

			var flags,
				that = this,
				regExp;

			// Cleanup the RegExp if necessary
			if (last.substring(0, 1) === "/") {
				last = last.substring(1, last.length);
			}

			if (/\/[gim]/.test(last.substr(last.length - 2, 2))) {
				flags = last.substr(last.length - 1, 1);
				last = last.substring(0, last.length - 2);
			}

			regExp = new RegExp(last, flags);

			data.forEachDeep(this.CSVData, function (rowIndex, fieldLabel, field) {

				field = field.toString().trim();
				fieldLabel = fieldLabel.trim();

				if (fieldLabel === first) {

					//console.log(new RegExp(last));

					if (regExp.test(field)) {
						that.rows.push(that.CSVData[rowIndex]);
					}

				}

			});

		},

		/**
		 * Performs a match which is a basic arithmetic operation
		 * (Equals, More than, less than). This is called by internal functions.
		 * @param  {String} expression - The arithmetic operation to perform ("<", ">" or "=")
		 * @param  {String|Number} first - The column name
		 * @param  {String|Number} last - The column value
		 * @return {Array} - The row numbers which match
		 */	
		performBasicMatch: function (expression, first, last) {

			var validOption = [">", "<", "=", "!="],
				that = this;

			if (validOption.indexOf(expression) > -1) {

				data.forEachDeep(this.CSVData, function (rowIndex, fieldLabel, field) {

					field = field.toString().trim();
					fieldLabel = fieldLabel.trim();

					if (fieldLabel === first) {

						switch (expression)
						{
						case ">":
							if (parseInt(field, 10) > parseInt(last, 10)) {
								that.rows.push(that.CSVData[rowIndex]);
							}
							break;
						case "<":
							if (parseInt(field, 10) < parseInt(last, 10)) {
								that.rows.push(that.CSVData[rowIndex]);
							}
							break;
						case "=":
							if (field === last) {
								that.rows.push(that.CSVData[rowIndex]);
							}
							break;
						case "!=":
							if (field !== last) {
								that.rows.push(that.CSVData[rowIndex]);
							}
						}

					}

				});

			} else {
				throw new Error("A basic match cannot be performed for " + expression);
			}

			return that.rows;

		},

		findCombo: function () {

			var that = this;

			this.combos = this.testString.split(/(\sand\s|\s[&]{2}(?!&)\s)/g);

			data.forEach (this.combos, function (index, value) {

				if (/(and|[&]{2})/g.test(value)) {

					that.combos.splice(index, 1);

				}

			});

			return this.combos;

		},

		processMultiple: function () {

			var matcher = new data.CSVMatcher(this.CSVData, this.combos[0]);

			this.combos.splice(0, 1);

			data.forEach(this.combos, function (i, exp) {

				matcher = new data.CSVMatcher(matcher.rows, exp);

			});

			this.rows = matcher.rows;

		}

	});

}());
data.CSVObject = (function () {

	"use strict";

	return data.createClass({

		init: function () {

			this.rowCount = null;
			this.columns = [];
			this.rows = [];

		},

		push: function (value) {

			Array.prototype.push.call(this.rows, value);

			this.rowCount += 1;

			return this.rows;

		},

		where: function (expression) {

			var Matcher = new data.CSVMatcher(this.rows, expression),
				returnRows = new data.CSVObject(),
				that = this;

			returnRows.setColumns(this.columns);

			data.forEach(Matcher.rows, function (i, row) {

				returnRows.push(row);

			});

			return returnRows;

		},

		setColumns: function (columnArray) {

			var that = this;

			if (!this.columns) {
				this.columns = [];
			}

			data.forEach(columnArray, function (i, column) {
				that.columns.push(column.trim());
			});

			return this.columns;

		},

		get: function (columnName) {

			var returnArr = [];

			data.forEachDeep(this.rows, function (index, column, value) {

				if (column === columnName) {
					returnArr.push(value);
				}

			});

			if (returnArr.length === 1) {
				returnArr = returnArr[0];
			}

			return returnArr;

		},

		toCSV: function (delimeter) {

			return data.JSONtoCSV(this.rows, delimeter);

		}

	});

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
(function (data) {

	"use strict";

	var singleXMLNode = function (XMLNode) {

		var nodeData = {},
			attributes = {};

		if (XMLNode.nodeValue) {
			nodeData.textContent = XMLNode.nodeValue;
		} else if (XMLNode.childNodes[0].nodeType === 3) {
			nodeData.textContent = XMLNode.firstChild.nodeValue.trim();
		}

		if (XMLNode.attributes && XMLNode.attributes.length > 0) {

			for (var attr in XMLNode.attributes) {
				if (Object.prototype.hasOwnProperty.call(attr, XMLNode.attributes)) {
					attributes[XMLNode.attributes[attr].nodeName] = XMLNode.attributes[attr].nodeValue;
				}
			}

			nodeData["@attributes"] = attributes;

		}

		if (XMLHasChildren(XMLNode)) {

			// Do something if I have children

		}

		return nodeData;

	};

	var XMLHasChildren = function (XMLNode) {

		var validChildren = 0;

		data.forEach (XMLNode.childNodes, function (i, node) {
			if (node.nodeType === 1) {
				validChildren += 1;
			}
		});

		return validChildren > 0;

	};

	data.mapXML = function (XMLDoc) {

		var rootNode,
			map;

		//First, find the first root element.
		data.forEach(XMLDoc.childNodes, function (i, node) {

			if (node.nodeType === 1) {
				rootNode = node;
				return false;
			}

		});

		map = {};
		map[rootNode.tagName] = {};

		return map;

	};

}(data));