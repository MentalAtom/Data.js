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

		}

	});

}());