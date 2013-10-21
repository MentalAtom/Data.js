$(function () {

	"use strict";

	var URLInput = document.getElementById("CSVFile"),
		GoGetBtn = document.getElementById("CSVGet"),
		validURL = /^(https?:\/\/)?([\da-z\.-]+)\.([0-9a-z\.]{2,6})*([\/\w-]+)\.csv\/?$/,
		response = $(".request-status"),
		goodResponse = "Cool! That's some fancy data you got there",
		badResponse = "Darn, looks like something went wrong :(",
		checkTimeout,
		CSVData;

	// Bind label click to focus the input
	$("label").on("click", function () {
		$("#" + $(this).attr("for")).focus();
	});

	// Stop the file form submitting at all ever.
	$(".l-form_inputfile").on("submit", function (e) {
		e.preventDefault();

		if ($(URLInput).hasClass("is-valid")) {

			$(GoGetBtn).addClass("show-spinner");

			data.load(URLInput.value, {
				type: "GET",
				callback: function (responseData) {
					$(GoGetBtn).removeClass("show-spinner");
					$(response).text(goodResponse);
					$(response).addClass("is-show").removeClass("status_fail").addClass("status_good");
					CSVData = responseData;
					$(".step1 .overlay").removeClass("is-hidden");
					$(".step2").removeClass("is-hidden");
				},
				fail: function () {
					$(GoGetBtn).removeClass("show-spinner");
					$(response).text(badResponse);
					$(response).addClass("is-show").removeClass("status_good").addClass("status_fail");
				}
			});

			setTimeout(function () {
				$(response).removeClass("is-show");
			}, 3000);

		}

	});

	// Hide the popup when a button is pressed
	$("#textinput").find(".btn").on("click", function () {
		$(".overlay, #textinput").addClass("is-hidden");
	});

	// Get CSV Text from the input box instead
	$("#textinput").find(".btn-success").on("click", function () {
		CSVData = $("#textinput").find("textarea").val();
		$(".step2").removeClass("is-hidden");
		$(".step1 .overlay").removeClass("is-hidden");
	});

	// Text area (validate the CSV on input)
	$("#textinput").find("textarea").on("keyup", function () {

		if ($(this).val()) {
			$("#textinput").find(".btn-success").prop("disabled", false);
		} else {
			$("#textinput").find(".btn-success").prop("disabled", true);
		}

	});

	// Validate the CSV URL before we try and get it
	$(URLInput).on("keyup", function (e) {

		if (e.which === 13) {
			e.preventDefault();
			return false;
		}

		GoGetBtn.disabled = true;
		clearTimeout(checkTimeout);

		checkTimeout = setTimeout(function () {
			if (validURL.test(URLInput.value)) {
				URLInput.className = "is-valid";
				GoGetBtn.disabled = false;
			} else {
				URLInput.className = "is-invalid";
				GoGetBtn.disabled = true;
			}
		}, 500);
		
	});

	// Set up popups
	$.each($(".popup-open"), function () {

		var targetID = $(this).attr("href").substring(1, $(this).attr("href").length);

		$("body").append("<div class='overlay is-hidden' data-popup='" + targetID + "'></div>");

		$(this).on("click", function () {
			$(".overlay[data-popup='" + targetID + "']").removeClass("is-hidden");
			$(".popup[id='" + targetID + "']").removeClass("is-hidden");
		});

	});

});