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

	/**
	 * Converts an XML Object into a JSON Object
	 * @param {Object} XML The XML Object to convert
	 * @returns {Object} JSON Object of the XML
	 */
	xmlr.XMLtoJSON = function (XML) {

		var rootTag = xmlr.getRootElementName(XML),
			JSON = {},
			children = XML.getElementsByTagName(rootTag)[0].childNodes,
			numberOfChildren = xmlr.countChildNodes(XML) + 1,
			i = 0;

		JSON[rootTag] = [];

		for (i = 0; i !== numberOfChildren; i += 1) {

			if (children[i].nodeType !== 3) {

				JSON[rootTag].push(xmlr.nodeToJson(children[i]));
				JSON[rootTag][0]["_attr"] = xmlr.getAttributes(children[i]);
				JSON[rootTag][0]["_type"] = children[i].tagName;

			}

		}

		return JSON;

	};

	/**
	 * Takes a single XML Node and turns it into a JSON object recursively until all nodes are mapped
	 * @param  {Object} XMLNode The XML Node to parse
	 * @return {Object} - A JSON Object of the node
	 */
	xmlr.nodeToJson = function (XMLNode, pushTo, index) {

		var returnObj = [],
			owns = Object.prototype.hasOwnProperty,
			nodeData;

		xmlr.forEach(XMLNode.childNodes, function (key, value) {

			if (value.nodeType && value.nodeType !== 3) {

				nodeData = {};

				if (value.attributes.length > 0) {

					nodeData["attributes"] = xmlr.getAttributes(value);
					nodeData["tagName"] = value.tagName;
					if (xmlr.getNodeText(value, XMLNode)) {
						nodeData["text"] = xmlr.getNodeText(value);
					}

				} else {

					

				}
				

				returnObj.push(nodeData);

			}

		});

		return returnObj;

	};

	xmlr.getAttributes = function (XMLNode) {

		console.log(XMLNode);

		var returnObj = {},
			attr,
			owns = Object.prototype.hasOwnProperty;

		for (attr in XMLNode.attributes) {

			var thisAttr = XMLNode.attributes[attr];

			if (owns.call(XMLNode.attributes, thisAttr.nodeName)) {
				returnObj[thisAttr.nodeName] = thisAttr.nodeValue;
			}

		}

		return returnObj;

	};

	xmlr.getNodeText = function (XMLNode, parentNode) {

		var index,
			tagName = XMLNode.tagName,
			siblings = parentNode.getElementsByTagName(tagName);

		//Get the index of the node
		xmlr.forEach(siblings, function (i, node) {

			if (node === XMLNode.previousSibling) {

				console.log(siblings[i + 1]);

				if (siblings[i + 1].nodeValue) {
					console.log(siblings[i + 1].nodeValue);
				}

			}

		});

	};

})(XMLr);