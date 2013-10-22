$(function () {

	"use strict";

	var URLInput = document.getElementById("CSVFile"),
		GoGetBtn = document.getElementById("CSVGet"),
		validURL = /^(https?:\/\/)?([\da-z\.-]+)\.([0-9a-z\.]{2,6})*([\/\w-]+)\.csv\/?$/,
		response = $(".request-status"),
		goodResponse = "Cool! That's some fancy data you got there",
		badResponse = "Darn, looks like something went wrong :(",
		checkTimeout,
		CSVData,
		hiddenClass = "is-hidden";

		// Setup Popups
		$.dataSetupPopups(".popup");

		// Bind label click to focus input
		$.dataBindLabels();

		//Supress the forms
		$.dataSupressFormClass(".l-form");

		// Show the custom delimeter box if the custom radio is checked
		$.dataShowIfChecked("#custom", "label[for=customDelimeter], #customDelimeter");

		$.dataShowIfChecked("[name=delimeter]", ".step3");

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
						$(".step1 .overlay").removeClass(hiddenClass);
						$(".step2").removeClass(hiddenClass);
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

		// Get CSV Text from the input box instead
		$("#textinput").find(".btn-success").on("click", function () {
			CSVData = $("#textinput").find("textarea").val();
			$(".step2").removeClass(hiddenClass);
			$(".step1 .overlay").removeClass(hiddenClass);
		});

		// Text area (validate the CSV on input)
		$("#textinput").find("textarea").on("keyup", function () {

			if ($(this).val()) {
				$("#textinput").find(".btn-success").prop("disabled", false);
			} else {
				$("#textinput").find(".btn-success").prop("disabled", true);
			}

		});

		$(".btn_process").on("click", function () {

			var delimeter = $("#customDelimeter").val() ? $("#customDelimeter").val() : ",",
				errorPopup = $("#error"),
				errorText = errorPopup.find("p").first(),
				errorOverlay = $(".overlay[data-popup=error]");

			if ($("#custom").is(":checked") && $("#customDelimeter").val() === "") {
				$.dataThrowError("You didn't fill in your custom delimeter. I'm sure you'll get it right next time.");
				return false;
			}

			$.dataShowPopup("dataProcess");
			setTimeout( function () {
				$(window).trigger("doProcess", [CSVData, delimeter]);
			}, 500);

		});

});