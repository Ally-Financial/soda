module.exports = function (sodaDbRef) {
    "use strict";
    sodaDbRef.on("get contents for", function (asset, send) {
        send(null, {
            "meta": {
                "name": asset.name,
                "description": asset.description,
                "id": asset.id || "000",
                "syntax": {
                    "name": "mobile",
                    "version": "2.0"
                }
            },
            "actions": [
                {
                    "goto": "http://www.ally.com"
                },
                {
                    "wait": 1
                },
                {
                    "goto": "http://www.google.com"
                },
                {
                    "wait": 1
                }
            ]
        });
    });
};
