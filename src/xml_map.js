(function () {

	"use strict";

	data.XMLHasChildren = function (XMLNode) {

		var validChildren = 0;

		data.forEach (XMLNode.childNodes, function (i, node) {
			if (node.nodeType === 1) {
				validChildren += 1;
			}
		});

		return validChildren > 0;

	};

	data.singleXMLNode = function (XMLNode) {

		var nodeData = {},
			internalNode;

		nodeData[XMLNode.tagName] = {};

		internalNode = nodeData[XMLNode.tagName];

		if (XMLNode.nodeValue) {
			internalNode.textContent = XMLNode.nodeValue;
		} else if (XMLNode.firstChild.nodeType.nodeType === 3) {
			internalNode.textContent = XMLNode.firstChild.nodeValue.trim();
		}

		if (data.XMLHasChildren(XMLNode)) {

			data.forEach(XMLNode.childNodes, function (i, node) {

				if (node.nodeType === 1) {
					
					if (!internalNode[node.tagName]) {
						internalNode[node.tagName] = data.singleXMLNode(node);
					} else {
						internalNode[node.tagName] = [internalNode[node.tagName]];
						internalNode[node.tagName].push(data.singleXMLNode(node));
					}

				}

			});
		}

		return nodeData;

	};

}());