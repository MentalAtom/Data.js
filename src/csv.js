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

        console.log(CSV);

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
     * @deprecated
     */
    data.drawAsTable = function (CSVData) {

        var table = document.createElement("table"),
            tbody = document.createElement("tbody"),
            thead = document.createElement("thead"),
            i,
            v = 0,
            rowcount;

        thead.insertRow(0);

        //Add the head of the table...
        for (i = 0; i < CSVData.columns.length; i += 1) {
            thead.rows[0].appendChild(document.createElement("th"));
            thead.rows[0].childNodes[i].appendChild(document.createTextNode(CSVData.columns[i]));
        }

        //And add the rows...
        data.forEach(CSVData.rows, function (a, row) {

            tbody.insertRow(a);

            data.forEach(row, function (field, value) {

                tbody.rows[a].insertCell();

                tbody.rows[a].cells[0].appendChild(document.createTextNode(value));

                v += 1;

            });

        });

        table.appendChild(thead);
        table.appendChild(tbody);

        document.getElementsByTagName("body")[0].appendChild(table);

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

            }

            returnObj.push(rowData);
            cellIndex = 0;

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