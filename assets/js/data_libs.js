$(function () {

	var hiddenClass = "is-hidden";

	//Throw a message with our error popup
	$.extend({
		dataThrowError: function (message) {
			var errorPopup = $("#error"),
				errorText = errorPopup.find("p").first(),
				errorOverlay = $(".overlay[data-popup=error]");

				errorPopup.removeClass(hiddenClass);
				errorText.html(message);
				errorOverlay.removeClass(hiddenClass);

		},
		// Initalise popups and bind handlers
		dataSetupPopups: function (popupClass) {

			$.each($(popupClass), function () {

				var targetID = $(this).attr("id");

				$("body").append("<div class='overlay is-hidden' data-popup='" + targetID + "'></div>");

				$(".popup-open[href='#" + targetID + "']").on("click", function () {
					$(".overlay[data-popup='" + targetID + "']").removeClass(hiddenClass);
					$(".popup[id='" + targetID + "']").removeClass(hiddenClass);
				});

			});

			//Popup closing
			$(".popup-close").on("click", function () {
				var activePopup = $(".popup:not(.is-hidden)")[0].id;
				$("#" + activePopup + ", .overlay[data-popup='" + activePopup + "']").addClass(hiddenClass);
			});

		},
		dataShowPopup: function (ID) {

			$("#" + ID + ", .overlay[data-popup='" + ID + "']").removeClass("is-hidden");

		},
		dataHidePopup: function (ID) {

			$("#" + ID + ", .overlay[data-popup='" + ID + "']").addClass("is-hidden");

		},
		//Bind label click to focus the element
		dataBindLabels: function () {
			// Bind label click to focus the input
			$("label").on("click", function () {
				$("#" + $(this).attr("for")).focus();
			});
		},
		// Radio buttons
		dataShowIfChecked: function (radioSelector, hiddenSelector) {

			var radios = $("input[name='" + $(radioSelector).attr("name") + "']");

			radios.on("change" , function () {

				if ($(radioSelector).is(":checked")) {
					$(hiddenSelector).removeClass(hiddenClass);
				} else {
					$(hiddenSelector).addClass(hiddenClass);
				}

			});

		},
		// Supress form submit
		dataSupressFormClass: function (selector) {

			$(selector).on("submit", function (e) {
				e.preventDefault();
			});

		}
	});

	//$(document).trigger("dataExtensionsReady");

});