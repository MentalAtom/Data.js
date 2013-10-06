(function (xmlr) {

	/**
	 * Gets the name of the root element of an XML object
	 * @param  {Object} XML The XML to determine the root object for
	 * @return {String}     The name of the root element
	 */
	xmlr.getRootElementName = function (XML) {

		var index;

		for (index in XML.childNodes) {

			if (XML.childNodes[index].nodeType === 1) {
				return XML.childNodes[index].tagName;
			}

		}
		
		throw new Error("Could not find root element");

	};

	/**
	 * Counts the direct children of the root element in an XML document
	 * @param  {Object} XML The XML document
	 * @returns {Number} The number of children of the root element
	 */
	xmlr.countChildNodes = function (XML) {

		var count = 0,
			child,
			rootTag = xmlr.getRootElementName(XML),
			children = XML.getElementsByTagName(rootTag)[0].childNodes;

		for (child in children) {

			if (children[child].nodeType && children[child].nodeType !== 3) {
				count += 1;
			}

		}

		return count;

	};

	xmlr.JSONtoXML = function (JSON, rootTagName) {

		var defaults = {
			rootTagName: "JSON"
		};

		if (!rootTagName) {
			rootTagName = defaults.rootTagName;
		}

		var newDoc = document.implementation.createDocument(null, null, null),
			rootEl;

		//Let us make the root element
		rootEl = document.createElement(rootTagName);
		newDoc.appendChild(rootEl);

		xmlr.forEach(JSON, function (key, value) {

			var newEl = document.createElement(key);

			newEl.innerHTML = value;

			rootEl.appendChild(newEl);

		});

		console.log(newDoc);

	};

})(data);