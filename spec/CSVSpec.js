describe("CSV Conversion", function() {
  var loadedData;
  var processedData;

  beforeEach(function() {
    data.load("example/Simple.csv", {
      type: "GET",
      callback: function (response) {
        loadedData = response;
        processedData = data.CSVtoJSON(loadedData);
      }
    });

    waits(100);
  });

  it("Should read the loaded CSV as a string", function() {
    expect(loadedData).toHaveTypeOf("string");
  });

  it("Should convert Simple.csv into an Object with a length of 3", function() {
    expect(processedData).toHaveLengthOf(3);
  });

  it("Should count the number of rows to be the same as the converted data", function () {

    var rowNum = data.countRows(loadedData);

    expect(rowNum).toEqual(processedData.length);

  });

  it("Should count the number of rows to be one higher if we specify countheadings as true", function () {

    var rowNum = data.countRows(loadedData, true);

    expect(rowNum).toEqual(processedData.length + 1);

  });

});