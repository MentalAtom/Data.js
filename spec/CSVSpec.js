window.processedData = null;
window.loadedData = null;
window.invalidData = null;
window.weatherData = null;

describe("CSV Conversion", function() {

  beforeEach(function() {
    data.load("http://127.0.0.1/Simple.csv", {
      type: "GET",
      callback: function (response) {
        window.loadedData = response;
        window.processedData = data.CSVtoJSON(loadedData);
      }
    });

    data.load("http://127.0.0.1/Broken.csv", {
      type: "GET",
      callback: function (response) {
        window.invalidData = response;
      }
    });

    data.load("http://127.0.0.1/Weather.csv", {
      type: "GET",
      callback: function (response) {
        window.weatherData = data.CSVtoJSON(response);
      }
    });

    waits(250);
  });

  describe("Read CSV file length correctly", function () {

    it("Should read the loaded CSV as a string", function() {
      // console.log(loadedData);
      expect(loadedData).toHaveTypeOf("string");
    });

    it("Should convert Simple.csv into an Object with a length of 3", function() {
      expect(processedData.rows).toHaveLengthOf(3);
    });

    it("Should count the number of rows to be the same as the converted data", function () {

      var rowNum = data.countRows(loadedData);

      expect(rowNum).toEqual(processedData.rowCount);

    });

    it("Should count the number of rows to be one higher if we specify countheadings as true", function () {

      var rowNum = data.countRows(loadedData, true);

      expect(rowNum).toEqual(processedData.rowCount + 1);

    });

  });

  describe("Know when a CSV file is invalid", function () {

    it("Should return true for a valid CSV when isValidCSV is called, and false when an invalid CSV is called", function () {

      var isValid = data.isValidCSV(loadedData);
      expect(isValid).toEqual(true);

      isValid = data.isValidCSV(invalidData);
      expect(isValid).toEqual(false);

    });

  });

  describe("Should know what it can match and what it can't", function () {

    it("Should throw an error when a matcher is used which doesnt exist", function () {

      expect(function () {processedData.where("foo eats bar");}).toThrow(new Error("No valid match expression found: foo eats bar"));

    });

    it("Should not throw an error when a valid matcher is used", function () {

      var matchers = ["equals", "greater than", "less than", "contains", "not equal to"];

      data.forEach(matchers, function (i, matcher) {

        expect(processedData.where("foo " + matcher + " bar")).toBeDefined();
      
      }); 

    });

  });

  describe("Should be able to parse strings into numbers when needed", function () {

    it("Should know when a value is a number, and parse it", function () {

      expect(data.parseNum("55")).toHaveTypeOf("number");

    });

    it("Should know when a value is not a number, and return it as a string", function () {

      expect(data.parseNum("abc5")).toHaveTypeOf("string");

    });

  });

  describe("JSON -> CSV Conversion", function () {

    it("Should be able to convert a CSV object back into a CSV", function () {

      expect(processedData.toCSV()).toBeDefined();

      expect(processedData.toCSV()).toHaveTypeOf("string");

    });

    it("Should create a CSV which is valid", function () {

      expect(data.isValidCSV(processedData.toCSV())).toBeTruthy();

    });

  });

  describe("Table R/W", function () {

    var table;

    it("Should generate a table with the correct number of rows", function () {

      table = data.drawAsTable(window.weatherData, {style: "display: none;"});

      waits(100);

      expect(table.rows.length).toEqual(399);

    });

    it("Should convert a table back into a CSV with the same number of rows", function () {

      var tableData = data.CSVfromTable(table);

      // console.log(tableData);

      expect(tableData.rows.length).toEqual(398);

    });

  });

});