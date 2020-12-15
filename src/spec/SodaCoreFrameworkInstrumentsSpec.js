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

"use strict";
/*
var chai = require('chai'),
    nil = require('chai-null'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    chaiSubset = require("chai-subset"),
    path   = require("path"),
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    events = require("events"),
    spies = require('chai-spies'),
    child_process     = require("child_process"),
    sinonChai  = require("sinon-chai"),
    nock = require('nock'),
    sinon = require('sinon');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

chai.should();
chai.use(nil);
chai.use(chaiSubset);
chai.use(spies);
chai.use(sinonChai);

Object.freeze = function(obj) { return obj; };

describe('Framework instruments should pass all validation tests', function () {
  var soda, instrumentsFramework, settings, buildTree, emulatorControl, elementInteractions, deviceList;

    beforeAll(function (done) {
      this.timeout(1000 * 40);

      deviceList = `USCHAMNECJPG8WL [27DA9139-84AD-53C4-8187-126CF502F72B]
Apple TV (11.3) [EB0C4F69-5B0E-464F-B9CA-9E04F8A09182] (Simulator)
Apple TV 4K (11.3) [D592EA58-BA69-41E5-9686-8E12995CE44D] (Simulator)
Apple TV 4K (at 1080p) (11.3) [39CD27FA-1E39-4579-AD37-CA2AA5F91BCA] (Simulator)
Apple Watch - 38mm (4.3) [FB3C3F8E-3E06-4C1F-98F2-94820DFB0C59] (Simulator)
Apple Watch - 42mm (4.3) [89D8E1C6-A99F-4AAB-80FA-69B4973134BD] (Simulator)
iPad (5th generation) (10.3.1) [B07E59A3-A43B-4EEF-BC32-4C4690C6A185] (Simulator)
iPad (5th generation) (11.0.1) [05EDDA46-411A-4255-8D58-7F08C4A37064] (Simulator)
iPad (5th generation) (11.1) [4C2B5D3E-36A3-45CC-9636-35F6AFB34CF8] (Simulator)
iPad (5th generation) (11.2) [1F1700A7-DD1B-4254-9929-18583813D857] (Simulator)
iPad (5th generation) (11.3) [32E2A3C4-C0FA-4904-A0F6-63426D1A3B35] (Simulator)
iPad Air (10.0) [FB407BC6-303C-4EA3-B9AC-6EF53B59BBBB] (Simulator)
iPad Air (10.1) [935ED2A0-40A0-4ED4-ABA6-DF46113403FE] (Simulator)
iPad Air (10.2) [0D2898E5-5D83-4AE8-8167-72569B6A2514] (Simulator)
iPad Air (10.3.1) [C3574958-A4DA-429A-A2A7-BE20AD1A4706] (Simulator)
iPad Air (11.0.1) [FE46A235-A695-4037-9094-9076F4C79318] (Simulator)
iPad Air (11.1) [BE2DD883-A5DE-4B80-BD74-FE490DBB1324] (Simulator)
iPad Air (11.2) [B97B2D58-790C-46DB-B4D5-62283508AB7F] (Simulator)
iPad Air (11.3) [709E6548-6DC8-4331-8001-A6F5BE96B8CE] (Simulator)
iPad Air 2 (10.0) [93337B65-5F4A-43BF-9A16-763F31F41A5B] (Simulator)
iPad Air 2 (10.1) [C823C084-7692-4300-99AC-20D6FC3AD344] (Simulator)
iPad Air 2 (10.2) [DEB9C81F-D358-44DB-AF92-673F16F9E0C6] (Simulator)
iPad Air 2 (10.3.1) [C63578D0-9CF5-4801-91C5-A3E57651C7A2] (Simulator)
iPad Air 2 (11.0.1) [4DEFA683-946A-4930-B16E-A285AE688251] (Simulator)
iPad Air 2 (11.1) [8095B825-89AB-415A-A3E7-E6203615EFF2] (Simulator)
iPad Air 2 (11.2) [A98B4BDA-0B56-4D15-9D78-14AB692E2211] (Simulator)
iPad Air 2 (11.3) [0AEDEEA7-A3A9-4669-9E8B-5F3283EF6D1F] (Simulator)
iPad Pro (10.5-inch) (10.3.1) [43DD9FCC-FB42-43C5-83C8-68EC33F9D813] (Simulator)
iPad Pro (10.5-inch) (11.0.1) [6B9F055B-7C99-4576-A510-C445637233D6] (Simulator)
iPad Pro (10.5-inch) (11.1) [5C722950-5E64-471D-BCA6-0C4231148474] (Simulator)
iPad Pro (10.5-inch) (11.2) [D9C15380-082C-4A45-A1BF-DD7DA8B5741A] (Simulator)
iPad Pro (10.5-inch) (11.3) [80F3DBDF-DF1A-4066-B014-233AD117AA37] (Simulator)
iPad Pro (12.9 inch) (10.0) [94DA42C1-44E1-4973-BD09-E66AD046E1AA] (Simulator)
iPad Pro (12.9 inch) (10.1) [3E56AB37-8F90-4099-BFAA-AC171C03E5A2] (Simulator)
iPad Pro (12.9 inch) (10.2) [0B310654-180B-4F70-9543-9E808CF809E0] (Simulator)
iPad Pro (12.9 inch) (10.3.1) [3C2BFDAB-8F8F-4C23-80BC-5FF079E2719B] (Simulator)
iPad Pro (12.9-inch) (11.0.1) [1BEF12F5-CFCC-4D29-BDDA-FFBE5D21800F] (Simulator)
iPad Pro (12.9-inch) (11.1) [9A2E5D67-427E-4FCA-BC27-566F81CC4FBA] (Simulator)
iPad Pro (12.9-inch) (11.2) [3CBAC653-265E-402F-8DFD-B3DF4188F886] (Simulator)
iPad Pro (12.9-inch) (11.3) [D51581FE-E2CD-4A17-86CB-5A46FF1C3750] (Simulator)
iPad Pro (12.9-inch) (2nd generation) (10.3.1) [08A49309-A146-43F3-B843-5E7BEC5C0D29] (Simulator)
iPad Pro (12.9-inch) (2nd generation) (11.0.1) [E7BAA9E7-8CEA-457E-B352-8AF7653158E7] (Simulator)
iPad Pro (12.9-inch) (2nd generation) (11.1) [39722967-663D-4F99-87BA-ACEBBBD8975A] (Simulator)
iPad Pro (12.9-inch) (2nd generation) (11.2) [46371F51-4CA5-450C-BB33-8C4959B132EF] (Simulator)
iPad Pro (12.9-inch) (2nd generation) (11.3) [868B1859-057F-4BD9-A7E5-CF14C3C3B018] (Simulator)
iPad Pro (9.7 inch) (10.0) [AABA14A6-9FC4-4A7E-B584-D44CD3B6D9AB] (Simulator)
iPad Pro (9.7 inch) (10.1) [2CE21FF9-F722-4100-8C7A-C0973235C16C] (Simulator)
iPad Pro (9.7 inch) (10.2) [973E9444-63C2-4276-BE70-4304B6FB3F64] (Simulator)
iPad Pro (9.7 inch) (10.3.1) [06E423CB-032E-4E39-A801-B82EB7FD1586] (Simulator)
iPad Pro (9.7-inch) (11.0.1) [A131C212-4FD3-482B-8125-37B70A9B6656] (Simulator)
iPad Pro (9.7-inch) (11.1) [C4434F32-EC01-42DC-A89E-D008866A55EB] (Simulator)
iPad Pro (9.7-inch) (11.2) [D7143038-4452-49A9-ADD6-F188EE0C772A] (Simulator)
iPad Pro (9.7-inch) (11.3) [8162B9E7-3A93-4F2E-89B0-49646B627C6C] (Simulator)
iPhone 5 (10.0) [96B0F806-C1B1-49C6-8A7C-775CD8F210F5] (Simulator)
iPhone 5 (10.1) [10F29184-A208-469F-824C-C4CA5AA2B98D] (Simulator)
iPhone 5 (10.2) [6FCCB82C-D057-42C9-9F16-9AFC5024452A] (Simulator)
iPhone 5 (10.3.1) [B02B9FAB-E3B3-4FA8-9B25-EA2715E89577] (Simulator)
iPhone 5s (10.0) [98FA780F-E62F-45FD-A9E6-877CA46C75AF] (Simulator)
iPhone 5s (10.1) [9B4DB3C7-26F6-4C1D-AAA8-0F2AAF75DAB0] (Simulator)
iPhone 5s (10.2) [D9C2E946-BFBD-47E3-B5CE-5F307E23418A] (Simulator)
iPhone 5s (10.3.1) [DBA961E5-00B0-4300-A7DC-8E83F809D11E] (Simulator)
iPhone 5s (11.0.1) [327AB0DC-ED09-4391-8006-37EDF5618D43] (Simulator)
iPhone 5s (11.1) [B8263F84-D0BB-4D28-BD6F-FBA97F11F2B3] (Simulator)
iPhone 5s (11.2) [C9893AAB-0056-428E-A1FC-12DC73EB71E8] (Simulator)
iPhone 5s (11.3) [86489E30-C828-481B-A633-0F60FBC234F9] (Simulator)
iPhone 6 (10.0) [B3057260-F999-4B66-A691-6C5CC1344985] (Simulator)
iPhone 6 (10.1) [478FE9E7-ADA7-41DD-9E16-E5677B17A78D] (Simulator)
iPhone 6 (10.2) [BA2C9C9C-10DE-4099-ADFB-6A4B9FC83525] (Simulator)
iPhone 6 (10.3.1) [7B538F1F-B3D7-4EC0-B7EF-CA12A9318D30] (Simulator)
iPhone 6 (11.0.1) [C434220E-C64A-4CFA-8A37-8FF170F05B00] (Simulator)
iPhone 6 (11.1) [D4BED80E-777A-4F4D-90BA-4CA14110EA50] (Simulator)
iPhone 6 (11.2) [C0655EE1-4873-4CB9-9518-11375BEAAB7E] (Simulator)
iPhone 6 (11.3) [A0322AEC-E67C-48AB-985C-A148A1B0FCBE] (Simulator)
iPhone 6 Plus (10.0) [06B98022-8DA2-45FD-BFC4-C5E95807BEBC] (Simulator)
iPhone 6 Plus (10.1) [A69CA5F8-4B6A-421E-84F8-2D8F00F37FDF] (Simulator)
iPhone 6 Plus (10.2) [82DDF92E-51A2-4A4A-A0BB-D422D8EA4408] (Simulator)
iPhone 6 Plus (10.3.1) [328E8D3E-65E4-4DA8-A022-4E29E023D171] (Simulator)
iPhone 6 Plus (11.0.1) [E5D74832-B07B-4ED5-8F85-A2BAEC75591A] (Simulator)
iPhone 6 Plus (11.1) [621F86B5-5E7E-4CF2-B01E-B53FC437761B] (Simulator)
iPhone 6 Plus (11.2) [44631C10-7D02-4F91-AE0B-C774348E38FA] (Simulator)
iPhone 6 Plus (11.3) [7A5C470A-8FDE-4B37-A736-53369BC3A24A] (Simulator)
iPhone 6s (10.0) [DADA9179-419E-42C9-A2AC-D550151DB841] (Simulator)
iPhone 6s (10.1) [169F407D-E264-4DC8-90AB-DE13F5430C0C] (Simulator)
iPhone 6s (10.2) [28E16082-8781-49AA-A427-74FE2B24EF48] (Simulator)
iPhone 6s (10.3.1) [8447E689-8FD9-449B-8309-A3ADC3FE9AEB] (Simulator)
iPhone 6s (11.0.1) [A681A4DF-60F7-4708-BC3D-FE483D2627D3] (Simulator)
iPhone 6s (11.1) [C4FF3F09-93D9-4013-A732-AE5DF8D94723] (Simulator)
iPhone 6s (11.2) [97E034E5-6D60-44DA-8F67-B82846326E0A] (Simulator)
iPhone 6s (11.3) [AA091EDD-75AF-4D0C-86C6-08869C6C129A] (Simulator)
iPhone 6s Plus (10.0) [47837AC9-E652-4DCF-973E-73E310CEC887] (Simulator)
iPhone 6s Plus (10.1) [00B621B8-0724-4C5E-ABB9-F5739BAB0C9E] (Simulator)
iPhone 6s Plus (10.2) [C76B45C4-900E-4014-8B26-506DA6B370D3] (Simulator)
iPhone 6s Plus (10.3.1) [F8AD47D9-0106-4B34-B0A7-DBDF8BB0354F] (Simulator)
iPhone 6s Plus (11.0.1) [16AB6BEB-5C0D-4798-BD93-DD998ED1801A] (Simulator)
iPhone 6s Plus (11.1) [F71E187A-DC6F-4A29-BD79-A620889DB74B] (Simulator)
iPhone 6s Plus (11.2) [9B96896A-12D3-4A4B-84EA-A6E53A0377CE] (Simulator)
iPhone 6s Plus (11.3) [97A968E1-7216-4898-8C78-D18E97A44FDC] (Simulator)
iPhone 7 (10.0) [0A29FC97-CE82-4BDE-8126-0F169B365638] (Simulator)
iPhone 7 (10.1) [9F1C42D6-5F6B-49BA-9542-97AE4C228759] (Simulator)
iPhone 7 (10.2) [96546329-0F20-4506-993C-15179800EFEA] (Simulator)
iPhone 7 (10.3.1) [C485F592-EFE1-4B3B-BD4E-21597CCA2762] (Simulator)
iPhone 7 (11.0.1) [424EEA11-BD30-4243-A43F-B5DFD4A4CE73] (Simulator)
iPhone 7 (11.1) [4850E850-AE89-43EA-86C5-3A80E6EEEA33] (Simulator)
iPhone 7 (11.2) [AB432E57-3FA1-421E-8E45-FB1A3C1D3CD3] (Simulator)
iPhone 7 (11.3) [3230AD02-ADEE-4DA8-AAF8-D6FAE97C9AA6] (Simulator)
iPhone 7 (11.3) + Apple Watch Series 2 - 38mm (4.3) [2088B1DE-8E0D-40A8-865A-58167E347165] (Simulator)
iPhone 7 Plus (10.0) [EE23C9CD-1A93-4458-8551-48FD854278E4] (Simulator)
iPhone 7 Plus (10.1) [2A0E5096-4917-465D-BE01-65C336632AFC] (Simulator)
iPhone 7 Plus (10.2) [1FE2B0AA-891E-4458-95AD-AFC215321D4B] (Simulator)
iPhone 7 Plus (10.3.1) [6C3F0E7A-5716-49F0-B0DD-87728D5030BC] (Simulator)
iPhone 7 Plus (11.0.1) [174984F4-C56D-47A9-8B28-8CFA416D0882] (Simulator)
iPhone 7 Plus (11.1) [203A4893-759E-4DD2-A998-2812F2D7994F] (Simulator)
iPhone 7 Plus (11.2) [35812009-9013-4309-85B6-2B7F4221A9D5] (Simulator)
iPhone 7 Plus (11.3) [0FB3D313-DA71-4657-AC52-6FBFC6ED0509] (Simulator)
iPhone 7 Plus (11.3) + Apple Watch Series 2 - 42mm (4.3) [668DC4AA-78AF-4C04-B801-4D0DB2199EF8] (Simulator)
iPhone 8 (11.0.1) [81341490-F00C-453B-9F73-7F873DB91E72] (Simulator)
iPhone 8 (11.1) [2E1D30A6-26E4-411B-A884-AF6CDC4185CF] (Simulator)
iPhone 8 (11.2) [A574A17B-0BB0-4647-81C1-C209694DFCC6] (Simulator)
iPhone 8 (11.3) [62B1071F-0582-41EC-A81A-8D05C66A8DB1] (Simulator)
iPhone 8 (11.3) + Apple Watch Series 3 - 38mm (4.3) [FE088CBD-019D-4408-B15A-35AE04F2FE31] (Simulator)
iPhone 8 Plus (11.0.1) [5F826370-567F-4D40-8B96-EDB19314118D] (Simulator)
iPhone 8 Plus (11.1) [41D4E816-FC4F-4A90-A166-1C53F5ACCD7E] (Simulator)
iPhone 8 Plus (11.2) [85F92F31-293F-411E-A39F-D505115973FD] (Simulator)
iPhone 8 Plus (11.3) [D0D472C6-792D-42C1-B1D5-8DCC19DB53AD] (Simulator)
iPhone 8 Plus (11.3) + Apple Watch Series 3 - 42mm (4.3) [3D99D315-6D0D-4838-9D44-36014EBD3AAB] (Simulator)
iPhone SE (10.0) [ECF5CDDC-8BCE-43BD-A407-193E7BF81721] (Simulator)
iPhone SE (10.1) [65DF0AE9-90D9-4C8F-B345-E6553454614B] (Simulator)
iPhone SE (10.2) [1423B242-5476-4F4D-88D4-7AC6BE89A67F] (Simulator)
iPhone SE (10.3.1) [D1B3FB85-9D41-4F36-B868-C7595BB9242B] (Simulator)
iPhone SE (11.0.1) [79240470-D88C-40E2-B573-5A2D0775ED31] (Simulator)
iPhone SE (11.1) [F7CF1D9A-C747-4FF4-9509-450B50AAD895] (Simulator)
iPhone SE (11.2) [BD05CEC0-E731-4A8B-A0B7-F23A2EB5EE06] (Simulator)
iPhone SE (11.3) [4575A085-8CEE-42E5-B537-C8F4EC6F51D0] (Simulator)
iPhone X (11.0.1) [F8E8EA95-EF84-4DFB-A593-36F0EBE86D94] (Simulator)
iPhone X (11.1) [7B32EDBF-ADCE-43C3-A957-0DD40272EC71] (Simulator)
iPhone X (11.2) [D5629ACC-4B9D-4C81-8649-93272882B80B] (Simulator)
iPhone X (11.3) [8346F33B-DFBE-4E62-819B-012A0CD2246A] (Simulator)`;



      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          instrumentsFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "instruments"))(soda);
          soda.framework = instrumentsFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "instruments", "imports", "Config.js"))(soda);
          buildTree = require(path.join(__dirname, "..", "SodaCore", "frameworks", "instruments", "imports", "Tree.js"));
          emulatorControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "instruments", "imports", "Driver.js")))(soda);
          elementInteractions = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "instruments", "imports", "ElementInteractions.js")))(soda, emulatorControl);

          done();
      });
    });

    afterAll(function (done) {
      this.timeout(1000 * 5);

        soda.framework.stop(function(err, res) {
            soda.kill();

            done();
        });
    });

    it('Should validate instruments', function (done) {
      expect(instrumentsFramework.name).toEqual('Instruments');
      expect(instrumentsFramework.platform).toEqual('iOS');
      expect(instrumentsFramework.version).toEqual('1.0');
      expect(instrumentsFramework.defaultSyntaxVersion).toEqual('2.0');
      expect(instrumentsFramework.defaultSyntaxName).toEqual('mobile');

      done();
    });

    it('Should build for instruments', function (done) {
      this.timeout(1000 * 20);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('rm -rf') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();


      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.build("iPhone X 11.3", "9.11", path.join(__dirname, '..', 'target'), path.join(__dirname, '..', 'build_path'), "Ally Mobile", "com.test.AppName", "iPhone X 11.3", function(result) {
        expect(result).toEqual(true);

        sandbox.restore();

        done();
      });

      setTimeout(function() {
        spawnEvent.stdout.emit('data', '');
        spawnEvent.stderr.emit('data', '');
        // Exit your program, 0 = success, !0 = failure
        spawnEvent.emit('close', 0);
      }, 4000);

    });

    it('Should upload for instruments', function (done) {
      this.timeout(1000 * 20);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('rm -rf') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();


      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.upload("iPhone X 11.3", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        sandbox.restore();

        done();
      });

      setTimeout(function() {
        spawnEvent.stdout.emit('data', '');
        spawnEvent.stderr.emit('data', '');
        // Exit your program, 0 = success, !0 = failure
        spawnEvent.emit('close', 0);
      }, 4000);

    });

    it('Should reset for instruments', function (done) {
      this.timeout(1000 * 20);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.reset(function(result) {
          expect(result).toEqual(true);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should start for instruments', function (done) {
      this.timeout(1000 * 20);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        sandbox.restore();

        done();
      });
    });

    it('Should stop for instruments', function (done) {
      this.timeout(1000 * 30);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH" }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.stop(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should restartApplication for instruments', function (done) {
      this.timeout(1000 * 20);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.restartApplication(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should restart for instruments', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.restart(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should listAvailableDevices for instruments', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.listAvailableDevices(function(result) {
        expect(JSON.stringify(result)).toEqual(JSON.stringify(["USCHAMNECJPG8WL","Apple TV 11.3","Apple TV 4K 11.3","Apple TV 4K at 1080p) (11.3"," 38mm 4.3"," 42mm 4.3","iPad 5th generation) (10.3.1","iPad 5th generation) (11.0.1","iPad 5th generation) (11.1","iPad 5th generation) (11.2","iPad 5th generation) (11.3","iPad Air 10.0","iPad Air 10.1","iPad Air 10.2","iPad Air 10.3.1","iPad Air 11.0.1","iPad Air 11.1","iPad Air 11.2","iPad Air 11.3","iPad Air 2 10.0","iPad Air 2 10.1","iPad Air 2 10.2","iPad Air 2 10.3.1","iPad Air 2 11.0.1","iPad Air 2 11.1","iPad Air 2 11.2","iPad Air 2 11.3","iPad Pro 10.5-inch) (10.3.1","iPad Pro 10.5-inch) (11.0.1","iPad Pro 10.5-inch) (11.1","iPad Pro 10.5-inch) (11.2","iPad Pro 10.5-inch) (11.3","iPad Pro 12.9 inch) (10.0","iPad Pro 12.9 inch) (10.1","iPad Pro 12.9 inch) (10.2","iPad Pro 12.9 inch) (10.3.1","iPad Pro 12.9-inch) (11.0.1","iPad Pro 12.9-inch) (11.1","iPad Pro 12.9-inch) (11.2","iPad Pro 12.9-inch) (11.3","iPad Pro 12.9-inch) (2nd generation) (10.3.1","iPad Pro 12.9-inch) (2nd generation) (11.0.1","iPad Pro 12.9-inch) (2nd generation) (11.1","iPad Pro 12.9-inch) (2nd generation) (11.2","iPad Pro 12.9-inch) (2nd generation) (11.3","iPad Pro 9.7 inch) (10.0","iPad Pro 9.7 inch) (10.1","iPad Pro 9.7 inch) (10.2","iPad Pro 9.7 inch) (10.3.1","iPad Pro 9.7-inch) (11.0.1","iPad Pro 9.7-inch) (11.1","iPad Pro 9.7-inch) (11.2","iPad Pro 9.7-inch) (11.3","iPhone 5 10.0","iPhone 5 10.1","iPhone 5 10.2","iPhone 5 10.3.1","iPhone 5s 10.0","iPhone 5s 10.1","iPhone 5s 10.2","iPhone 5s 10.3.1","iPhone 5s 11.0.1","iPhone 5s 11.1","iPhone 5s 11.2","iPhone 5s 11.3","iPhone 6 10.0","iPhone 6 10.1","iPhone 6 10.2","iPhone 6 10.3.1","iPhone 6 11.0.1","iPhone 6 11.1","iPhone 6 11.2","iPhone 6 11.3","iPhone 6 Plus 10.0","iPhone 6 Plus 10.1","iPhone 6 Plus 10.2","iPhone 6 Plus 10.3.1","iPhone 6 Plus 11.0.1","iPhone 6 Plus 11.1","iPhone 6 Plus 11.2","iPhone 6 Plus 11.3","iPhone 6s 10.0","iPhone 6s 10.1","iPhone 6s 10.2","iPhone 6s 10.3.1","iPhone 6s 11.0.1","iPhone 6s 11.1","iPhone 6s 11.2","iPhone 6s 11.3","iPhone 6s Plus 10.0","iPhone 6s Plus 10.1","iPhone 6s Plus 10.2","iPhone 6s Plus 10.3.1","iPhone 6s Plus 11.0.1","iPhone 6s Plus 11.1","iPhone 6s Plus 11.2","iPhone 6s Plus 11.3","iPhone 7 10.0","iPhone 7 10.1","iPhone 7 10.2","iPhone 7 10.3.1","iPhone 7 11.0.1","iPhone 7 11.1","iPhone 7 11.2","iPhone 7 11.3","iPhone 7 11.3) + Apple Watch Series 2 - 38mm (4.3","iPhone 7 Plus 10.0","iPhone 7 Plus 10.1","iPhone 7 Plus 10.2","iPhone 7 Plus 10.3.1","iPhone 7 Plus 11.0.1","iPhone 7 Plus 11.1","iPhone 7 Plus 11.2","iPhone 7 Plus 11.3","iPhone 7 Plus 11.3) + Apple Watch Series 2 - 42mm (4.3","iPhone 8 11.0.1","iPhone 8 11.1","iPhone 8 11.2","iPhone 8 11.3","iPhone 8 11.3) + Apple Watch Series 3 - 38mm (4.3","iPhone 8 Plus 11.0.1","iPhone 8 Plus 11.1","iPhone 8 Plus 11.2","iPhone 8 Plus 11.3","iPhone 8 Plus 11.3) + Apple Watch Series 3 - 42mm (4.3","iPhone SE 10.0","iPhone SE 10.1","iPhone SE 10.2","iPhone SE 10.3.1","iPhone SE 11.0.1","iPhone SE 11.1","iPhone SE 11.2","iPhone SE 11.3","iPhone X 11.0.1","iPhone X 11.1","iPhone X 11.2","iPhone X 11.3"]));

        sandbox.restore();

        done();
      });
    });

    it('Should findDevice for instruments', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.findDevice("iPhone X 11.3", function(err, result) {
        expect(err).toEqual(null);
        expect(JSON.stringify(result)).toEqual(JSON.stringify({"name":"iPhone X","udid":"8346F33B-DFBE-4E62-819B-012A0CD2246A","runtime":"11.3","isSimulator":true}));

        sandbox.restore();

        done();
      });
    });

    it('Should perform element interaction', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":[{"name":"textfield:1"}]}');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":[{"name":"textfield:1"}]}');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":[{"name":"textfield:1"}]}');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        var Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        var tree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

        tree.findElementById('textfield:1', function(err, result) {
         expect(err).toEqual(null);
         expect(result.sodamembers).toEqual(1);

         instrumentsFramework.performElementInteraction("tap", result, {}, function(err, result) {
           expect(err).toEqual(null);
           expect(result).toEqual(true);

           sandbox.restore();

           done();
         });
        });
      });
    });

    it('Should perform device interaction', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.performDeviceInteraction("openApp", {}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should getTree', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\" name=\\"test_app\\" label=\\"test_app\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t<XCUIElementTypeWindow type=\\"XCUIElementTypeWindow\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t\\t<XCUIElementTypeOther type=\\"XCUIElementTypeOther\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\"/>\\n\\t</XCUIElementTypeWindow>\\n</XCUIElementTypeApplication>"}');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.getTree({}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toBeInstanceOf(Object);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should getOrientation', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":"PORTRAIT"}');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.getOrientation(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(1);

          sandbox.restore();

          done();
        });
      });
    });

    it('Should getScreenBounds', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\" name=\\"test_app\\" label=\\"test_app\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t<XCUIElementTypeWindow type=\\"XCUIElementTypeWindow\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t\\t<XCUIElementTypeOther type=\\"XCUIElementTypeOther\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\"/>\\n\\t</XCUIElementTypeWindow>\\n</XCUIElementTypeApplication>"}');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.getScreenBounds(function(err, result) {
          expect(err).toEqual(null);
          expect(JSON.stringify(result)).toEqual(JSON.stringify([ '375', '667' ]));

          sandbox.restore();

          done();
        });
      });
    });

    it('Should validate isDeviceASimulator', function (done) {
      this.timeout(1000 * 40);

      var sandbox = sinon.createSandbox();

      sandbox.stub(require('request'), 'get').yields(null, {statusCode: 200}, '{"sessionId":"BLAHBLAHBLAH","status":0,"value":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\" name=\\"test_app\\" label=\\"test_app\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t<XCUIElementTypeWindow type=\\"XCUIElementTypeWindow\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\">\\n\\t\\t<XCUIElementTypeOther type=\\"XCUIElementTypeOther\\" enabled=\\"true\\" visible=\\"true\\" x=\\"0\\" y=\\"0\\" width=\\"375\\" height=\\"667\\"/>\\n\\t</XCUIElementTypeWindow>\\n</XCUIElementTypeApplication>"}');
      sandbox.stub(require('request'), 'post').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');
      sandbox.stub(require('request'), 'del').yields(null, {statusCode: 200}, '{ "sessionId":"BLAHBLAHBLAH", "status": 0 }');

      sandbox.stub(require('child_process'), 'exec').callsFake((command, func) => {
        var result = '';

        if (command.indexOf('pkill xcodebuild') >= 0) {
          result = '';
        }
        else if (command.indexOf('pkill mobiledevice') >= 0) {
          result = '';
        }
        else if (command.indexOf('instruments -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();
      spawnEvent.stdout.emit('data', '');
      spawnEvent.stderr.emit('data', '');
      // Exit your program, 0 = success, !0 = failure
      spawnEvent.emit('close', 0);

      sandbox.stub(child_process, 'spawn').returns(spawnEvent);

      instrumentsFramework.start("iPhone X 11.3", "Ally Mobile", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        instrumentsFramework.isDeviceASimulator();
        sandbox.restore();

        done();
      });
    });
});
*/