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

 /**
 * Getters for the Instruments classes UIATarget, UIATarget.frontMostApp(), UIATarget.frontMostApp().mainWindow(), and
 * UIATarget.host()
 * @namespace Instruments/Simulator
 */
var Simulator = {
    /** @memberof Instruments/Simulator */ get target  () { return UIATarget.localTarget();    },
    /** @memberof Instruments/Simulator */ get app     () { return this.target.frontMostApp(); },
    /** @memberof Instruments/Simulator */ get window  () { return this.app.mainWindow();      },
    /** @memberof Instruments/Simulator */ get host    () { return this.target.host();         }
};
