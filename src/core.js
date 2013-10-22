(function (data) {

    data.load = function (URL, options) {

        if (!options) {
            options = {};
        }

        var xhr = new XMLHttpRequest(),
            xdr,
            defaults = {
                type: "GET",
                data: ''
            },
            onload,
            onerror;

        options = data.extendObject(options, defaults);

        if (!window.XDomainRequest) {

            onload = function () {
                if (!xhr.responseXML) {
                    options.callback(xhr.responseText);
                } else if (xhr.responseXML) {
                    options.callback(xhr.responseXML);
                }
            };

            onerror = function () {
                if (options.fail) {
                    options.fail(xhr.statusText);
                }
            };

            xhr.open(options.type, URL);

            // xhr.onload = onload;
            // Just for IE7 :)
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status === 200)) {
                    console.log(xhr);
                    onload();
                } else {
                    onerror();
                }
            };

            xhr.send(JSON.stringify(options.data));

        } else {

            onload = function () {
                options.callback(xdr.responseText);
            };

            xdr = new XDomainRequest();

            xdr.open(options.type, URL);

            xdr.onload = onload;

            xdr.send(JSON.stringify(options.data));

        }

    };

    data.forEach = function (data, callback) {

        var i,
            owns = Object.prototype.hasOwnProperty;

        for (i in data) {

            if (owns.call(data, i)) {
                callback(i, data[i]);
            }

        }

    };

    data.forEachDeep = function (data, callback) {

        var i,
            a,
            owns = Object.prototype.hasOwnProperty;

            for (i in data) {

                for (a in data[i]) {
                    callback(i, a, data[i][a]);
                }

            }

    };

})(data);