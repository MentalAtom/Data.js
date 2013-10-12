describe("CSV Conversion", function() {
  var loadedData,
      processedData,
      invalidData;

  beforeEach(function() {
    data.load("example/Simple.csv", {
      type: "GET",
      callback: function (response) {
        loadedData = response;
        processedData = data.CSVtoJSON(loadedData);
      }
    });

    data.load("example/Broken.csv", {
      type: "GET",
      callback: function (response) {
        invalidData = response;
      }
    });

    waits(100);
  });

  it("Should read the loaded CSV as a string", function() {
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

  it("Should return true for a valid CSV when isValidCSV is called, and false when an invalid CSV is called", function () {

    var isValid = data.isValidCSV(loadedData);
    expect(isValid).toEqual(true);

    isValid = data.isValidCSV(invalidData);
    expect(isValid).toEqual(false);

  });

});