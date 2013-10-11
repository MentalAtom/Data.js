data.CSVMatcher = (function () {

	"use strict";

	var config = {
		types: ["equals", "morethan", "lessthan"],
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

			//Work out the type of match...
			this.discoverType();
			//And then find the delimeter
			this.findDelimeter();
			//And then, get both parts of the query.
			this.findQueryParts();
			//Now we get the matchers warmed up, and fire the correct one.
			this.addMatchers();
			this.doMatch();

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
					console.log("Matches test type: " + type);
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

				console.log("Found match");

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
		 * Performs a match which is a basic arithmetic operation
		 * (Equals, More than, less than). This is called by internal functions.
		 * @param  {String} expression - The arithmetic operation to perform ("<", ">" or "=")
		 * @param  {String|Number} first - The column name
		 * @param  {String|Number} last - The column value
		 * @return {Array} - The row numbers which match
		 */	
		performBasicMatch: function (expression, first, last) {

			var validOption = [">", "<", "="],
				that = this;

			if (validOption.indexOf(expression) > -1) {

				data.forEachDeep(this.CSVData, function (rowIndex, fieldLabel, field) {

					field = field.trim();
					fieldLabel = fieldLabel.trim();

					if (fieldLabel === first) {

						switch (expression)
						{
						case ">":
							if (parseInt(field, 10) > parseInt(last, 10)) {
								that.rows.push(rowIndex);
							}
							break;
						case "<":
							if (parseInt(field, 10) < parseInt(last, 10)) {
								that.rows.push(rowIndex);
							}
							break;
						case "=":
							if (field === last) {
								that.rows.push(rowIndex);
							}
							break;
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

			console.log(this.combos);

		}

	});

}());