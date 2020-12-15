/*
 * Copyright 2020 Ally Financial, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

 /* jshint ignore:start */

var path   = require("path"),
    fs     = require("fs");

delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Vars"))];

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Vars should pass all validation tests', function () {
  var soda, localVars, Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")), Vars = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Vars"));

    function clearRequireCache() {
      Object.keys(require.cache).forEach(function (key) {
          delete require.cache[key];
      });
    }

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      clearRequireCache();
      
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);

        soda.vars.empty();
        localVars = soda.vars;

        done();
      });
    });

    afterAll(function (done) {
      soda.kill();

      soda = null;
      
      done();
    });

    it('Should start with the appropriate varaibles', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);

      done();
    });

    it('Should empty all varaibles when there are none without side effect', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      localVars.empty();
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);

      done();
    });

    it('Should save a global variable that is non-persitent and not reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_gvar_", "global value", false, true, true);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      localVars.empty();

      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);

      done();
    });

    it('Should save a global variable that is non-persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_gvar_", "global value", false, true, false);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      localVars.empty();

      done();
    });

    it('Should save a global variable that is persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(11);
      expect(localVars.getAllVariables().sodamembers).toEqual(11);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(4);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_gvar_", "global value", true, true, false);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      localVars.delete("_gvar_");
      localVars.empty();

      done();
    });

    it('Should not be able to delete a global variable that is persitent', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      localVars.delete("_gvar_");

      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      done();
    });

    it('Should save a global variable that is persitent and not reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(12);
      expect(localVars.getAllVariables().sodamembers).toEqual(12);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_gvar1_", "global value", true, true, true);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_gvar_")).toEqual("global value");

      localVars.empty();

      done();
    });

    it('Should be able to change a persitent variables value', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_gvar_", "updated value", true, true, false);
      expect(localVars.get("_gvar_")).toEqual("updated value");

      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);

      localVars.empty();

      done();
    });

    it('Should save and get a local variable that is non-persitent and not reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_lvar_", "local value", false, false, true);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(14);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual("local value");

      localVars.empty();

      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      done();
    });

    it('Should delete and not get a local variable that is non-persitent and not reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.delete("_lvar_");

      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual(null);

      done();
    });

    it('Should save and get a local variable that is non-persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_lvar_", "local value", false, false, false);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(14);
      expect(localVars.getAllVariables().sodamembers).toEqual(14);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(6);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual("local value");

      localVars.empty();

      done();
    });

    it('Should delete and not get a local variable that is non-persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.delete("_lvar_");

      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual(null);

      localVars.empty();

      done();
    });

    it('Should save and get a local variable that is persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(13);
      expect(localVars.getAllVariables().sodamembers).toEqual(13);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(5);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.save("_lvar_", "local value", true, false, false);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(14);
      expect(localVars.getAllVariables().sodamembers).toEqual(14);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(6);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual("local value");

      localVars.delete("_gvar_");
      localVars.empty();

      done();
    });

    it('Should not be able to delete a local variable that is persitent and reportable', function (done) {
      expect(localVars.getAllVariables(true).sodamembers).toEqual(14);
      expect(localVars.getAllVariables().sodamembers).toEqual(14);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(6);

      //(key, value, persistent, isGlobal, dontReport)
      localVars.delete("_lvar_");

      expect(localVars.getAllVariables(true).sodamembers).toEqual(14);
      expect(localVars.getAllVariables().sodamembers).toEqual(14);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(6);
      expect(localVars.get("global_n")).toBeInstanceOf(Object);
      expect(localVars.get("_lvar_")).toEqual("local value");

      localVars.empty();

      done();
    });

    it('Should be able to save holidays', function (done) {
      var holidays = [];

      var holidayObjects = [
    		  {
    			 "name":"New Years Day",
    			 "date":"01,01,2015"
    		  },
    		  {
    			 "name":"Martin Luther King Day",
    			 "date":"19,01,2015"
    		  },
    		  {
    			 "name":"Presidents Day",
    			 "date":"16,02,2015"
    		  },
    		  {
    			 "name":"Memorial Day",
    			 "date":"25,05,2015"
    		  },
    		  {
    			 "name":"Independence Day",
    			 "date":"04,07,2015"
    		  },
    		  {
    			 "name":"Labor Day",
    			 "date":"07,09,2015"
    		  },
    		  {
    			 "name":"Columbus Day",
    			 "date":"12,10,2015"
    		  },
    		  {
    			 "name":"Veterans Day",
    			 "date":"11,11,2015"
    		  },
    		  {
    			 "name":"Thanksgiving Day",
    			 "date":"26,11,2015"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"25,12,2015"
    		  },
    		  {
    			 "name":"New Years Day",
    			 "date":"01,01,2016"
    		  },
    		  {
    			 "name":"Martin Luther King Day",
    			 "date":"18,01,2016"
    		  },
    		  {
    			 "name":"Presidents Day",
    			 "date":"15,02,2016"
    		  },
    		  {
    			 "name":"Memorial Day",
    			 "date":"30,05,2016"
    		  },
    		  {
    			 "name":"Independence Day",
    			 "date":"04,07,2016"
    		  },
    		  {
    			 "name":"Labor Day",
    			 "date":"05,09,2016"
    		  },
    		  {
    			 "name":"Columbus Day",
    			 "date":"10,10,2016"
    		  },
    		  {
    			 "name":"Veterans Day",
    			 "date":"11,11,2016"
    		  },
    		  {
    			 "name":"Thanksgiving Day",
    			 "date":"24,11,2016"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"25,12,2016"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"26,12,2016"
    		  },
    		  {
    			 "name":"New Years Day",
    			 "date":"01,01,2017"
    		  },
    		  {
    			 "name":"Martin Luther King Day",
    			 "date":"16,01,2017"
    		  },
    		  {
    			 "name":"Presidents Day",
    			 "date":"20,02,2017"
    		  },
    		  {
    			 "name":"Memorial Day",
    			 "date":"29,05,2017"
    		  },
    		  {
    			 "name":"Independence Day",
    			 "date":"04,07,2017"
    		  },
    		  {
    			 "name":"Labor Day",
    			 "date":"04,09,2017"
    		  },
    		  {
    			 "name":"Columbus Day",
    			 "date":"09,10,2017"
    		  },
    		  {
    			 "name":"Veterans Day",
    			 "date":"11,11,2017"
    		  },
    		  {
    			 "name":"Thanksgiving Day",
    			 "date":"23,11,2017"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"25,12,2017"
    		  },
    		  {
    			 "name":"New Years Day",
    			 "date":"01,01,2018"
    		  },
    		  {
    			 "name":"Martin Luther King Day",
    			 "date":"15,01,2018"
    		  },
    		  {
    			 "name":"Presidents Day",
    			 "date":"19,02,2018"
    		  },
    		  {
    			 "name":"Memorial Day",
    			 "date":"28,05,2018"
    		  },
    		  {
    			 "name":"Independence Day",
    			 "date":"04,07,2018"
    		  },
    		  {
    			 "name":"Labor Day",
    			 "date":"03,09,2018"
    		  },
    		  {
    			 "name":"Columbus Day",
    			 "date":"08,10,2018"
    		  },
    		  {
    			 "name":"Veterans Day",
    			 "date":"12,11,2018"
    		  },
    		  {
    			 "name":"Thanksgiving Day",
    			 "date":"22,11,2018"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"25,12,2018"
    		  },
    		  {
    			 "name":"New Years Day",
    			 "date":"01,01,2019"
    		  },
    		  {
    			 "name":"Martin Luther King Day",
    			 "date":"21,01,2019"
    		  },
    		  {
    			 "name":"Presidents Day",
    			 "date":"18,02,2019"
    		  },
    		  {
    			 "name":"Memorial Day",
    			 "date":"27,05,2019"
    		  },
    		  {
    			 "name":"Independence Day",
    			 "date":"04,07,2019"
    		  },
    		  {
    			 "name":"Labor Day",
    			 "date":"02,09,2019"
    		  },
    		  {
    			 "name":"Columbus Day",
    			 "date":"14,10,2019"
    		  },
    		  {
    			 "name":"Veterans Day",
    			 "date":"11,11,2019"
    		  },
    		  {
    			 "name":"Thanksgiving Day",
    			 "date":"28,11,2019"
    		  },
    		  {
    			 "name":"Christmas Day",
    			 "date":"25,12,2019"
    		  }
    	 ];

      holidayObjects.forEach(function (holiday) { holidays.push(holiday["date"]); });

      localVars.save("holidays", holidays, true, true, true);

      expect(localVars.getAllVariables(true).sodamembers).toEqual(15);
      expect(localVars.getAllVariables().sodamembers).toEqual(15);
      expect(localVars.getAllNonPersistent().sodamembers).toEqual(6);

      localVars.saveDateVars(holidays);

      expect(localVars.get('_today_')).toEqual(new Date().longdate());
      expect(localVars.get('_today_web_')).toEqual(new Date().ddmmyyyy('/'));
      expect(localVars.get('_today_medium_zero_formatted_')).toEqual(new Date().mediumdate());
      expect(localVars.get('_today_medium_zero_formatted_')).toEqual(new Date().mediumdate());
      expect(localVars.get('_scheduled_today_')).toEqual("Your Scheduled Delivery Date is Today, " + new Date().longdate());
      expect(localVars.get('_5_days_from_now_')).toEqual(new Date().advanceDays(5).yyyymmdd('-'));
      expect(localVars.get('_10_days_from_now_')).toEqual(new Date().advanceDays(10).yyyymmdd('-'));

      done();
    });
});
