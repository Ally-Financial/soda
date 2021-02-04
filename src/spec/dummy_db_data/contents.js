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
                    "goto": "http://www.google.com"
                },
                {
                    "set": "*[type='input'][attributes.type='text'][nth='first']",
                    "to": asset.name + " " + asset.suite + " " + asset.module + " " + asset.platform
                },
                {
                    "wait": 1
                },
                {
                    "refresh": true
                },
                {
                    "save": ".{gsfi}[nth='last']",
                    "property": "value",
                    "as": "assetInfo"
                },
                {
                    "waitFor": "^btnK[type='input'][attributes.type='submit'][nth='last']"
                },
                {
                    "click": "^btnK[type='input'][attributes.type='submit'][nth='last']"
                }
            ]
        });
    });
};
