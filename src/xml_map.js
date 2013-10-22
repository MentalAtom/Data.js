(function (data) {

	"use strict";

	var singleXMLNode = function (XMLNode) {

		var nodeData = {},
			attributes = {};

		if (XMLNode.nodeValue) {
			nodeData.textContent = XMLNode.nodeValue;
		} else if (XMLNode.childNodes[0].nodeType === 3) {
			nodeData.textContent = XMLNode.firstChild.nodeValue.trim();
		}

		if (XMLNode.attributes && XMLNode.attributes.length > 0) {

			for (var attr in XMLNode.attributes) {
				if (Object.prototype.hasOwnProperty.call(attr, XMLNode.attributes)) {
					attributes[XMLNode.attributes[attr].nodeName] = XMLNode.attributes[attr].nodeValue;
				}
			}

			nodeData["@attributes"] = attributes;

		}

		if (XMLHasChildren(XMLNode)) {

			// Do something if I have children

		}

		return nodeData;

	};

	var XMLHasChildren = function (XMLNode) {

		var validChildren = 0;

		data.forEach (XMLNode.childNodes, function (i, node) {
			if (node.nodeType === 1) {
				validChildren += 1;
			}
		});

		return validChildren > 0;

	};

	data.mapXML = function (XMLDoc) {

		var rootNode,
			map;

		//First, find the first root element.
		data.forEach(XMLDoc.childNodes, function (i, node) {

			if (node.nodeType === 1) {
				rootNode = node;
				return false;
			}

		});

		map = {};
		map[rootNode.tagName] = {};

		return map;

	};

}(data));