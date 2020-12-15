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

var sinon = require('sinon'),
    path   = require("path"),
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    events = require("events"),
    child_process     = require("child_process"),
    nock = require('nock');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework perfecto should pass all validation tests', function () {
  var soda, perfectoFramework, settings, buildTree, emulatorControl, elementInteractions, deviceList, server, 
      tempExists, tempReadFileSync, tempExec, tempSpawn, spawnEvent, spy1, spy2, spy3, spy4;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      tempExists = fs.exists;
      tempReadFileSync = fs.readFileSync;
      tempExec = child_process.exec;
      tempSpawn = child_process.spawn;

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

      var result = '<?xml version="1.0" encoding="UTF-8"?><handsets modelVersion="2.21.0.0" productVersion="19.3" time="2019-03-08:19-16-16 GMT" timeStamp="1552072576488" items="27"><handset><deviceId>LGH860DD9575D1</deviceId><manufacturer>LG</manufacturer><model>G5</model><distributer>Generic</distributer><description>Generic</description><firmware>h1_global_com-user 6.0.1 MMB29M 1606916214d37 release-keys</firmware><imsi></imsi><nativeImei>358394072081933</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>ac:0d:1b:ff:80:a2</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-3-2/VIRTUAL/04</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>6.0.1</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>6F07DE4E5C907A0D3EABDE1C735E7186ADB2FE45</deviceId><manufacturer>Apple</manufacturer><model>iPhone-8 Plus</model><distributer>MacCam11</distributer><description>DCT</description><firmware>11.0.3</firmware><imsi></imsi><nativeImei>356774081731937</nativeImei><osBuild>15A432</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>40:cb:c0:3d:72:dc</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber>+19788938453</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C2-F6-6/VIRTUAL/01</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C2-F6-6/VIRTUAL/01</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.0.3</osVersion><resolution>1242x2208</resolution></handset><handset><deviceId>1436D658FE6B479A4A98A2D144D6C71533CCADC2</deviceId><manufacturer>Apple</manufacturer><model>iPhone-6S Plus</model><distributer>MacCam10</distributer><description>Mobile_CI</description><firmware>10.3.1</firmware><imsi></imsi><nativeImei>NOT-AVAILABLE</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>dc:2b:2a:8f:f6:56</wifiMacAddress><link><type>unknown</type></link><operator>Sprint-United States of America<name>Sprint</name><country>United States of America</country><code>310120</code></operator><phoneNumber>+1(781) 608-6367</phoneNumber><location>NA-US-BOS</location><lastCradleId></lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>iOS</os><osVersion>10.3.1</osVersion><resolution>1242x2208</resolution></handset><handset><deviceId>F3C05B44</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S5</model><distributer>Unlocked</distributer><description>DCT</description><firmware>klteuc-user 4.4.4 KTU84P G900AUCU2AOA1 release-keys</firmware><imsi></imsi><nativeImei>353502060469846</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>10:a5:d0:e5:1d:c4</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-1-5/VIRTUAL/02</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>4.4.4</osVersion><resolution>1080x1920</resolution></handset><handset><deviceId>BF6EEAC3C3500D796666C915A522B99D3A61ED4F</deviceId><manufacturer>Apple</manufacturer><model>iPhone-6S</model><distributer>MacCam11</distributer><description>DCT</description><firmware>11.0.3</firmware><imsi></imsi><nativeImei>353256070193991</nativeImei><osBuild>15A432</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>d0:03:4b:83:8f:4d</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber>+1-339-999-1763</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R2-4/VIRTUAL/05</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>false</available><reserved>false</reserved><inUse>true</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R2-4/VIRTUAL/05</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.0.3</osVersion><resolution>750x1334</resolution></handset><handset><deviceId>1530F9B45D086534C5BA12F696557EDCDCD3C60E</deviceId><manufacturer>Apple</manufacturer><model>iPhone-5S</model><distributer>MacCam10</distributer><description>DCT</description><firmware></firmware><imsi></imsi><nativeImei>356962064456602</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>c0:ce:cd:16:2c:31</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-4-4/008300/01</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>iOS</os><osVersion>10.3.1</osVersion><resolution>640x1136</resolution></handset><handset><deviceId>0715F774EAA61538</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy Note5</model><distributer>Generic</distributer><description>DCT</description><firmware>nobleltevzw-user 5.1.1 LMY47X N920VVRU1AOGI release-keys</firmware><imsi></imsi><nativeImei>990005882980353</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>fc:db:b3:bb:6c:22</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-4-6/VIRTUAL/01</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>5.1.1</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>EA683CFFFEE961E53F5FCA40B441583D9CE60B6D</deviceId><manufacturer>Apple</manufacturer><model>iPhone-8</model><distributer>MacCam11</distributer><description>DCT</description><firmware>11.1.2</firmware><imsi></imsi><nativeImei>356759080682769</nativeImei><osBuild>15B202</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>40:cb:c0:11:e0:55</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber>+19788938197</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R1-4/VIRTUAL/04</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>false</available><reserved>false</reserved><inUse>true</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R1-4/VIRTUAL/04</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.1.2</osVersion><resolution>750x1334</resolution></handset><handset><deviceId>7CE7D16254742D722E978EDB51EF02A491C10CE3</deviceId><manufacturer>Apple</manufacturer><model>iPhone-7</model><distributer>MacCam10</distributer><description></description><firmware>10.3.1</firmware><imsi></imsi><nativeImei>359163072006953</nativeImei><osBuild>14E304</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>cc:08:8d:88:64:4a</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R3-3/VIRTUAL/03</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R3-3/VIRTUAL/03</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>10.3.1</osVersion><resolution>750x1334</resolution></handset><handset><deviceId>02157DF278AB5639</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S6</model><distributer>Generic</distributer><description>AAOS_Business</description><firmware>zeroflteuc-user 6.0.1 MMB29K G920AUCS4CPG1 release-keys</firmware><imsi></imsi><nativeImei>357743061547539</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>e8:50:8b:70:63:ed</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-B7-F5-4/VIRTUAL/05</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>6.0.1</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>3208DA1FAFFA5167</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S5</model><distributer>Unlocked</distributer><description>DCT</description><firmware>k3gxx-user 5.0 LRX21T G900HXXU1BOD4 release-keys</firmware><imsi></imsi><nativeImei>356766060341910</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>48:5a:3f:91:52:5c</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CD28-3-6/VIRTUAL/02</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>5.0</osVersion><resolution>1080x1920</resolution></handset><handset><deviceId>9888DA463345333143</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S8+</model><distributer>Generic</distributer><description>Digital Transformation Auto</description><firmware>dream2qltesq-user 7.0 NRD90M G955USQU1AQGA release-keys</firmware><imsi></imsi><nativeImei>355980080440146</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>b0:72:bf:f9:9a:36</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C2-F6-5/VIRTUAL/02</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C2-F6-5/VIRTUAL/02</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>7.0</osVersion><resolution>1440x2960</resolution></handset><handset><deviceId>F8D47C13AB1E8E8F70F23DCE891CBEA1B877D9F6</deviceId><manufacturer>Apple</manufacturer><model>iPhone-6</model><distributer>MacCam11</distributer><description>DCT /NDA PT</description><firmware>11.0.3</firmware><imsi></imsi><nativeImei>359302067912375</nativeImei><osBuild>15A432</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>58:7f:57:68:5d:66</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber>+1-781-640-6219</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-B7-F5-4/VIRTUAL/04</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-B7-F5-4/VIRTUAL/04</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.0.3</osVersion><resolution>750x1334</resolution></handset><handset><deviceId>E0A3B01669BB65F0B95D87007558FB32F9EDE921</deviceId><manufacturer>Apple</manufacturer><model>iPhone-7 Plus</model><distributer>MacCam11</distributer><description>DCT / NDA PT</description><firmware>11.0.3</firmware><imsi></imsi><nativeImei>359153078498700</nativeImei><osBuild>15A432</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>b8:53:ac:36:ec:5a</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber>+781-640-9775</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R1-4/VIRTUAL/03</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R1-4/VIRTUAL/03</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.0.3</osVersion><resolution>1242x2208</resolution></handset><handset><deviceId>9888E2434746314642</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S8</model><distributer>Generic</distributer><description>DCT</description><firmware>dreamqltesq-user 7.0 NRD90M G950USQU1AQEF release-keys</firmware><imsi></imsi><nativeImei>355987080273815</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>b0:72:bf:cc:2d:32</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C2-F6-5/VIRTUAL/04</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C2-F6-5/VIRTUAL/04</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>7.0</osVersion><resolution>1440x2960</resolution></handset><handset><deviceId>B69B2939C828E1507E0387AB14024E683BD2D01C</deviceId><manufacturer>Apple</manufacturer><model>iPhone-6 Plus</model><distributer>MacCam10</distributer><description>Mobile_CI</description><firmware>10.0.2</firmware><imsi></imsi><nativeImei>354386067857347</nativeImei><osBuild>14A456</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>90:3c:92:d8:8c:6a</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-B7-F5-4/VIRTUAL/01</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-B7-F5-4/VIRTUAL/01</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>10.0.2</osVersion><resolution>1242x2208</resolution></handset><handset><deviceId>A8488C68</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S7</model><distributer>Generic</distributer><description>DCT</description><firmware>heroqlteuc-user 7.0 NRD90M G930AUCS4BQH1 release-keys</firmware><imsi></imsi><nativeImei>357425072754508</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>ac:5f:3e:a2:71:8c</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber>+17816065293</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R1-4/VIRTUAL/01</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R1-4/VIRTUAL/01</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>7.0</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>C07784C2D3933094EE7264094AACA189CCA2BD51</deviceId><manufacturer>Apple</manufacturer><model>iPhone-6S</model><distributer>MacCam9</distributer><description>DCT</description><firmware>9.3.5</firmware><imsi></imsi><nativeImei>353269070567734</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>dc:2b:2a:0f:ae:7a</wifiMacAddress><link><type>unknown</type></link><operator>Verizon-United States of America<name>Verizon</name><country>United States of America</country><code>310004</code></operator><phoneNumber>+13392235419</phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-2-1/VIRTUAL/02</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>iOS</os><osVersion>9.3.5</osVersion><resolution>750x1334</resolution></handset><handset><deviceId>9885F6395552563155</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S7 Edge</model><distributer>Generic</distributer><description>DCT</description><firmware>hero2ltexx-user 7.0 NRD90M G935FXXS1DQHM release-keys</firmware><imsi></imsi><nativeImei>NOT-AVAILABLE</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>ac:5f:3e:f8:b7:89</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-A1-3-2/VIRTUAL/01</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>7.0</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>WF-CG09-2-1-VIRTUAL.01</deviceId><manufacturer>Nokia</manufacturer><model>Lumia 830</model><distributer>Unlocked</distributer><description>DCT</description><firmware></firmware><imsi></imsi><nativeImei>NOT-AVAILABLE</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress></wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-2-1/VIRTUAL/01</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Windows Phone</os><osVersion></osVersion><resolution>720x1280</resolution></handset><handset><deviceId>06157DF6A4488839</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S6</model><distributer>Generic</distributer><description>AAOS_Business, NDA PT</description><firmware>zerofltevzw-user 5.1.1 LMY47X G920VVRU4BOG7 release-keys</firmware><imsi></imsi><nativeImei>990005877849597</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>fc:db:b3:42:e9:6c</wifiMacAddress><link><type>lab</type></link><operator>Verizon-United States of America<name>Verizon</name><country>United States of America</country><code>310004</code></operator><phoneNumber>+13392343486</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C2-F6-4/VIRTUAL/02</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C2-F6-4/VIRTUAL/02</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>5.1.1</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>5A3441BD</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S5 SM-G900A</model><distributer>ATT-US</distributer><description>DCT</description><firmware>klteuc-user 5.0 LRX21T G900AUCU4BOF3 release-keys</firmware><imsi></imsi><nativeImei>353411061920130</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>10:a5:d0:de:a5:f9</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-4-3/VIRTUAL/02</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>5.0</osVersion><resolution>1080x1920</resolution></handset><handset><deviceId>0815F87362CF3C05</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S6 Edge+</model><distributer>Generic</distributer><description>DCT</description><firmware>zenltevzw-user 5.1.1 LMY47X G928VVRU2AOJ2 release-keys</firmware><imsi></imsi><nativeImei>990005886953901</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>00:ae:fa:50:fa:df</wifiMacAddress><link><type>unknown</type></link><operator>Verizon-United States of America<name>Verizon</name><country>United States of America</country><code>310004</code></operator><phoneNumber>+17814600347</phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CG09-2-6/VIRTUAL/04</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>Android</os><osVersion>5.1.1</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B</deviceId><manufacturer>Apple</manufacturer><model>iPhone-X</model><distributer>MacCam11</distributer><description>AAOS_Business, NDA PT</description><firmware>11.0.1</firmware><imsi></imsi><nativeImei>359410080486150</nativeImei><osBuild>15A8391</osBuild><cpuArch>arm64</cpuArch><wifiMacAddress>b0:19:c6:99:81:b4</wifiMacAddress><link><type>lab</type></link><operator>AT&amp;T-United States of America<name>AT&amp;T</name><country>United States of America</country><code>310016</code></operator><phoneNumber>+13399997580</phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R2-4/VIRTUAL/04</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R2-4/VIRTUAL/04</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>iOS</os><osVersion>11.0.1</osVersion><resolution>1125x2436</resolution></handset><handset><deviceId>9885B645595850585A</deviceId><manufacturer>Samsung</manufacturer><model>Galaxy S7</model><distributer>Generic</distributer><description>DCT</description><firmware>heroltexx-user 7.0 NRD90M G930FXXU1DPLT release-keys</firmware><imsi></imsi><nativeImei>358810079443081</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>ac:5f:3e:c6:19:af</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C2-F6-5/VIRTUAL/01</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>false</available><reserved>false</reserved><inUse>true</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C2-F6-5/VIRTUAL/01</cradleId><position><id>portrait</id><method>rotate</method><rotation>0</rotation></position><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>7.0</osVersion><resolution>1440x2560</resolution></handset><handset><deviceId>00EDD41A616697D2</deviceId><manufacturer>Google</manufacturer><model>Nexus 5X</model><distributer>Generic</distributer><description>Mobile_CI</description><firmware>bullhead-user 8.0.0 OPR4.170623.009 4302492 release-keys</firmware><imsi></imsi><nativeImei>353626076021760</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>64:bc:0c:51:4e:bb</wifiMacAddress><link><type>lab</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>BOS-C4-R1-4/VIRTUAL/05</lastCradleId><language>English</language><status>Connected</status><mode>CONNECTED</mode><available>true</available><reserved>false</reserved><inUse>false</inUse><operabilityRating><score>100</score></operabilityRating><cradleId>BOS-C4-R1-4/VIRTUAL/05</cradleId><debugLogs><collecting>false</collecting></debugLogs><os>Android</os><osVersion>8.1.0</osVersion><resolution>1080x1920</resolution></handset><handset><deviceId>B00DBE27D306DE371814A34B4C1553EC7E719499</deviceId><manufacturer>Apple</manufacturer><model>iPad Air</model><distributer>IOS7</distributer><description>DCT</description><firmware>7.1.1</firmware><imsi></imsi><nativeImei>NOT-AVAILABLE</nativeImei><osBuild></osBuild><cpuArch></cpuArch><wifiMacAddress>78:fd:94:3a:fd:42</wifiMacAddress><link><type>unknown</type></link><operator><name></name><country></country><code></code></operator><phoneNumber></phoneNumber><location>NA-US-BOS</location><lastCradleId>WF-CD28-3-6/008066/01</lastCradleId><language>English</language><status>Not Connected</status><mode>NOT_CONNECTED</mode><available>false</available><reserved>false</reserved><os>iOS</os><osVersion>7.1.1</osVersion><resolution>2048x1536</resolution><dynamicFields><property name="Device Roles">TCoE-SIT</property></dynamicFields></handset></handsets>';
      var info = '<?xml version="1.0" encoding=\"UTF-8\"?><XCUIElementTypeApplication type=\"XCUIElementTypeApplication\" name=\"test_app\" label=\"test_app\" enabled=\"true\" visible=\"true\" x=\"0\" y=\"0\" width=\"375\" height=\"667\"><XCUIElementTypeWindow type=\"XCUIElementTypeWindow\" enabled=\"true\" visible=\"true\" x=\"0\" y=\"0\" width=\"375\" height=\"667\"><XCUIElementTypeOther type=\"XCUIElementTypeOther\" enabled=\"true\" visible=\"true\" x=\"0\" y=\"0\" width=\"375\" height=\"667\"/></XCUIElementTypeWindow></XCUIElementTypeApplication>'
      
      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/.*handsets.*/)
      .reply(200, JSON.stringify({ returnValue: result }));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .post('/')
      .reply(200, JSON.stringify({ "sessionId":"BLAHBLAHBLAH" }));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/.*operation=start.*/)
      .reply(200, JSON.stringify({ returnValue: { executionId: "BLAHBLAHBLAH", reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/services\/repositories\/media/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success", items: ["joe"] }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .put(/services\/repositories\/media/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=device&subcommand=open/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=open/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=device&subcommand=close/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=close/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/.*operation=end.*/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=install/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=handset&subcommand=ready/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=clean/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=touch/)
      .reply(200, JSON.stringify({ returnValue: { reason: "Success" }}));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=info.*param.property=resolution/)
      .reply(200, JSON.stringify({ returnValue: "800*600" }));


      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=command&command=application&subcommand=info.*param.property=source/)
      .reply(200, JSON.stringify({ returnValue: info }));

      nock('https://'+process.env.PERFECTO_HOST, {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get(/operation=upload/)
      .reply(200, JSON.stringify({ returnValue: info }));

      if (!nock.isActive()) {
        nock.activate()
      }
      
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          perfectoFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto"))(soda);
          soda.framework = perfectoFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "Config.js"))(soda);
          buildTree = require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "Tree.js"));
          emulatorControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "Driver.js")))(soda);
          elementInteractions = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "ElementInteractions.js")))(soda, settings, emulatorControl);

          done();
      });
    });

    beforeEach(() => {
      spy1 = sinon.stub(fs, 'exists').yieldsAsync(true);

      spy2 = sinon.stub(fs, 'readFileSync').returns('filetosend');

      spy3 = sinon.stub(require('child_process'), 'exec').callsFake((command, func) => {
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
        else if (command.indexOf('perfecto -s devices') >= 0) {
          result = deviceList;
        }

        func(null, result);
      });

      spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();

      spy4 = sinon.stub(child_process, 'spawn').returns(spawnEvent);
    })

    afterAll(function (done) {
      fs.exists = tempExists;
      child_process.exec = tempExec;
      child_process.spawn = tempSpawn;
      fs.readFileSync = tempReadFileSync;

      nock.cleanAll();
      nock.restore();

      soda.kill();

      soda = null;

      done();
    });
  
    afterEach(function() {
      spy1.restore();
      spy2.restore();
      spy3.restore();
      spy4.restore();
    });

    it('Should validate perfecto', function (done) {
      expect(perfectoFramework.name).toEqual('Perfecto');
      expect(perfectoFramework.platform).toEqual('Perfecto');
      expect(perfectoFramework.version).toEqual('2.0');
      expect(perfectoFramework.defaultSyntaxVersion).toEqual('2.0');
      expect(perfectoFramework.defaultSyntaxName).toEqual('perfecto');

      done();
    });

    it('Should build for perfecto', function (done) {
      perfectoFramework.build("6F07DE4E5C907A0D3EABDE1C735E7186ADB2FE45", path.join(__dirname, '..', 'target'), "iOS Project", path.join(__dirname, '..', 'build_path'), "My App", function(result) {
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should upload for perfecto', function (done) {
      perfectoFramework.upload("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "com.test.AppName", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..'), function(result) {
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should reset for perfecto', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.performDeviceInteraction("resetAppData", {}, function(err, result) {
          expect(result).toEqual(true);

          perfectoFramework.stop(function(result) {
            expect(result).toEqual(true);
  
            done();
          });
        });
      });
    });

    it('Should start for perfecto', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.stop(function(result) {
          expect(result).toEqual(true);

          done();
        });
      });
    });

    it('Should stop for perfecto', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.stop(function(result) {
          expect(result).toEqual(true);

          done();
        });
      });
    });

    it('Should restartApplication for perfecto', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.restartApplication("My App", function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          perfectoFramework.stop(function(result) {
            expect(result).toEqual(true);
  
            done();
          });
        });
      });
    });

    it('Should restart for perfecto', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.restartApplication("My App", function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          perfectoFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should listAvailableDevices for perfecto', function (done) {
      perfectoFramework.listAvailableDevices(function(result) {
        expect(JSON.stringify(result)).toEqual('[{"name":"DCT","udid":"6F07DE4E5C907A0D3EABDE1C735E7186ADB2FE45","runtime":"iPhone-8 Plus","manufacturer":"Apple","distributer":"MacCam11","firmware":"11.0.3","imsi":"","imei":"356774081731937","wifiMacAddress":"40:cb:c0:3d:72:dc","operatorName":"","operatorCode":"","phoneNumber":"+19788938453","status":"Connected","reserved":"false","os":"iOS","osVersion":"11.0.3","resolution":"1242x2208"},{"name":"","udid":"7CE7D16254742D722E978EDB51EF02A491C10CE3","runtime":"iPhone-7","manufacturer":"Apple","distributer":"MacCam10","firmware":"10.3.1","imsi":"","imei":"359163072006953","wifiMacAddress":"cc:08:8d:88:64:4a","operatorName":"","operatorCode":"","phoneNumber":"","status":"Connected","reserved":"false","os":"iOS","osVersion":"10.3.1","resolution":"750x1334"},{"name":"Digital Transformation Auto","udid":"9888DA463345333143","runtime":"Galaxy S8+","manufacturer":"Samsung","distributer":"Generic","firmware":"dream2qltesq-user 7.0 NRD90M G955USQU1AQGA release-keys","imsi":"","imei":"355980080440146","wifiMacAddress":"b0:72:bf:f9:9a:36","operatorName":"","operatorCode":"","phoneNumber":"","status":"Connected","reserved":"false","os":"Android","osVersion":"7.0","resolution":"1440x2960"},{"name":"DCT /NDA PT","udid":"F8D47C13AB1E8E8F70F23DCE891CBEA1B877D9F6","runtime":"iPhone-6","manufacturer":"Apple","distributer":"MacCam11","firmware":"11.0.3","imsi":"","imei":"359302067912375","wifiMacAddress":"58:7f:57:68:5d:66","operatorName":"AT&T","operatorCode":"310016","phoneNumber":"+1-781-640-6219","status":"Connected","reserved":"false","os":"iOS","osVersion":"11.0.3","resolution":"750x1334"},{"name":"DCT / NDA PT","udid":"E0A3B01669BB65F0B95D87007558FB32F9EDE921","runtime":"iPhone-7 Plus","manufacturer":"Apple","distributer":"MacCam11","firmware":"11.0.3","imsi":"","imei":"359153078498700","wifiMacAddress":"b8:53:ac:36:ec:5a","operatorName":"AT&T","operatorCode":"310016","phoneNumber":"+781-640-9775","status":"Connected","reserved":"false","os":"iOS","osVersion":"11.0.3","resolution":"1242x2208"},{"name":"DCT","udid":"9888E2434746314642","runtime":"Galaxy S8","manufacturer":"Samsung","distributer":"Generic","firmware":"dreamqltesq-user 7.0 NRD90M G950USQU1AQEF release-keys","imsi":"","imei":"355987080273815","wifiMacAddress":"b0:72:bf:cc:2d:32","operatorName":"","operatorCode":"","phoneNumber":"","status":"Connected","reserved":"false","os":"Android","osVersion":"7.0","resolution":"1440x2960"},{"name":"Mobile_CI","udid":"B69B2939C828E1507E0387AB14024E683BD2D01C","runtime":"iPhone-6 Plus","manufacturer":"Apple","distributer":"MacCam10","firmware":"10.0.2","imsi":"","imei":"354386067857347","wifiMacAddress":"90:3c:92:d8:8c:6a","operatorName":"AT&T","operatorCode":"310016","phoneNumber":"","status":"Connected","reserved":"false","os":"iOS","osVersion":"10.0.2","resolution":"1242x2208"},{"name":"DCT","udid":"A8488C68","runtime":"Galaxy S7","manufacturer":"Samsung","distributer":"Generic","firmware":"heroqlteuc-user 7.0 NRD90M G930AUCS4BQH1 release-keys","imsi":"","imei":"357425072754508","wifiMacAddress":"ac:5f:3e:a2:71:8c","operatorName":"AT&T","operatorCode":"310016","phoneNumber":"+17816065293","status":"Connected","reserved":"false","os":"Android","osVersion":"7.0","resolution":"1440x2560"},{"name":"AAOS_Business, NDA PT","udid":"06157DF6A4488839","runtime":"Galaxy S6","manufacturer":"Samsung","distributer":"Generic","firmware":"zerofltevzw-user 5.1.1 LMY47X G920VVRU4BOG7 release-keys","imsi":"","imei":"990005877849597","wifiMacAddress":"fc:db:b3:42:e9:6c","operatorName":"Verizon","operatorCode":"310004","phoneNumber":"+13392343486","status":"Connected","reserved":"false","os":"Android","osVersion":"5.1.1","resolution":"1440x2560"},{"name":"AAOS_Business, NDA PT","udid":"1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B","runtime":"iPhone-X","manufacturer":"Apple","distributer":"MacCam11","firmware":"11.0.1","imsi":"","imei":"359410080486150","wifiMacAddress":"b0:19:c6:99:81:b4","operatorName":"AT&T","operatorCode":"310016","phoneNumber":"+13399997580","status":"Connected","reserved":"false","os":"iOS","osVersion":"11.0.1","resolution":"1125x2436"},{"name":"Mobile_CI","udid":"00EDD41A616697D2","runtime":"Nexus 5X","manufacturer":"Google","distributer":"Generic","firmware":"bullhead-user 8.0.0 OPR4.170623.009 4302492 release-keys","imsi":"","imei":"353626076021760","wifiMacAddress":"64:bc:0c:51:4e:bb","operatorName":"","operatorCode":"","phoneNumber":"","status":"Connected","reserved":"false","os":"Android","osVersion":"8.1.0","resolution":"1080x1920"}]');

        done();
      });
    });


    it('Should perform device interaction', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.performDeviceInteraction("openApp", { path: "My App"}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          perfectoFramework.stop(function () {
            done();
          });
        });
      });
    });


    it('Should getTree', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.getTree({}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toBeInstanceOf(Object);

          perfectoFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should getOrientation', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.getOrientation(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(1);

          perfectoFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should getScreenBounds', function (done) {
      perfectoFramework.start("1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", "My App", path.join(__dirname, '..', 'sample_project'), path.join(__dirname, '..', 'test_results'), "1FA8490F24FC81DF580D654F0FA2EDC4DFD42D5B", path.join(__dirname, '..'), {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        perfectoFramework.getScreenBounds(function(err, result) {
          expect(err).toEqual(null);
          expect(JSON.stringify(result)).toEqual(JSON.stringify([ 375, 667 ]));

          perfectoFramework.stop(function () {
            done();
          });
        });
      });
    });
});
