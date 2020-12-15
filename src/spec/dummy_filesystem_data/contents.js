module.exports = function () {
    "use strict";
    var contents = [
      {
            "meta": {
                "name": "001",
                "description": "Description",
                "id": "000",
                "syntax": {
                    "name": "web",
                    "version": "1.0"
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
        }];

    return contents;
};
