$(function () {

	$(window).on("doProcess", function (e, CSVData, delimeter) {

		var converted = data.CSVtoJSON(CSVData, delimeter);

		if (converted.rows.length > 500) {
			$("#dataProcess").find(".largeData").removeClass("is-hidden");
		}

		setTimeout(function () {
			data.drawAsTable(converted,
				{
					"class" : "niceTable"
				},
				$(".step4-data"),
				function () {
					$.dataHidePopup("dataProcess");
					$(".step1, .step2, .step3").addClass("is-hidden");
					$(".step4").removeClass("is-hidden");
					$("#dataProcess").find(".largeData").addClass("is-hidden");
				}
			);
		}, 200);

	});

});