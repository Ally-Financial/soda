# Soda
------
**Simple Object Driven Automation**   
*Testing is simple, do it!*   

------

Soda is a cross-platform **Automated Test Driven Development** platform for web, rest, mobile apps, and any app with an available DOM (Document Object Model). It uses the native tools (when available) from various platforms, like iOS, Android, and Selenium or Puppeteer, to deliver a simple, all-in-one automated testing solution.

Not only is Soda a feature rich CLI app, it's also an importable Node.js module and complete testing IDE. Tests can be created, edited, run and maintained through the file system or database and the CLI, or visually through our Soda Visual Editor.

*If it can be represented using a tree, Soda can test it!*

## Features
---
- **Cross-platform testing**
    - Test your app across all platforms, using a single set of scripts
    - Even your web pages *and* mobile apps can use the same scripts
- **Simple, easy to use JSON syntax**
    - **No Code.** A layman can read your test scripts!
    - Using our [Visual Editor](#soda-visual-editor), anyone can write them
    - Our *action file* structure makes the most of JSON re-use, making tests terse and reuseable
- **Test & Results Management**
    - Soda organizes your test structure for you in a neat and clean file structure
    - Test results are saved in a JSON format for portability
    - Screenshots automatically taken on test failure
    - Trace files, which can be re-run and given to devs to reproduce bugs
- **Easy Setup**
    - All you need is Node.js, NPM, and a JSON editor
- **Unobtrusive**
    - No SDK required in your apps
    - No recompiling
- **Fast & Portable**
    - Run multiple Soda processes to run scripts in parallel
    - Integrate Soda into your own Node.js processes
- **Supported on OS X, Windows, and Linux**

## Install
- **Install the node_modules**
    - Run this from within the src directory of soda
---
```bash
$ npm install
```

- **Setup environment variables**
    - Add the following to your profile (Mac: ~/.bash_profile, Windows: env variables)
    - You will need to create a server public cert and private key pair and put them in the src/ directory
    - Replace ID with your ID, and change the path accordingly
    ```bash
    export SODA_VERSION=2.7.12
    export SODA_ROOT=/Users/ID/Source/soda/
    export SODA_HOME=/Users/ID/Source/soda/src
    export LAMBDA_ASSET_PATH=@lambda:/soda/assets:KEY:SECRET
    export SODA_SECRET=SECRET_TO_REPLACE
    export AUTH_HOST=your.api.host.com
    export AUTH_PATH=/oauth2/token
    export API_HOST=your.api.host.com
    export PERFECTO_USER=youremail@yourdomain.com
    export PERFECTO_HOST=host.perfectomobile.com
    export PERFECTO_PASSWORD=whateveryourpasswordis
    export MAINTAINER_NAME=YourNameHere
    export SMTP_FROM_ADDRESS='"sODA" <soda@host.com>'
    export MAINTAINER_EMAIL=youremail@host.com
    export SMTP_HOST=mailhost.host.corp
    export SMTP_FROM_ADDRESS=soda@host.com
    export KEY16=0123456789012345
    export KEY24=012345678901234567890123
    export KEY32=01234567890123456789012345678901
    export WINDOWS_SERVER=WINDOWSSERVERNAME
    ```
    - Update your path to include the soda/bin directory
    - Replace ID with your ID, and change the path accordingly
    - Set SODA_SECRET to empty to run locally
    ```bash
    export PATH="$HOME/Users/ID/Source/soda/src/bin:$PATH"
    ```

## Run
- **Easy to run**
    - After running the install above
    - Run this from within the src directory of soda
    - Use the below command, replacing PATH_TO_SCRIPTS with ./sample_project (full path)
---
```bash
$ ./soda chrome about:blank -f puppeteer -t PATH_TO_SCRIPTS -e prod -p 1337 -x web -s my_suite -m my_module -dvc
```

## Table of Contents
---
1. [Install](#install)
2. [Soda Philosophies](#soda-philosophies)
3. [Soda & JSON](#soda-json)
4. [The Soda Engine](#the-soda-engine)
5. [Definitions](#definitions)
6. [Getting Started](#getting-started)
    - [Setting up Automator (Android)](#setting-up-automator-android)
    - [Setting up Instruments (iOS)](#setting-up-instruments-ios)
    - [Setting up Selenium (Web)](#setting-up-selenium-web)
    - [Setting up Puppeteer (Web)](#setting-up-puppeteer-web)
    - [Running Your First Test](#running-your-first-test)
7. [Starting A New Project](#starting-a-new-project)
    - [Project Structure](#project-structure)
    - [Suites](#suites)
    - [Modules](#modules)
    - [Global & Common Directories](#global-common-directories)
    - [Test/Action/Screen/Menu/Popup Directories](#testactionscreenmenupopup-directories)
    - [Asset Scoping](#asset-scoping)
8. [The Soda DOM](#the-soda-dom)
    - [Element Property Actual Mappings](#element-property-actual-mappings)
9. [About Selectors](#about-selectors)
    - [The 4 Basic Selector Operators](#the-4-basic-selector-operators)
    - [Compound Selectors](#compound-selectors)
    - [Selector Hierarchy](#selector-hierarchy)
    - [The Wildcard Operator](#the-wildcard-operator)
    - [The Direct Descendant Operator](#the-direct-descendant-operator)
    - [The Ascendant Descendant Operator](#the-direct-ascendant-operator)
    - [Property Filters](#property-filters)
    - [The Nth Property Filter](#the-nth-property-filter)
10. [About Tests & Actions](#about-soda-tests)
    - [Syntax](#syntax)
        - [Web 1.0](#web-v1-0-and-mobile-v2-0)
        - [Mobile 2.0](#web-v1-0-and-mobile-v2-0)
        - [List of Action/Assertion Objects](#list-of-actionassertion-objects)
        - [The Comment Key](#the-comment-key)
    - [Test Flow](#test-flow)
    - [Screens, Menus, and Popups](#screens-menus-popups)
    - [Variables](#variables)
        - [Using Variables to Make Actions Re-usable](#using-variables-to-make-actions-reusable)
        - [Special and Predefined Test Variables](#special-and-predefined-test-variables)
    - [Best Practices](#best-practices)
11. [Selector Mapping](#selector-mapping)
12. [Soda CLI](#soda-cli)
    - [About the CLI/REPL](#about-the-clirepl)
    - [Starting Frameworks](#starting-frameworks)
    - [Running Tests](#running-tests)
        - [Test Mode vs. REPL Mode](#test-mode-vs-repl-mode)
        - [Test Mode Keys](#test-mode-keys)
    - [Platforms](#platforms)
    - [Soda CLI Commands](#cli-commands)
    - [Starting The Visual Editor from the CLI](#starting-the-visual-editor-from-the-cli)
13. [Soda Visual Editor](#soda-visual-editor)
    - [Starting the Visual Editor](#starting-the-visual-editor)
        - [Starting a Framework Using the Visual Editor](#starting-a-framework-using-the-visual-editor)
    - [Using Favorites](#using-favorites)
    - [Using the Screen](#using-the-screen)
    - [Anatomy of the Editor](#anatomy-of-the-editor)
        - [Element Inspector](#element-inspector)
        - [Screen Elements](#screen-elements)
        - [Console](#console)
        - [Builder](#builder)
        - [Running Tests](#running-tests-1)
        - [Test Monitor](#test-monitor)
        - [Results History](#results-history)
        - [Test Editor](#test-editor)
        - [Actions Toolbox](#actions-toolbox)
            - [Saving Assets](#saving-assets)
            - [Widgets](#widgets)
        - [Project Manager](#project-manager)
        - [Settings](#settings)
    - [Visual Editor Keyboard Shortcuts](#visual-editor-keyboard-shortcuts)
14. [Trace Files](#trace-files)
15. [Using Soda as a Node Module](#using-soda-as-a-node-module)
    - [Hooking into Soda](#hooking-into-soda)
    - [Awesome Soda Sub-Modules](#awesome-soda-sub-modules)
        - [Soda REPL](#soda-repl)
        - [Soda Console](#soda-console)
        - [Soda Assert](#soda-assert)
16. [Using Databases](#using-databases)
17. [Configuration](#configuration)
18. [People](#people)
19. [License](#license)

## Install
---
```bash
$ npm install soda -g
```
**If installed globally, the following commands will be available:**   
For a complete synopsis of each command use *man*

| **Command**    | **Description**                                                                                          |
| :------------- | :------------------------------------------------------------------------------------------------------- |
| *soda*         | Starts the Soda CLI                                                                                      |
| *sodarun*      | Runs a single test script, or a suite/module/test/action from the specified location (suite and module)  |
| *sodatrace*    | Runs a Soda trace file                                                                                   |
| *sodareset*    | Resets a device using the specified framework                                                            |
| *sodaeditor*   | Starts the Soda Visual Editor (IDE)                                                                      |
| *sodabuild*    | Builds and app using Soda and the specified arguments                                                    |
| *sodamake*     | Initializes a blank Soda scripts project                                                                 |

## Soda Philosophies   
---  
- **The Document Object Model**
    - Any item on a web page or screen is an element in a document
    - All screens, menus, popups, pages, etc. can be represented as a tree
    - Elements have parents and children
- **Atomic Testing**
    - A test should test a **single** test case
    - **No conditionals, period.** Conditionals indicate separate test cases with similar flows
    - Given a set of data, *x*, and an application, *y*, pumping *x* into *y* should **always** produce *z*
- **No app SDK requirement or recompiling**
    - We believe that testing should be completely independent of your app
    - Using Soda means you're testing your app as it is.
    - We use the native tools provided by iOS, Android, and the web.
        - We call each tool a *framework*
- **No code**
    - Most testing packages use *more* code to test code
    - Not a good idea, especially if the underlying codebase is bad to begin with
    - If you write code to test code, we ask: "Who's going to test your tests?"
    - Hard to read/write for non-developers

## Soda & JSON
---
**Soda uses JSON to write tests.** It's simple, serializable, and less prone to dev error.   

In addition to utilizing JSON, Soda uses it's own selector engine, much like CSS and jQuery. No more XPaths! And selectors are the **same** across platforms...

**Here's an example of Soda's syntax, see how simple it is?**

```json
{
    "meta": {
        "name": "my-awesome-script",
        "id": "0001",
        "description": "This is a really awesome test script",
        "syntax": {
            "name": "mobile",
            "version": "2.0"
        },
    },
    "actions": [
        {
            "tap": ".login_username"
        },
        {
            "set": ".login_username",
            "to": "myusername"
        },
        {
            "tap": ".password"
        },
        {
            "set": ".password",
            "to": "mysecretpassword"
        },
        {
            "tap": "#button:0"
        }
    ]
}
```

## The Soda Engine
---
Soda works by communicating with the framework that you're testing on (i.e. Instruments, Selenium, Puppeteer, Automator, etc.). It goes out and gets *some* kind of representation of the screen back and creates a normalized DOM (tree) from this representation.

**Soda is an engine.** The elements you define in your scripts are checked against our tree. This means the framework is actually doing very little, and Soda can harness the power of Node.js to do the heavy lifting.

If you chose to interact with an element, Soda sends a message to the framework to tap, swipe, click, etc.

By doing very little with the framework itself, Soda has abstracted away all the code needed to work with the framework. Additionally, it only uses a handful of methods to work with the framework, meaning: if it all changed tomorrow, updating Soda to work with the new framework should be a simple and quick task.

## Definitions
---
This is a brief list of terms that we'll be throwing around a lot in this document. It's good to have a broad understanding of each before continuing...

**Framework**   
The interface between Soda and the *native tools* for the device you are testing on. For iOS, this is *Instruments*, for Android it's *Automator*, and for the web it's *Selenium* or *Puppeteer*.

**Asset**   
A Soda-JSON testing script; could refer to any of the following script types: *test, action, screen, menu,* or *popup*.

**Test**   
A JSON file. A collection of *actions* to be run as a single use case test.  
*A test is like the 'main' function in a C program.*

**Action**
A JSON file. A reusable snippet of test code that performs flow operations (tap, click, swipe, etc.), may call upon screens, menus, and popups to be validated, and can even call upon other actions.
*An action is like a function. It performs a single task, can be called over and over, and can even call other functions.*

**Screen**
A JSON file. A representation of a screen (or webpage). A list of assertions which define the screen's structure and validate the existence and values of its elements.

**Menu**
A JSON file. A representation of a menu. A list of assertions which define the menus's structure and validate the existence and values of its elements.

**Popup**
A JSON file. A representation of a popup (or alert). A list of assertions which define the popups's structure and validate the existence and values of its elements.

**DOM**
Stands for *Document Object Model*. The hierarchial and logical structure of a screen (or webpage) and its elements. See [W3's Definition](https://www.w3.org/TR/DOM-Level-2-Core/introduction.html) for a more detailed explanation.

**Selector**
A string used to pick out one or more elements from the DOM. See [this section](#about-selectors) for more information.

## Getting Started
---
After installing Soda as a global module, you'll likely need to do some configuration to get a framework running.   
**For this section, you can use the Soda example projects and tests...**

**Soda Project**   
- Filesystem: *path/to/soda/sample_project*
- AWS DB using oauth: @lambda:/soda/assets:[KEY]:[SECRET]

**Binaries**   
| Platform | Path |
| :------- | :--- |
| iOS      | *path/to/soda/sample_apps/SodaSample.app* |
| Android  | *path/to/soda/sample_apps/SodaSample.apk* |

### Setting up Automator (Android)
Soda uses the *Android SDK Tools* to work with Automator.   
In addition, you'll need the *Android SDK Platform-Tools* and *Android SDK Build-Tools*.

 See http://developer.android.com/sdk/installing/adding-packages.html for more information.   
**We recommend you put the SDK contents in *~/Library/Android/sdk/***

Once you've installed the SDK, Platform-Tools, and Build-Tools, ensure the *ANDROID_SDK_HOME* environment variable points to the path where you installed the SDK.

**Unix**
```bash
echo $ANDROID_SDK_HOME
```
If it's not set, or if it's not set to where you installed the SDK execute...

```bash
echo "\nANDROID_SDK_HOME=/path/to/the/sdk" >> ~/.bash_profile
```
and then restart your terminal.

**Windows**
```bash
echo %PATH%
```
If it's not listed in the output, or if it's not set to where you installed the SDK execute...

```bash
SETX /M PATH "%PATH%;/path/to/the/sdk"
```
and then restart the command prompt.

**Now, you'll need to spin up some emulators using the AVD Manager.**   
Once you've created some emulators, start up Soda using the automator framework.   

Enter the following command where *emulator_name* is the name you gave the emulator **with underscores instead of spaces**, *path_to_apk* is the path to your *.apk* file, and *path_to_test_scripts* is the path to your Soda project.
```bash
$ soda [emulator_name] [path_to_apk] -f automator -t [path_to_test_scripts] -x android
```

The [Soda CLI](#soda-cli) should startup, and the emulator you selected should boot. If the app you specified isn't installed on the device, Soda will install it. Then, the app will be booted.   

**You're ready to begin testing!**   
Skip down to the [Running Your First Test](#running-your-first-test) section.


### Setting up Instruments (iOS)
The Instruments framework is much easier to setup than Automator, but it has its own difficulties.

First, if you're running multiple versions of XCode, you should know that whichever version of XCode you're running will affect which simulators are available to you in both XCode and Soda.

**Execute *man xcode-select* for more information about changing between XCode versions**

Start Soda using the following command, where *simulator_name_and_runtime* is the name of the simulator, a space, and then the simulator runtime.
For example, *iPhone 6 Plus 9.2* or *iPad Air 8.4*. If you don't know the available devices you can execute *instruments -s devices* to list them.
*path_to_app_binary* is the path to your *.app* file and *path_to_test_scripts* is the path to your Soda scripts project.
```bash
$ soda [simulator_name_and_runtime] [path_to_app_binary] -f instruments -t [path_to_test_scripts] -x iphone
```

The [Soda CLI](#soda-cli) should startup, and the simulator you selected should boot. If the app you specified isn't installed on the device, Soda will install it. Then, the app will be booted.   

**You're ready to begin testing!**   
Skip down to the [Running Your First Test](#running-your-first-test) section.

**Issues with Instruments**
Before Soda can start the Instruments framework, it needs an *.app* binary. XCode, by default, puts builds in some random folder on some magically hard to find place on your hard drive... so finding the binary can be difficult. Even worse, entering that random path into terminal is cumbersome.

**The best way to overcome this challenge is to set XCode to build to the same folder every time you build...**   
To do this, open your XCode project or workspace in XCode.

- Go to *File > Workspace Settings* in the menu bar
- Click the *Advanced...* button under the *Derived Data* heading
- Select the *Custom* radio button
- Select the *Relative to workspace* options from the dropdown beside  the *Custom* radio button
- Enter the path to build to for both *Products* and *Intermediates* relative to your project root in the two textfields
    - *Intermediates* will be built when you press the *Play* button, or select *Product > Build* from the menu bar
    - *Products* will be built when you select *Product > Profile* from the menu bar
    - For example, if you enter *build* in the textfields for both *Products* and *Intermediates* you builds will be placed in the following directories:
        - *Your/project/path/build/Release-iphoneos* for *Products*
        - *Your/project/path/build/Debug-iphoneos* for *Intermediates*

**Now, the path to your app binary will always be *Your/project/path/build/Release-iphoneos* or *Your/project/path/build/Debug-iphoneos* depending on how you build.**

**Another note about instruments**
If you're using the simulator, you *should* disable the menu setting *Debug > Optimize Rendering for Window Scale*. If this setting is enabled while using the Visual Editor, some elements may not appear on the Visual Editor screen shot.

### Setting up Selenium (Web)
The selenium framework requires no setup for Firefox. However, if you plan to run Chrome, IE, or Safari, you'll need to install some binaries to get these browsers to work with Selenium.

For instructions on setting up these binaries, view the Selenium Readme, at: https://www.npmjs.com/package/selenium-webdriver.

While you don't need to install or setup selenium—as we've handled that for you—you will need to review to section on setting up the additional components to get Chrome, IE, and Safari working.

Start Soda using the following command, where *browser_name* is the name of the browser you want to use, *initial_page* is a url starting point ("about:blank" is a good choice), and *path_to_my_scripts* is the path to your Soda scripts project.

```bash
$ soda [browser_name] [initial_page] -f selenium -t [path_to_my_scripts] -x web
```

The [Soda CLI](#soda-cli) should startup, and the browser you selected should open to the page you specified.

**You're ready to begin testing!**   
Skip down to the [Running Your First Test](#running-your-first-test) section.

### Running Your First Test
With your chosen framework loaded, we can start running tests using the sample project.

**First, look around the sample project.**   
Note the directories *my_suite* and *my_module* and the folder within *my_module* named *tests*. These are the tests available for the module *my_module* which belongs to the suite *my_suite*.

For more information about a Soda project's structure see the [Project Structure](#project-structure) section.

For now, however, go ahead and run the first test. We use the "run" command to execute tests. The run command is invoked by entering *:run* or *:r* for short.
```bash
> :r test 001 my_module my_suite
```

The test will execute, and the results will be printed to the screen.

Now, you can execute the second test. But first, we'll set the default suite and module so that the run command becomes simpler. Set the default suite using the *:suite* command, and *:module* to set the default module.
```bash
> :suite my_suite
> :module my_module

> :r test 002
```
Since we've set the suite and module we want to use, we can now just enter the type *test* and the test name.
Now, let's run a module. The following command will run the module *my_module* from the suite *my_suite*
```bash
> :r module my_module
```
Now all tests from the module *my_module* will execute, one after the next.

And to run the suite *my_suite*, we execute:
```bash
> :r suite my_suite
```

**If you're ever "stuck" in *testing mode* (keypress mode), you can press the "x" key to return control to the Soda CLI**

**That's the basics!**   
Now, go ahead and review the next section to start your own project and be sure to review the [Selectors](#about-selectors) section to learn more about using selectors to find elements and the [About Soda Tests](#about-soda-tests) section to learn more about test types and their syntax.

## Starting A New Project
---
Use the *sodamake* command to create a blank Soda scripts project.
```bash
$ sodamake [destination] [project_name]
```

Soda uses a pre-defined directory structure to locate and run tests from within the CLI and Visual Editor.

#### Project Structure
**A Soda project must contain a file called *soda.json* in its root!**   
This file doesn't have to contain anything (except valid json). *Why?* This is done to prevent Soda from scanning giant directories by accident (like a user's home directory).

**A Soda project should be structured like this:**   
```
.
|-- soda.json
|-- global
    |-- tests
    |-- actions
    |-- screens
    |-- menus
    |-- popups
|-- suiteA
    |-- suite.json
    |-- common
        |-- tests
        |-- actions
        |-- screens
        |-- menus
        |-- popups
    |-- modules
        |-- moduleA
            |-- module.json
            |-- tests
            |-- actions
            |-- screens
            |-- menus
            |-- popups
        |-- moduleB
            |-- module.json
            |-- ...
        |-- moduleC
            |-- module.json
            |-- ...
|-- suiteB
    |-- suite.json
    |-- common
    |-- modules
|-- suiteC
    |-- suite.json
    |-- common
    |-- modules
```

Each project root contains a *global* folder and various *suite* directories. Scripts in the *global* folder can be used by any of the suites, but scripts inside of each suite can only be used by that suite.

#### Suites
Each **suite** directory must contain a *suite.json* file. The *suite.json* file doesn't have to contain anything (except valid JSON) but *should* contain at least the following keys:
```JSON
{
    "name": "My Suite",
    "description": "A very helpful description"
}
```

Each suite directory contains a *common* folder and various *module* directories. Scripts in the common folder can be used by any module, but scripts inside of each module may only be used by its respective module.

#### Modules
Each **module** directory must contain a *module.json* file. The *module.json* file doesn't have to contain anything (except valid JSON), but *should* contain at least the following keys:
```JSON
{
    "name": "My Module",
    "description": "A very helpful description"
}
```
#### Global & Common Directories
**Global and common directories provide a way for modules to share scripts.**

A Soda project can only contain one *global* directory at the root of the project. These assets can be used by any suite or module.

Each suite can contain a single *common* directory, which will contain scripts that are shared between modules, but not by suites.

#### Test/Action/Screen/Menu/Popup Directories
Within the *global* directory, every *common* directory and every module, should be the following directories:

| Directory Name  | Purpose                  |
| :-------------- | :----------------------- |
| **tests**       | Contains test scripts    |
| **actions**     | Contains action scripts  |
| **screens**     | Contains screen files    |
| **menus**       | Contains menu files      |
| **popups**      | Contains action files    |

See [*About Tests & Actions*](#about-soda-tests) section below for more information about tests, actions, screens, menus, and popups.

#### Asset Scoping
Like mentioned above, here's the scoping rules for a Soda scripts project.

| Directory | How Many Directories?   | Scope |
| :-------- | :---------------------- | :---- |
| *global*  | 1                       | Scripts can be used by any suite or module |
| *common*  | 1 per suite             | Scripts are limited to the containing suite, but any module within the suite can use them |
| *suite*   | Infinite                | Scripts in a suite can only be used by the respective suite, but can also use *global* scripts |
| *module*  | Infinite                | Scripts in a module can only be used by the respective module, but can also use *common* scripts |

## The Soda DOM
---
Like mentioned before, Soda creates a DOM tree for each screen or page. It does this the same way for every framework. Every element in the DOM (aside from root elements) has a parent, and may or may not contain children.

**All elements of a Soda DOM are structured like this:**
```json
{
    "[elementid:elementNum]": {
        "id": "[id]",
        "type": "[type]",
        "name": "[name]",
        "label": "[label]",
        "value": "[value]",
        "rect": {
            "origin": {
                "x": 0,
                "y": 0
            },
            "size": {
                "width": 100,
                "height": 100
            }
        },
        "hitpoint": {
            "x": 50,
            "y": 50
        },
        "enabled": true,
        "visible": true,
        "hasKeyboardFocus": false,
        "valid": true,
        "children": {},
        "index": 1,
        "parent": {
            "id": "[parent id]",
            "name": "[parent name]",
            "value": "[parent value]",
            "label": "[parent label]"
        }
    }
}
```

### Element Property Actual Mappings
The above describes the structure of each element... but where do these values comes from? Here's a list of the mapping of an element to its *native framework's* source values.

**Instruments (iOS)**
Some descriptions (or parts of them) are borrowed directly from Apple's documentation [here](https://developer.apple.com/library/prerelease/ios/documentation/ToolsLanguages/Reference/UIAElementClassReference/index.html).
| Element Property   | Framework Value                  | Description |
| :----------------- | :------------------------------- | :---------- |
| *id*               | N/A                              | A Soda generated value based on the UIAElement type |
| *type*             | N/A                              | The *UIAElement* type (or class name) |
| *name*             | *UIAElement.name()*              | **XCode Accessibility Identifier**<br>The element name is derived from the accessibility attribute of the underlying view. If an identifier attribute string is specified, that string is used as the name; otherwise, the label attribute string is used as the name.  |
| *label*            | *UIAElement.label()*             | **XCode Accessibility Label**<br>The element label is derived from the accessibility label of the underlying view |
| *value*            | *UIAElement.value()*             | A value attribute specific to the type of element. |
| *rect*             | *UIAElement.rect()*              | The size and origin of the element relative to the window size and position |
| *hitpoint*         | *UIAElement.hitpoint()*          | The hitpoint (touch) position of the element relative to the window size and position |
| *enabled*          | *UIAElement.isEnabled()*         | Determines whether the specified element is enabled. True for enabled, false for disabled |
| *visible*          | *UIAElement.isVisible()*         | True if the user interface element represented by the specified element is visible on screen, false if not. |
| *hasKeyboardFocus* | *UIAElement.hasKeyboardFocus()*  | Whether or not the specified element receives keyboard input. True if so, false if not. |
| *valid*            | *UIAElement.isValid()*           | Whether or not the user interface element represented by the specified UIAElement existed as of the last attempt to access it. True if so, false otherwise. |

**Automator (Android)**
The values for the Automator framework come from the XML results of the ADB *shell uiautomator dump* command.
| Element Property   | XML Key                          | Description |
| :----------------- | :------------------------------- | :---------- |
| *id*               | N/A                              | A Soda generated value based on the element type |
| *type*             | *class* or *package-name*        | The last token of the *class* XML value split by periods (or if not present the last token of the *package-name* value) |
| *name*             | *resource-id*                    | The last token of the *resource-id* value, split by forward-slashes |
| *label*            | *content-desc*                   | The *content-desc* key value |
| *value*            | *text*                           | The *text* key value |
| *rect*             | *bounds*                         | The size and origin of the element relative to the window size and position as derived from the *bounds* key value |
| *hitpoint*         | *bounds*                         | The hitpoint (touch) position of the element relative to the window size and position as derived from the *bounds* key value |
| *enabled*          | *enabled*                        | The value of the *enabled* key |
| *visible*          | N/A                              | Derived using *e.rect.size.height > 0 && e.rect.size.width > 0* |
| *hasKeyboardFocus* | *selected*                       | The value of the *selected* key |
| *valid*            | *UIAElement.isValid()*           | **Unused.** Always *true* |

**Selenium (Web)**
| Element Property   | HTML Attribute/Property          | Description |
| :----------------- | :------------------------------- | :---------- |
| *id*               | *id*                             | The element's id attribute, or if no id is specified: a Soda generated value based on the tag type |
| *type*             | *element.tagName*               | The HTML tag name |
| *name*             | *class*                          | An array of the element's classes |
| *label*            | *name*                           | The element's *name* attribute |
| *value*            | *textNode* or *value*            | For input elements, the *value* attribute, otherwise the element's text contents |
| *rect*             | N/A                              | The derived size and origin of the element relative to the window size and position |
| *hitpoint*         | N/A                              | The derived center of the element in regard to size and postion |
| *enabled*          | *disabled*                       | The element's *disabled* attribute, or true if non-existent |
| *visible*          | N/A                              | Derived using *$el.height() > 0 && isElementInViewport(el)* |
| *hasKeyboardFocus* | *document.activeElement*         | Whether or not the element is focused. True if so, false otherwise |
| *valid*            | N/A                              | **Unused.** Always *true* |



## About Selectors
---
A Soda selector is a string used return a set of elements to test against. They function much like CSS selectors and are used to find elements at a granular level.

Soda uses selectors to match elements based on their properties. Given a selector, Soda will always return a set (zero to *n*) elements that "match" the selector based on the available DOM Tree (e.g. page, window, or screen).

There are four basic property keys used to find elements: *id, name, label,* and *value*. Using a single character, we’ve created a mapping from element property to character (which we call an operator):

### The 4 Basic Selector Operators
| Element Property   | Character         |
| :----------------- | :---------------- |
| Id                 | **#** (Hash)      |
| Name               | **.** (Period)    |
| Label              | **^** (Caret)     |
| Value              | **@** (At)        |

#### True Selector Element Mappings
**What These Element Properties *Really* Represent**
Since the charcter's listed above map to element properties, we feel it necessary to inform you as to what the *element properties* really map to in regard to their *native frameworks*

This is described in detail [above](#element-property-true-mappings)

**Selector Examples**
```js
// Select all elements that have the property id equal to “textfield:0" #textfield:0
"#textfield:0"

// Select all elements that have the property name equal to "userName"
".userName"

// Select all elements that have the property label equal to "userName"
"^username"

// Select all elements that have the value "Username"
"@Username"

// If a property contains spaces or special characters ([^a-zA-z0-9_])
// wrap the selector in curly braces
"@{Forgot Password?}"
"^{Some element with a label}"
"@{Element$ with weird value$}"
```
### Compound Selectors
You can combine the four basic selector operators for a more granular tree search
```js
// Select all elements that have the property id equal to “textfield:0" and a name property
// equal to "userName"
"#textfield:0.userName"

// Select all elements that have the property id equal to "textfield:0", a name property
// equal to "userName" and a value equal to "Username"
"#textfield:0.userName@Username"
// Or using curly braces
"#{textfield:0}.{userName}@{Username}"

// Select all elements that have a name property which is an array, with multiple names
// Suppose the element has the name values ["foo", "bar", "baz"]
".foo"
".foo.bar"
".foo.bar.baz .baz.bar.foo .baz.foo"
```
### Selector Hierarchy
**Spaces in selectors represent hierarchy, where parentage follows from left to right.**
You can use selector hierarchy to match elements which have identifiable parents.
```js
// Select all elements that have the property id equivalent to “textfield:0" and the parent
// with an id of “window:0”
"#window:0 #textfield:0"

// Select all elements that have the property name equivalent to “userName" and the parent
// with an id of “window:0”
"#window:0 .userName"

// Select all elements that have the property label equivalent to “userName" and the parent
// with a label of “elementLabel”
"^elementLabel ^username"

// More examples...
"#window:0 #textfield:1 @Username #window:0 #textfield:1 ^.userName #id #id ^label .name @value"
```

### The Wildcard Operator
**Use the wildcard operator (\*) to select all descendants.**
The asterisk (\*) is the wildcard selector operator and selects all elements at or below the specified "level."
```js
// Select all elements (level 0, “root”)
"*"

// Selects all elements that are a child of root elements (level 1)
"* *"

// Selects all elements all elements that are grand children of the root level (level 2)
"* * *"

// etc. etc.
"* * * *"
"* * * * *"

// You can use the wildcard with other selectors
// Selects all elements that are children of elements with their property name equivalent to
// "userName"
".userName *"

// More examples
"#window:0 * .userName"
"#window:0 * *"
"* * @Username"
"@elementWithThisValue ^{elementWithThisLabel which has $pecial c4aracters} *"
```
### The Direct Descendant Operator
**Use the direct descendant operator (>) to select immediate children.**
The direct descendant operator differs from the wildcard operator as the wildcard selects all children, grandchildren, and nth-grand children of the given set. The direct descendant operator only returns the direct children of each of the elements in the given set.
```js
// Select elements that are children of the root
">"

// Select the immediate children of an element with the value "Username"
"@Username >"

// Select the children of the children of an element with the id "window:0"
"#window:0 > >"

// Select all elements that have children
// The star returns all elements, then the > selects the children of all elements.
// So if an element has children, it is returned
"* >"

// Select all non-root elements
"> *"
// Or alternatively...
"* *"
```
### The Direct Ascendant Operator
**Use the direct Ascendant operator (<) to select immediate parents.**
The direct ascendant operator grabs the parents of the elements in the given set.
```js
// Select the parents of root-level elements
// This will always return an empty set
"<"
// Select the parents of all elements which have the property name equal to “.userName”
".userName <"

// Select the grandparents all elements which have the property name equal to “.userName”
".userName < <"

// Select the grandparents all elements which have the property name equal to “.userName”
// > < is a basically a no-op
".userName < < > <"

// Selects all elements with the value “Username”, from the children of the elements with the
// property label equal to “someElement”
"^someElement > @Username"
```

### Property Filters
**Use property filters to select elements based on any element property**
Property filters are appended to selectors using brackets, in the format *[property(operator)value]*. There are ten property filter operators.

**The 10 Property Filter Operators**
| Operator   | Description  |
| ---------- | ------------ |
| =          | Equal To     |
| !=         | Not Equal To |
| <          | Less Than    |
| <=         | Less Than or Equal To |
| \>         | Greater Than |
| \>=        | Greater Than or Equal To |
| ~          | Like (Regular Expression) |
| !~         | Not Like (Negated Regular Expression) |
| ?=         | Has |
| ?!         | Doesn't Have |

**Property Filter Examples:**
```js
// Select all elements with the property name equal to “username” and filter them by value
// Note: string values should be quoted
".userName[value=’some value’]"
".userName[value!=’some value’]"
".userName[value>0] .userName[value<0]"

// Select all elements which have the parent with the label parent
// filtered by window position ^parent *[rect.origin.x=0]
"^parent *[rect.origin.y=4.17]"

// Select all elements with the name userName which have the parent with the label parent,
// filtered by size
"^parent .userName[rect.size.width=100]"
"^parent .userName[rect.size.height=1345.12]"

// Select all enabled/disabled elements
// Note, Boolean values should *not* be quoted *[enabled=true]
"*[enabled=false]"

// Select all visible/hidden
"*[visible=true] *[visible=false]"

// Select all elements of type ‘textfield’
"*[type=’textfield’]"

// Select all enabled and visible elements
"*[enabled=true][visible=true]"

// Select all elements whose values matches the regular expression /admin.*/
"*[value~'admin.*']"

// Select all elements whose value is not “some value”
"*[value!=’value’]"

// Select the children of the element with the id “window:0” whose x position
// is greater than 500 #window:0
">[rect.origin.x>500]"

// Select an element who has multiple names (classes)
// This is only valid for web
".nameOne[name?=’name2’][name?=’name3’]"

// Select all elements who don’t have the name (class) “noName”
"*[name?!=’noName’]"

// Note ?= and ?! operate on sub-objects of the element
// So, if desired, you could do...
// Grabs all elements with a parent that has a label
"*[parent?=’label’]"

// Grabs all elements with a parent that does not have a name
"*[parent?!’name’]"

// Combine property filters!
".userName[value=’some value’][label=’some label] @Username[enabled=true][visible=true][value!=’some value’]"
```

### The Nth Property Filter
**The "nth" property filter is a special filter that chooses the nth element from the returned set.**
When using the nth property filter, Soda will first select all elements which match the given selector, then return the nth element in the set (if it exists). Remember Soda always returns a set, so using nth, you’ll either get a set of size one (if the nth element exists) or zero (if it doesn’t).

```js
// Select the first element in the returned set of elements with the name “userName”
// Note: nth is zero-based
".userName[nth=0]"

// Use “first” and “last” to select the first and last elements, respectively
".userName[nth=’first’]" // Returns the first element with the name “userName"
".userName[nth=’last’]"  // Returns the last element with the name “userName"

// Go crazy!
// The following ridiculous selector just selects #window:0
"#window:0[type='window'] > < *[nth=0] < >[type!='foo'] *[nth=1] <[type~'.*'] <[type~'window']"
```

## About Soda Tests
---
**Soda has 5 different conceptual file types.**

| Type        | Purpose                                                                 |
| :---------- | :---------------------------------------------------------------------- |
| **Test**    | A collection of actions                                                 |
| **Action**  | Defines *flows* (e.g. tap, click)                                       |
| **Screen**  | A screen definition, used by an action to validate a screen's elements  |
| **Menu**    | A menu definition, used by an action to validate a menu's elements      |
| **Popup**   | A popup definition, used by an action to validate a popup's elements    |

### Syntax
Soda allows for new and different JSON script syntaxes to be defined. Syntax authors may write their JSON structure however they like. The only constraint
Soda imposes is that every action *must* have a *meta* key at the root of the JSON file, with the following fields:

- **name** - The name of the test/action/screen/menu/popup
- **description** - A description of the test/action/screen/menu/popup
- **syntax** - An object with the syntax's name and syntax's version

Within the syntax definition, the author specifies *endpoints* where *action objects* or *assertion objects* will be evaluated during tests.

**Action objects** are JSON objects which will be evaluated in actions and tests.   
**Assertion objects** are JSON objects which will be evaluated in screens, menus, and popups.

**Soda has some out-of-the-box ready syntaxes**  
- Web v1.0
- Mobile v2.0

#### Web v1.0 and Mobile v2.0
The *web 1.0* and *mobile 2.0* definitions use the same syntax structure.

**Actions & Tests**   
The action/test structure includes a *meta* key, and an *actions* key which is an array. The *actions* array is where you put your test items.

You would enter your list of *action objects* within the *actions* array.
```json
{
    "meta": {
        "name": "test/action name",
        "description": "description",
        "syntax": {
            "name": "web/mobile",
            "version": "1.0/2.0"
        }
    },
    "actions": [

    ]
}
```

**Screens/Menus/Popups**  
The action/test structure includes a *meta* key, and an *screen*, *menu*, or *popup* key which contains a key *components* which is an array. The *components* array is where you put your test items.

You would enter your list of *assertion objects* within the *components* array.
```json
{
    "meta": {
        "name": "screen/menu/popup name",
        "description": "description",
        "syntax": {
            "name": "web/mobile",
            "version": "1.0/2.0"
        }
    },
    "screen/menu/popup": {
        "components": [

        ]
    }
}
```

### List of Action/Assertion Objects
Okay, so you've got the basic syntax structure down... but what exactly *can* you do within a Soda script, you ask?
The following sections list every action/assertion object available to the Mobile v2.0 and Web v1.0 syntaxes.

#### **Action objects for actions and tests**
| Action  | Supported Syntaxes  | Description  |
| :------ | :------------------ | :----------- |
| [Set](#set)                             | Mobile v2.0, Web v1.0 | Set an element's value |
| [Tap](#tap)                             | Mobile v2.0, Web v1.0 | Tap an Element |
| [Click](#click)                         | Web v1.0              | Tap an Element |
| [ClickAll](#clickall)                   | Web v1.0              | Clicks all the elements with the given selector, one after the next |
| [Swipe](#swipe)                         | Mobile v2.0           | Swipe an Element |
| [Tap XY](#tap-xy)                       | Mobile v2.0           | Tap on the screen at the given coordinates |
| [Type on Keyboard](#type-on-keyboard)   | Mobile v2.0           | Type on the device's soft keyboard |
| [Scroll](#scroll)                       | Mobile v2.0, Web v1.0 | Scrolls the given element |
| [Scroll to Visible](#scroll-to-visible) | Mobile v2.0, Web v1.0 | Scrolls the given element into view |
| [Close](#close)                         | Web v1.0              | Closes the browser window |
| [Switch To Frame](#switch-to-frame)     | Web v1.0              | Switches to the named iFrame element |
| [Goto](#goto)                           | Web v1.0              | Go to the given URL |
| [Reload](#reload)                       | Web v1.0              | Reloads (refreshes) the page |
| [Forward](#forward)                     | Web v1.0              | Navigate the browser forward |
| [Back](#back)                           | Mobile v2.0, Web v1.0 | Press the hardware back button (Android Only), or navigates the browser back (Web only) |
| [Execute](#execute)                     | Mobile v2.0, Web v1.0 | Execute an action file |
| [Validate](#validate)                   | Mobile v2.0, Web v1.0 | Validate a screen/menu/popup |
| [Store](#store)                         | Mobile v2.0, Web v1.0 | Stores a test variable |
| [Save](#save)                           | Mobile v2.0, Web v1.0 | Saves an element as a variable |
| [Wait](#wait)                           | Mobile v2.0, Web v1.0 | Waits for the given number of seconds |
| [Wait For](#wait-for)                   | Mobile v2.0, Web v1.0 | Waits for the specified elements to appear |
| [Hide App For](#validate)               | Mobile v2.0           | Puts the app in the background for the given number of seconds |
| [Refresh](#refresh)                     | Mobile v2.0, Web v1.0 | Explicitly refresh the DOM |
| [Debug](#debug)                         | Mobile v2.0, Web v1.0 | Print a message to the screen during testing |
| [Retries](#retries)                     | Mobile v2.0, Web v1.0 | Set the number of *element retries* during testing |
| [OS Exec](#os-exec)                     | Mobile v2.0, Web v1.0 | Execute a shell command |
| [Rotate Device](#rotate-device)         | Mobile v2.0           | Rotate the device to the given orientation |
| [Get Config](#get-config)               | Mobile v2.0, Web v1.0 | Get a Soda configuration setting and save it as a test variable |
| [Set Config](#set-config)               | Mobile v2.0, Web v1.0 | Set a Soda configuration variable |

#### **Assertion objects for screens, menus, and popups**
| Assertion  | Supported Syntaxes  | Description  |
| :--------- | :------------------ | :----------- |
| [Exists](#exists)                     | Mobile v2.0, Web v1.0 | Assert that elements exists |
| [Matches](#matches)                   | Mobile v2.0, Web v1.0 | Assert that elements match a regular expression |
| [Is](#is)                             | Mobile v2.0, Web v1.0 | Assert that elements is equal the given string |
| [Has Count](#has-count)               | Mobile v2.0, Web v1.0 | Assert that the given selector returns the specified number of elements |

#### Actions/Tests
These are the action objects available in action and test files.

##### Set
*Mobile v2.0, Web 1.0*   
Sets an element's value to the given value.   

| Keys       | Required    | Type           | Description  |
| :--------- | :---------: | :------------- | :----------- |
| *set*      | Yes         | *{string}*     | A selector representing the elements to set |
| *to*       | Yes         | *{string}*     | The value to set the elements to |

```json
{
    "set": ".password",
    "to": "my$ecretPassword"
}
```

##### Tap
*Mobile v2.0, Web v1.0*   
Taps an element, then refreshes the DOM. If multiple elements are matched an error will be thrown (the test will be failed)

| Keys       | Required    | Type           | Description |
| :--------- | :---------: | :------------- | :----------- |
| *tap*      | Yes         | *{string}*     | A selector representing the element to tap |
| *refresh*  | No          | *{boolean=}*   | If false, the DOM will not be refreshed following the tap. Useful for tapping multiple elements on the same screen one after the next |
| *options*  | No          | *{object=}*    | An object with tap options. These options differ from framework to framework |

**Examples:**
```json
[
    {
        "tap": "^someElement"
    },
    {
        "tap": "^someElement",
        "refresh": false
    },
    {
        "tap": "^someElement",
        "options": {
            "tapCount"   : 2,
            "touchCount" : 4,
            "duration"   : 3
        }
    }
]
```

##### Click
*Web v1.0*   
Clicks an element, then refreshes the DOM.    
**Note this is synonymous with *tap*** Web v1.0 will accept either *click* or *tap*. However Mobile v2.0 will only accept *tap*

##### ClickAll
*Web v1.0*   
Clicks all the elements with the given selector, one after the next

| Keys       | Required    | Type           | Description |
| :--------- | :---------: | :------------- | :----------- |
| *clickAll* | Yes         | *{string}*     | A selector representing the elements to click |
| *refresh*  | No          | *{boolean=}*   | If false, the DOM will not be refreshed following the clicks |

**Examples:**
```json
[
    {
        "clickAll": ".someClassWithMultipleElements"
    }
]
```

##### Swipe
*Mobile v2.0*   
Swipes an element, then refreshes the DOM.   

| Keys       | Required    | Type           | Description |
| :--------- | :---------: | :------------- | :----------- |
| *swipe*    | Yes         | *{string}*     | A selector representing the elements to swipe |
| *refresh*  | No          | *{boolean=}*   | If false, the DOM will not be refreshed following the swipe. Useful for swiping multiple elements on the same screen |
| *options*  | No          | *{object=}*    | An object with swipe options. These options differ from framework to framework |

**Examples:**
```json
[
    {
        "swipe": "^someElement"
    },
    {
        "swipe": "^someElement",
        "refresh": false
    },
    {
        "swipe": "^someElement",
        "options": {
            "touchCount"  : 3,
            "startOffset" : 1,
            "endOffset"   : 20,
            "duration"    : 3
        }
    }
]
```

##### Tap XY
*Mobile v2.0*   
Taps an set of coordinates on the screen
| Keys          | Required    | Type           | Description  |
| :------------ | :---------: | :------------- | :----------- |
| *tapXY*       | Yes         | *{Array}*      | An array in the format *[x, y]* where *x* is the horizontal position to tap and *y* is the vertical position to tap |
| *refresh*     | No          | *{boolean=}*   | If false, the DOM will not be refreshed following the tap. Useful for clicking multiple elements on the same screen |
| *relativeTo*  | No          | *{string=}*    | A selector. If specified, *tapXY* will tap relative to this element. Element must be unique. |

**Examples:**
```json
[
    {
        "tapXY": [50, 100]
    },
    {
        "tapXY": [34, 123.3],
        "refresh": false
    },
    {
        "tapXY": [123.123, 0],
        "relativeTo": "#window:3"
    }
]
```

##### Type on Keyboard
*Mobile v2.0*   
Types on the soft keyboard. This differs from set, as set immediately sets the element's value, *typeOnKeyboard* will actually type out the given string.
The keyboard must be up and enabled. Typically, this action object is preceded by a *tap* on a textfield.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *typeOnKeyboard*  | Yes         | *{string}*     | The string to type |

**Examples:**
```json
[
    {
        "tap": "#textfield:0"
    },
    {
        "typeOnKeyboard": "Hello world!"
    }
]
```

##### Scroll
*Mobile v2.0, Web v1.0*   
Scrolls the given element. The element must be a scrollable element (e.g. a *tableview*, scrollable *div*, etc.). If no direction is specified, the direction will default to *down*.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *scroll*          | Yes         | *{string}*     | A selector. The element to scroll |
| *direction*       | No          | *{string=}*    | The direction to scroll: "up", "down", "left", or "right" |
| *amount*          | No          | *{number=}*    | The amount to scroll. Setting this to 1 will scroll the full amount of the element's height. 2 would scroll twice the element's height. |
| *refresh*         | No          | *{boolean=}*   | If set to false, the DOM will not be refreshed after scrolling. |

**Examples:**
```json
[
    {
        "scroll": "#tablview:0"
    },
    {
        "scroll": "#tableview:0",
        "direction": "up"
    },
    {
        "scroll": "#tableview:0",
        "direction": "up",
        "amount": 0.5
    },
    {
        "scroll": "#tableview:0",
        "direction": "up",
        "amount": 0.5,
        "refresh": false
    }
]
```

##### Scroll to Visible
*Mobile v2.0, Web v1.0*   
Scrolls the given element into view. If multiple elements are matched, an error will be throw (fail the test).   

**iOS and Web treat this action object differently than Android.**   
For Android, if the element is not initially found, Soda will first scroll down to find the element until the DOM tree is unchanged. If unfound, it will
then try to scroll up and find the element (until the screen doesn't change anymore), then left, and finally right.

You can set the maximum number of scroll attempts for each direction for Android using the **maxAttempts** key.

| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *scrollToVisible* | Yes         | *{string}*     | A selector. The element to scroll into view |
| *parent*          | No          | *{string=}*    | Android only. If specified, *scrollToVisible* uses the specified parent to scroll, otherwise the current widow will be used |
| *amount*          | No          | *{integer=}*   | Android only. The amount to scroll. 1 is equal to the scrolling object's height (or width for left and right directions) |
| *maxAttempts*     | No          | *{integer=}*   | Android only. The maximum number of scroll attempts in each direction to find the element |

**Examples:**
```json
[
    {
        "scroll": "#tablview:0"
    },
    {
        "scroll": "#tableview:0",
        "direction": "up"
    },
    {
        "scroll": "#tableview:0",
        "direction": "up",
        "amount": 0.5
    },
    {
        "scroll": "#tableview:0",
        "direction": "up",
        "amount": 0.5,
        "refresh": false
    }
]
```

##### Close
*Web v1.0*   
Closes the browser window. This is a useful action to call at the end of a test. If starting a new test, a new window will be opened if the browser window
was previously closed.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *close*           | Yes         | *{\*}*         | The value provided doesn't matter |

**Examples:**
```json
[
    {
        "close": true
    }
]
```

##### Switch to Frame
*Web v1.0*   
Switches to the iFrame matched by the given selector. If multiple elements are matched an error will be throw (fails the test).   
**Use "default" to switch back to the window frame**

| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *switchToFrame*   | Yes         | *{string}*     | A selector. The iFrame to switch to |

**Examples:**
```json
[
    {
        "switchToFrame": "#someiFrame"
    },
    {
        "switchToFrame": "default"
    }
]
```

##### Goto
*Web v1.0*   
Navigates to the provided URL  
**You must include the protocol (i.e. "http://", "https://", etc.)**

| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *goto*            | Yes         | *{string}*     | The URL to navigate to |

**Examples:**
```json
[
    {
        "goto": "http://www.google.com"
    }
]
```

##### Reload
*Web v1.0*   
Reloads (refreshes) the current page.

| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *reload*          | Yes         | *{\*}*         | The value given to this key does not matter |

**Examples:**
```json
[
    {
        "reload": true
    }
]
```

##### Forward
*Web v1.0*   
Navigates to browser one page forward

| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *forward*         | Yes         | *{\*}*         | The value given to this key does not matter |

**Examples:**
```json
[
    {
        "forward": true
    }
]
```

##### Back
*Mobile v2.0, Web v1.0*   
Press the hardware back button for mobile (Android only), or press the browser back button (Web only)
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *back*            | Yes         | *{\*}*         | The given value to the *back* key does not matter. |

**Examples:**
```json
[
    {
        "back": true
    }
]
```

##### Execute
*Mobile v2.0, Web 1.0*   
Executes an action file
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *execute*         | Yes         | *{string}*     | The name (without the *.json* extension) of the action to execute relative to this action's module |
| *module*          | No          | *{string=}*    | If specified, will execute the action from the given module |
| *repeat*          | No          | *{integer=}*   | The number of times to repeat this execution |
| *over*            | No          | *{string=}*    | A selector. If specified, will execute the action over the specified set of elements, setting the value of the *temp* test variable to the *nth* element in the set |

**Examples:**
```json
[
    {
        "execute": "login"
    },
    {
        "execute": "someaction",
        "repeat": 5
    },
    {
        "execute": "logout"
    }
]
```

##### Validate
*Mobile v2.0, Web 1.0*   
Validates a screen, menu, or popup
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *validate*        | Yes         | *{string}*     | The name of the screen, menu, or popup to validate |
| *type*            | No          | *{string}*     | "screen", "menu", or "popup". If unspecified, this defaults to screen |

**Examples:**
```json
[
    {
        "validate": "myscreen"
    },
    {
        "validate": "mymenu",
        "type": "menu"
    },
    {
        "validate": "mypopup",
        "type": "popup"
    }
]
```

##### Store
*Mobile v2.0, Web 1.0*   
Stores a test variable
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *store*           | Yes         | *{\*}*         | The value to store in the variable |
| *as*              | Yes         | *{string}*     | The name of the variable to store |
| *capture*         | No          | *{string=}*    | Captures a regular expression from the *store* key and stores the result of the capture as an array |
| *index*           | No          | *{integer=}*   | If *capture* is specified, setting this key will only store the given index of the capture results |

**Examples:**
```json
[
    {
        "store": "Hello world",
        "as": "helloWorld"
    },
    {
        "store": [1, 2, 3, 4, 5],
        "as": "someArray"
    },
    {
        "store": {
            "first": "john",
            "last": "doe"
        },
        "as": "name"
    }
]
```

##### Save
*Mobile v2.0, Web 1.0*   
Saves an element as a variable. This will throw an error (fail the test) if multiple elements are matched. To save multiple elements use *saveAll*
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *save*            | Yes         | *{string}*     | A selector. The element to save |
| *as*              | Yes         | *{string}*     | The name of the variable to save the elements as |
| *property*        | No          | *{string=}*    | If specified, will only save the given property of the element and not the whole element |
| *capture*         | No          | *{string=}*    | If the *property* key is specified, will match the property against the given regular expression |
| *index*           | No          | *{string=}*    | If the *capture* key is specified, only the given index of the capture will be saved |


**Examples:**
```json
[
    {
        "save": ".userName",
        "as": "usernameElement"
    },
    {
        "save": ".userName",
        "as": "usernameElementPosition",
        "property": "rect.origin"
    },
    {
        "debug": "The username element is at position: ${usernameElement.rect.origin.x}, ${usernameElement.rect.origin.y}"
    }
    {
        "debug": "The username element is at position: ${usernameElementPosition.x}, ${usernameElementPosition.y}"
    }
]
```

##### Save All
*Mobile v2.0, Web 1.0*   
Saves a set of elements as a variable. This will throw an error (fail the test) if no elements are matched.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *saveAll*         | Yes         | *{string}*     | A selector. The elements to save |
| *as*              | Yes         | *{string}*     | The name of the variable to save the elements as |
| *property*        | No          | *{string=}*    | If specified, will only save the given property of the elements and not the whole elements |
| *capture*         | No          | *{string=}*    | If the *property* key is specified, will match the property against the given regular expression |
| *index*           | No          | *{string=}*    | If the *capture* key is specified, only the given index of the capture will be saved |


**Examples:**
```json
[
    {
        "save": ".userName",
        "as": "usernameElement"
    },
    {
        "save": ".userName",
        "as": "usernameElementPosition",
        "property": "rect.origin"
    },
    {
        "debug": "The username element is at position: ${usernameElement.rect.origin.x}, ${usernameElement.rect.origin.y}"
    }
    {
        "debug": "The username element is at position: ${usernameElementPosition.x}, ${usernameElementPosition.y}"
    }
]
```

##### Wait
*Mobile v2.0, Web 1.0*   
Wait (sleep) for the specified number of seconds
| Keys              | Required    | Type           | Description |
| :---------------- | :---------: | :------------- | :----------- |
| *wait*            | Yes         | *{integer}*    | The number of seconds to wait |

**Examples:**
```json
[
    {
        "wait": 5
    }
]
```

##### Wait For
*Mobile v2.0, Web 1.0*   
Wait for the given element to appear before continuing
| Keys              | Required    | Type           | Description |
| :---------------- | :---------: | :------------- | :----------- |
| *waitFor*         | Yes         | *{string}*     | Selector. The element to wait for |

**Examples:**
```json
[
    {
        "waitFor": ".someButton"
    },
    {
        "click": ".someButton"
    }
]
```

##### Hide App For
*Mobile v2.0*   
Puts the app in the background for the given number of seconds.   
**Note, this was broken in Instruments for SDK's 9.0+**   
| Keys              | Required    | Type           | Description |
| :---------------- | :---------: | :------------- | :----------- |
| *hideAppFor*      | Yes         | *{integer}*    | The number of seconds to hide the app for |

**Examples:**
```json
[
    {
        "hideAppFor": 300
    }
]
```

##### Refresh
*Mobile v2.0, Web v1.0*   
Explicitly refresh the DOM
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *refresh*         | Yes         | *{\*}*         | The given value to the *refresh* key does not matter. |

**Examples:**
```json
[
    {
        "refresh": true
    }
]
```

##### Debug
*Mobile v2.0, Web v1.0*   
Print a message to the screen during testing
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *debug*           | Yes         | *{\*}*         | Prints the provided value |

**Examples:**
```json
[
    {
        "debug": "The value of the variable name is: ${_name_}"
    }
]
```

##### Retries
*Mobile v2.0, Web v1.0*   
Set the number of *element retries* during testing. See the [configuration](#configuration) section below for more information about *element retries*
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *retries*         | Yes         | *{number}*     | The number of retries |

**Examples:**
```json
[
    {
        "retries": 100
    },
    {
        "tap": "@{Some process that may take a lot of time before the element comes into view}"
    },
    {
        "retries": 3
    }
]
```

##### OS Exec
*Mobile v2.0, Web v1.0*   
Execute a shell command. If the command fails, testing will fail.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *osexec*          | Yes         | *{string}*     | The command to execute |
| *saveResultsAs*   | No          | *{string}*     | The name of a variable to store the results in. The stored variable will be an object with two keys, *stdout* and *stderr* |

**Examples:**   
This example writes a file called *helloworld.txt* to the user's home directory, reads the file and stores the results in the variable *helloworld*
```json
[
    {
        "osexec": "echo -e Hello world! > ~/helloworld.txt"
    },
    {
        "osexec": "echo -e $(cat ~/helloworld.txt)",
        "saveResultsAs": "helloworld"
    },
    {
        "debug": "${helloworld.stdout}"
    }
]
```

##### Rotate Device
*Mobile v2.0*   
Rotate the device to the given orientation. *Note, this only works if your app allows for rotation.*
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *rotateDevice*    | Yes         | *{string}*     | One of the following strings: "portrait", "portrait upsidedown", "landscape", "landscape left", or "landscape right" |

**Examples:**   
*Note "landscape" and "landscape left" are synonymous*   
```json
[
    {
        "rotateDevice": "portrait"
    },
    {
        "rotateDevice": "portrait upsidedown"
    },
    {
        "rotateDevice": "landscape"
    },
    {
        "rotateDevice": "landscape left"
    },
    {
        "rotateDevice": "landscape right"
    }
]
```

##### Get Config
*Mobile v2.0, Web v1.0*   
Get a Soda configuration setting and save it as a test variable. If the setting doesn't exist "(null)" will be stored in the variable.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *getConfig*       | Yes         | *{string}*     | The name of the configuration setting |
| *as*              | Yes         | *{string}*     | The name of the variable to store the value in |

**Examples:**
```json
[
    {
        "getConfig": "pid",
        "as": "processId"
    },
    {
        "getConfig": "root",
        "as": "pathToSoda"
    }
]
```

##### Set Config
*Mobile v2.0, Web v1.0*   
Get a Soda configuration setting and save it as a test variable. If the variable doesn't exist "(null)" will be stored in the variable.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *setConfig*       | Yes         | *{string}*     | The name of the configuration setting to set |
| *to*              | Yes         | *{string}*     | The value to set the configuration setting to |

**Examples:**
```json
[
    {
        "setConfig": "maxBuffer",
        "to": 512000000
    },
    {
        "setConfig": "console.log.debug",
        "to": false
    }
]
```

#### Screens/Menus/Popups
These are the action objects available in screen, menu, and popup files.

##### Exists
*Mobile v2.0, Web v1.0*   
Assert that the given selector matches elements, or does not.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *assert*          | Yes         | *{string}*     | A selector. The elements to assert existence |
| *exists*          | Yes         | *{boolean}*    | If true, asserts that the elements exist, if false asserts that they do not exist. |

**Examples:**
```json
[
    {
        "assert": ".usernameTextfield",
        "exists": true
    },
    {
        "assert": ".nonExistentElement",
        "exists": false
    }
]
```

##### Matches
*Mobile v2.0, Web v1.0*   
Assert that the elements matching the given selector match the provided regular expression. By default *matches* will test against an
element's *value* property. Use the *property* key to test against a different property.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *assert*          | Yes         | *{string}*     | A selector. The elements to assert. |
| *matches*         | Yes         | *{string}*     | A regular expression. The regular expression to test the elements against |
| *property*        | No          | *{string=}*    | The property to test against. If unspecified, this will default to the elements' *value* property |

**Examples:**
```json
[
    {
        "assert": ".amount",
        "matches": "\\$(\\d{1,3}\\,)*\\d{1,3}\\.\\d{2}"
    },
    {
        "assert": ".username",
        "matches": "[a-zA-Z0-9_]+",
        "property": "label"
    }
]
```

##### Is
*Mobile v2.0, Web v1.0*   
Assert that the elements matching the given selector match the provided string exactly. By default *is* will test against an
element's *value* property. Use the *property* key to test against a different property.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *assert*          | Yes         | *{string}*     | A selector. The elements to assert. |
| *is*              | Yes         | *{string}*     | The string to test elements against. |
| *property*        | No          | *{string=}*    | The property to test against. If unspecified, this will default to the elements' *value* property |

**Examples:**
```json
[
    {
        "assert": ".amount",
        "is": "$1,047.23"
    },
    {
        "assert": ".username",
        "matches": "catman1337",
        "property": "label"
    }
]
```

##### Has Count
*Mobile v2.0, Web v1.0*   
Assert that the given selector returns the provided number of elements.
| Keys              | Required    | Type           | Description  |
| :---------------- | :---------: | :------------- | :----------- |
| *assert*          | Yes         | *{string}*     | A selector. The elements to assert. |
| *hasCount*        | Yes         | *{integer}*    | The expected number of elements to get back from the tree using the above selector. |

**Examples:**
```json
[
    {
        "assert": ".amount",
        "hasCount": 20
    },
    {
        "assert": ".usernameTextfield",
        "hasCount": 1
    }
]
```
### The Comment Key
For any action/assertion object you can add a *comment* key.

The comment entered into the *comment* key will be displayed on the screen in light gray when the action/assertion object is encountered during testing. Plus, it's a good practice, so that those reading your tests will know what you test is doing.

**Example:**
```json
[
    {
        "comment": "Sets the username textfield",
        "set": ".userName",
        "to": "myusername"
    },
    {
        "comment": "Sets the password textfield",
        "set": ".userName",
        "to": "myusername"
    },
    {
        "comment": "Taps the login button",
        "tap": ".loginButton"
    }
]
```
### Test Flow
A tests is a collection of reusable actions. Actions define the *flow* of a test, that is what to do and in what order.
In the example below, the test *google_twice* uses the action *google* multiple times.

**Action: google.json**   
Navigates to Google, searches for *cat memes* and closes the browser

```json
{
    "meta": {
        "name": "google",
        "id": "google",
        "description": "Navigates to Google and searches for 'cat memes'",
        "syntax": {
            "name": "web",
            "version": "1.0"
        }
    },
    "actions": [
        {
            "goto": "http://www.google.com"
        },
        {
            "set": "*[type='input'][attributes.type='text']",
            "to": "cat memes"
        },
        {
            "wait": 1
        },
        {
            "click": "^btnK[type='input'][attributes.type='submit'][nth='last']"
        },
        {
            "close": true
        }
    ]
}
```

**Test: google_twice.json**   
Executes the action *google* multiple times

```json
{
    "meta": {
        "name": "google_twice",
        "id": "google_twice",
        "description": "Searches for 'cat memes' on Google twice",
        "syntax": {
            "name": "web",
            "version": "1.0"
        }
    },
    "actions": [
        {
            "execute": "google"
        },
        {
            "execute": "google"
        }
    ]
}
```

### Screens, Menus, and Popups
In addition to flow, another integral part of automated testing is validating that a screen or page has certain elements and that those elements have certain values.   

This is where screen, menus, and popups come into play.   
These files contain *assertions* and are meant to represent their respective *real* screens, menus, and popups.
**Actions *validate* screens, menus, and popups.**

Technically, screen, menu, and popup files are all the same — their structure is identical. However, conceptually grouping each into its own directory makes keeping up with tests easier.

**Example:** *example_screen.json*   
The following example screen validates that the "login" screen has a logo, a banner that says "Welcome! This is my really cool app!", a username textfield, a password textfield, and a submit button.

```json
{
    "meta": {
        "name": "login",
        "description": "The login screen",
        "syntax": {
            "name": "mobile",
            "version": "2.0"
        }
    },
    "screen": {
        "components": [
            {
                "assert": ".logo",
                "exists": true
            },
            {
                "assert": ".login_banner",
                "is": "Welcome! This is my really cool app!"
            },
            {
                "assert": ".login_textfield",
                "is": "Enter username"
            },
            {
                "assert": ".login_password",
                "is": "Enter password"
            },
            {
                "assert": ".submit_button",
                "is": "Log In"
            }
        ]
    }
}
```

**An action validating a screen**
```json
{
    "meta": {
        "name": "validate_login",
        "id": "validate_login",
        "description": "Validates the login screen",
        "syntax": {
            "name": "web",
            "version": "1.0"
        }
    },
    "actions": [
        {
            "validate": "login"
        }
    ]
}
```

### Variables
Soda tests use variables to make actions more flexible. Variables can be set using the *store/as* action. The following example sets the variable *variable* to the value *value*.
```json
{
    "store": "value",
    "as": "variable"
}
```

This example sets the variable *username* to *catman1337*
```json
{
    "store": "catman1337",
    "as": "username"
}
```

Variables don't have to be strings, they can be any valid JSON object. For example, an array.
```json
{
    "store": [
        1,
        2,
        3
    ],
    "as": "my_array"
}
```

To access these values in tests/actions/screen/menus/popups use the *${variable_name}* syntax.
For example, the following sets a textfield with the id *username-field* to the value in the variable *username*:
```json
{
    "set": "#username-field",
    "to": "${username}"
}
```

You can also use variables within variables. The following would set the element with the id *element* to "Hello World"
```json
[
    {
        "store": "iable",
        "as": "wordending"
    },
    {
        "store": "Hello World!",
        "as": "variable"
    }
    {
        "set": "#element",
        "to" :"${var${wordending}}"
    }
]
```

The following will click the element with the id *hello-world*
```json
[
    {
        "store": "hello",
        "as": "h"
    },
    {
        "store": "-world",
        "as": "w"
    },
    {
        "click": "#${h}${w}"
    }
]
```

#### Using Variables to Make Actions Reusable
Remember that tests are a collection of actions, and actions define flow. Actions can also include other actions using the *execute* command.

Knowing this we can make actions reusable by incorporating variables. Let's take the earlier example of the test that Googled *cat memes* twice. Suppose on the second search, we wanted to search for *dog memes* instead. We could just change *cat memes* in the action to a variable, then define our variables in the test.

**Action: google.json**   
Navigates to Google, searches for whatever is in the value of the variable *to_search* and closes the browser

```json
{
    "meta": {
        "name": "google",
        "id": "google",
        "description": "Navigates to Google and searches for the value of the variable ${to_search}",
        "syntax": {
            "name": "web",
            "version": "1.0"
        }
    },
    "actions": [
        {
            "goto": "http://www.google.com"
        },
        {
            "set": "*[type='input'][attributes.type='text']",
            "to": "${to_search}"
        },
        {
            "wait": 1
        },
        {
            "click": "^btnK[type='input'][attributes.type='submit'][nth='last']"
        },
        {
            "close": true
        }
    ]
}
```

**Test: google_twice.json**   
Executes the action *google* multiple times. The first time searching for *cat memes* and then searching for *dog memes* the second time.

```json
{
    "meta": {
        "name": "google_twice",
        "id": "google_twice",
        "description": "Searches for 'cat memes', then 'dog memes' on Google",
        "syntax": {
            "name": "web",
            "version": "1.0"
        }
    },
    "actions": [
        {
            "store": "cat memes",
            "as": "to_search"
        },
        {
            "execute": "google"
        },
        {
            "store": "dog memes",
            "as": "to_search"
        },
        {
            "execute": "google"
        }
    ]
}
```

### Special and Predefined Test Variables
Soda provides some useful and predefined variables for use in writing tests.

| Variable Name                            | Contents |
| ---------------------------------------- | -------- |
| *\_user\_*                               | Use this variable for user names, and it will appear in test results as the test "user" |
| *\_env\_*                                | The environment variable used to start Soda with |
| *\_asset\_info\_*                        | An object with information about the current asset, such as name, suite name, module name, path, id, and description. *${_asset_info_.name}* will return the current asset's name, for example. |
| *\_test\_info\_*                         | An object with information about the currently running test, such as name, suite name, module name, path, id, and description. *${_test_info_.name}* will return the current test's name, for example. |
| *\_module\_info\_*                       | An object with information about the currently running module, such as its name and suite name. *${_module_info_.name}* will return the current test's name, for example. |
| *\_suite\_info\_*                        | The currently running suite's name as a *string* |
| *\_currentYear\_*                        | The current year in the YYYY format |
| *\_currentMonth\_*                       | In the spelled out format (e.g. "January", "February", etc.)
| *\_[x]\_days_from_now\_*                 | *x* days from now in the format YYYY-MM-DD, where *x* is an integer from 1 to 364 |
| *\_[x]\_days_from_now_not_weekend\_*     | Same as above, but will advance forward if it lands on a weekend day |
| *\_[x]\_months_from_now\_*               | *x* months from now in the format YYYY-MM-DD, where *x* is an integer from 1 to 11 |
| *\_[x]\_months_from_now_not_weekend\_*   | Same as above, but will advance forward if it lands on a weekend day |
| *\_[x]\_years_from_now\_*                | *x* years from now in the format YYYY-MM-DD, where *x* is an integer from 1 to 6 |
| *\_[x]\_years_from_now_not_weekend\_*    | Same as above, but will advance forward if it lands on a weekend day |
| *\_now\_*                                | A getter object with the following properties: *unix*, *hhmmss*, and *yyyymmdd*. Examples: *${_now_.unix}* will return an integer timestamp, *${now.hhmmss}* will return the time in a string clock format |


### Best Practices
When writing tests, we've established some best practices so you can avoid our tribulations.   

- **You should create easy to use, descriptive *identifiers* in your application.**
    - *.login_button* is easier to follow than *.element154*
- **Avoid using ids (#) and values (@) to select elements**
    - For mobile frameworks, ids are generated by Soda in the format *#[element type]:[element count for this type]*
    - If an element is added or removed from the DOM, the selector is likely to change
    - If you use (@) values, if you change the value of an element in your app, you'll have to modify your test to reflect the updated value.
    - By using (.) name and (^) label values and good accessibility identifiers you assure that little test modification is needed when your app changes
- **You should use variables as much as possible to make your JSON files as reusable as possible.**
- **Think of tests as classes, and actions as methods.**
- **Tests should only contain a list of *execute* action objects**
    - Leave the *flow* operations to actions, even if it's just a single action... because later it could be more!
- **Tests should being at your app's entry point and end at your apps entry point, for every test.**
    - It's faster to log out of an app and go back to the entry point than it is to restart the framework.
- **Put all your test variables in a single action.**
    - For example, if I have a test called *foo*, I would create an action in the *actions* folder named *foovars*
      Then *execute* the *foovars* action within the *foo* test.
    - This makes altering test variables easy.
- **Keep your tests neat, and use a JSON linter.**
    - If a test/action/screen/menu/popup contains invalid JSON, Soda will ignore it.
- **Indent using 4 spaces, rather than 2.**
    - Makes tests easier to read
- **When there's an issue use *refresh***
    - Sometimes it's necessary to explicitly refresh the DOM.
    - If you're finding to hard to find an element or click/tap it, try adding the [refresh](#refresh) action object.


## Selector Mapping
---
Using the *suite.json* and *module.json* files you can create selector mappings on a per-platform basis. Selector mappings can be though of like constants. These objects, which are added to *suite.json* and *module.json* files, map to a selector for each platform specified.

**Selector Mappings make reading your tests easy for the technically challenged!**

To add selector mappings, open the *suite.json* or *module.json* file you would like to add mappings to and add a *map* key to the root object. The *map* key should be an object containing objects that map a platform to a selector.

**For example, your suite or module file might look like this...**
```json
{
    "name": "My Suite/Module",
    "description": "A really good description",
    "map": {
        "LOGIN_USERNAME_TEXTFIELD": {
            "ipad": ".userNameTextField",
            "iphone": ".userNameTextField",
            "android": ".login_usernamefield",
            "androidtab": ".login_usernamefield",
            "web": "#username"
        },
        "LOGIN_PASSWORD_TEXTFIELD": {
            "ipad": ".passwordTextField",
            "iphone": ".passwordTextField",
            "android": ".login_passwordfield",
            "androidtab": ".login_passwordfield",
            "web": "#password"
        },
        "LOGIN_SUBMIT_BUTTON": {
            "ipad": ".loginButton",
            "iphone": ".loginButton",
            "android": ".btn_login_login",
            "androidtab": ".btn_auth_submit",
            "web": "#{login-button}"
        }
    }
}
```

**Then in your action files you can use these mappings by providing the map key:**
```json
[
    {
        "set": "LOGIN_USERNAME_TEXTFIELD",
        "to": "myusername"
    },
    {
        "set": "LOGIN_PASSWORD_TEXTFIELD",
        "to": "mypassword"
    },
    {
        "tap": "LOGIN_SUBMIT_BUTTON"
    }
]
```

If a mapping is not found, it will be treated as a regular selector, and the test will fail (as LOGIN_SUBMIT_BUTTON is an invalid selector).

**Mappings also cut back on the amount of JSON required to write generic tests.**   
For example, the example above is much more terse than the following:

```json
[
    {
        "platforms": ["iphone", "ipad"],
        "set": ".userNameTextField",
        "to": "myusername"
    },
    {
        "platforms": ["android", "androidtab"],
        "set": ".login_usernamefield",
        "to": "myusername"
    },
    {
        "platforms": "web",
        "set": "#username",
        "to": "myusername"
    },
    {
        "platforms": ["iphone", "ipad"],
        "set": ".passwordTextField",
        "to": "mypassword"
    },
    {
        "platforms": ["android", "androidtab"],
        "set": ".login_passwordfield",
        "to": "mypassword"
    },
    {
        "platforms": "web",
        "set": "#password",
        "to": "mypassword"
    },
    {
        "platforms": ["iphone", "ipad"],
        "tap": ".loginButton"
    },
    {
        "platforms": "android",
        "tap": ".btn_login_login"
    },
    {
        "platforms": "androidtab",
        "tap": ".btn_auth_submit"
    },
    {
        "platforms": "web",
        "click": "#{login-button}"
    }
]
```

**Mappings, like all other assets, are scoped first by local module, then by suite, then globally**
Therefore, if you define the same mapping in both the suite and module files, the asset will prefer the module version over the suite version. *Note, you can also add mappings to the global directory's suite.json file. Global mappings will be least preferred*   

An asset from one module cannot use mappings from another. Likewise, an asset from one suite cannot use a mapping from another suite.

## Soda CLI
---
### About the CLI/REPL
```bash
$ soda -f [framework_name] -t [path_to_my_scripts] [device_name] [app_path]
```

The Soda CLI (a.k.a. The Soda REPL) is a JavaScript evaluation program that evaluates commands. You can think of it like the Node.js REPL, with the Soda environment pre-loaded. The Soda REPL (read, evaluate, print, loop) takes "commands". Anything prefixed with a colon (:) is assumed a command. Anything entered into the Soda REPL without a colon will be evaluated as regular JavaScript.

In the REPL all exposed properties and methods of the Soda class can be accessed by the variable *soda*.   
There's a few Soda methods that are of use to note.

**A brief list of Soda methods exposed to the REPL:**
| Method                | Arguments                                                                         | Definition |
| ----------------------| --------------------------------------------------------------------------------- | ---------- |
| *soda.vars.get*       | *{string}* variable                                                               | Gets a test variable |
| *soda.vars.save*      | *{string}* name, *{string}* value, *{boolean=}* persistent, *{boolean=}* global   | Sets a testing variable with name value either in current scope, persistent between tests or globally persistent |
| *soda.config.get*     | *{string}* name                                                                   | Get a configuration variable's value |
| *soda.config.set*     | *{string}* name, {\*} value                                                       | Set a configuration variable |
| *soda.config.delete*  | *{string}* name                                                                   | Delete a configuration variable |
| *soda.assert*         |                                                                                   | Contains an assertion library, the methods of *soda.assert* can be called individually |
| *soda.framework*      |                                                                                   | Manages the loading/starting/stopping of frameworks |
| *soda.runnner*        |                                                                                   | Runs test/actions/suites/modules |

**Example: Setting a configuration variable**
```bash
# Set the variable `myvariable` to the value 5
> soda.config.set("myvariable", 5);
```

**Example: Getting a test variable**
```bash
# Get the environment test variable Soda was started with
> soda.vars.get("_env_");
# The results...
:= "DEV"
```

In addition to calling the above methods, Soda is loaded with shortcuts (commands) you can enter into the REPL.
**See the table below for a list of Soda REPL commands**

### Starting Frameworks
If you provided the *soda* command with the -f (framework) flag the Soda CLI will automatically attempt to start the framework you specified with the arguments provided via the command line.

However, if you didn't, you can start a framework from the Soda CLI

**Starting a framework from the Soda REPL**
```bash
# Load the framework
> soda.framework.load("instruments");

# Startup the Instruments framework specifying the iPad Air simulator, runtime 9.2
> soda.framework.start("iPad Air 9.2", "path/to/my/app/binary");

# The simulator will be re-booted, your app loaded, and the Soda REPL will return control once complete.
```
Once a framework is loaded you can interact with it.   
**Getting the DOM using the CLI**
```bash
# Use the :e command to get all elements currently on the screen (see the table below)
> :e
:= "Variable `e` set to the elements object"

# Prints every element in the DOM tree to the stdout
> e.all();

# Prints all elements with the property name equal to "userName" to the stdout
> e.withName("userName");

# Prints all elements with the property name equal to "userName" to the stdout
> e.withSelector(".userName");

# Prints all elements with the property id equal to "textfield:0" to the stdout
> e.withId("textfield:0");

# Prints all elements with the property id equal to "textfield:0" to the stdout
> e.withSelector("#textfield:0");

# For a complete list of the available methods of e, just enter "e"
> e
```
**Stop a running framework**
```bash
# Using the soda instance
> soda.framework.stop();

# or using the handy command `fstop`
> :fstop
```
### Running Tests
You can either run test in the Soda CLI using the *soda.runner* object, or using commands. It's much easier to run them using commands—as we've provided the callbacks for you. So that's what we've documented.

```bash
# ***Run a test***
# The following will run the specified test using the default suite and module.
> :r test [test_name]
# Or you can specify the module
> :r test [test_name] [module_name]
# Or you can specify all arguments
> :r test [test_name] [module_name] [suite_name]

# If you want to set the default suite and module use the following commands
> :suite [suite_name]
> :module [module_name]

# Then you can just run the test using these default values
> :r test [test_name]

# ***Run a module***
# The following will run the specified module using the default suite.
> :r module [module_name]
# Or you can specify the suite as well
> :r module [module_name] [suite_name]

# ***Run a suite***
> :r suite [suite_name]
```

**If the test/action you've entered is resolved, the test will start running.**

#### Test Mode vs. REPL Mode
When a test is running, you'll notice that you can no longer enter commands into the Soda CLI and that the REPL prompt has dissapeared. You are now in *test mode*. To escape from test mode and re-enter CLI mode while a test is running press the "x" key. To re-enter test mode, if you've escaped it, enter the *:tm* command.

#### Test Mode Keys
**While in test mode, there are a few important keys that, when pressed, will perform some important functions.**

| Key   | Function | Available |
| :---: | :------- | :-------- |
| *x*   | Escapes from test-mode and re-enters REPL mode. None of the following keypresses will work while in REPL mode. **Use the :tm command to re-enter test mode** | *Anytime* |
| *d*   | Prints all variables with their current values | *Anytime* |
| *i*   | Prints information about the current action | *Anytime* |
| *y*   | Prints the current test trace (up to the current action in the test) to the screen | *Anytime* |
| *t*   | Saves a trace file (up to the current action in the test) to your user home folder | *Anytime* |
| *s*   | Stops the test/suite/module evaluation | If the test is not paused, or has not failed |
| *p*   | Pauses test evaluation | If the test has not been stopped, or has not failed |
| *r*   | Resumes a paused test | If the test is paused |
| *n*   | Skips to the next test evaluation | If the test is paused |
| *k*   | Skips over the current evaluation | If the test is paused, or has failed |
| *e*, *c* | Ends the current test run and continues with failure | If the test has failed |
| *l*   | Repeats the last test evaluation | If the test is paused, or has failed |

### Platforms
When you startup the Soda CLI you're given the option to provide the *-x* (platform) option. *We suggest you use it.* While this setting doesn't affect which device you start on a framework, it *does* affect which tests are run and the actions that are selected within them!   
Soda provides a method for overwriting tests/action/screens/menus/popups that are generic, for ones that are platform specific. You can make an action platform specific by appending the platform name to the filename. For example, if I have an action *login.json* which works for iPad and iPhone, but not for Android, I can write a *login.android.json* action which will be used over the *login.json* action when my *platform* is set to *android*.   

Additionally, Soda allows users to enter platform specific action objects.

**A platform specific action object**
```json
[
    {
        "platforms": "android",
        "set": ".userName",
        "to": "This will only run on android"
    },
    {
        "platforms": ["iphone", "ipad"],
        "set": ".userName",
        "to": "This will run on both iPhone and iPad"
    }
]
```
**So it's important that you set this command line flag, or set the platform before invoke a test**
```bash
# Set the platform using the Soda CLI
> soda.config.set("platform", "android");
# Or the much easier command
> :x android
# Or the other command alias
> :platform android
# Or use the platform specific commands
> :aphone
> :atab
> :iphone
> :ipad
> :web
```

### Soda CLI Commands
To enter a command into the Soda CLI, prefix it with a colon (:).

| Command(s)                    | Arguments                                                                         | Description |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------- |
| *ve, Ve, vestart*             |                                                                                   | Starts the visual editor |
| *ves, Ves, stopve*            |                                                                                   | Stops the visual editor |
| *trace*                       | *{string}* filename                                                               | Starts or stops a new trace, which provides a trace of all element/device interactions from the time the trace was started. The trace will continue logging, until :trace is entered again. On the second call, an optional *path* parameter is available to specify where to save the trace file relative to your home folder. If no path is specified, it defaults to the user home directory. |
| *sodas*                       |                                                                                   | Lists all Soda instances attached to this REPL instance |
| *soda*                        | *{integer}* soda                                                                  | Switches REPL stdin control to the Soda instance tied to the integer *soda* |
| *h, hierarchy*                |                                                                                   | Prints the assets hierarchy of the currently loaded assets |
| *cd*                          | *{string}* path                                                                   | Changes the current working directory to *path* |
| *pwd*                         |                                                                                   | Prints the current working directory |
| *die*                         |                                                                                   | Destructively termination of the Soda CLI process and all Soda objects |
| *q, quit*                     |                                                                                   | Gracefully closes Soda, expect this to take little time |
| *web*                         |                                                                                   | Sets the *platform* setting to *web* |
| *ipad*                        |                                                                                   | Sets the *platform* setting to *iPad* |
| *iphone*                      |                                                                                   | Sets the *platform* setting to *iPhone* |
| *aphone*                      |                                                                                   | Sets the *platform* setting to *Android* |
| *atab*                        |                                                                                   | Sets the *platform* setting to *Android Tablet* |
| *env*                         | *{string}* environment                                                            | Switches environment for pipeline testing |
| *s, S, suite*                 | *{string}* suite_name                                                             | Sets the current testing suite |
| *m, M, module*                | *{string}* module_name                                                            | Sets the current testing module |
| *r, R, run*                   | *{string}* suite, *{string}* module, *{string}* test                              | Runs a test using the current suite and module. |
| *r, R, run*                   | *{string}* suite, *{string}* module, *{string}* action                            | Runs an action using the current suite. |
| *r, R, run*                   | *{string}* suite, *{string}* module | Runs a module using the current suite.      |
| *r, R, run*                   | *{string}* suite                                                                  | Runs a suite. |
| *yd, Yd, dump*                | *{string}* variable_name *{string}* dump_path                                     | Dump any variable’s contents to file in JSON format. Outputs the file name and path. Second (optional) argument is the path to dump the contents to. If no path is specified it defaults to the user home directory. |
| *v, var*                      | *{string}* name, *{string}* value, *{boolean=}* persistent, *{boolean=}* global   | Sets a testing variable with name value either in current scope, persistent between tests or globally persistent |
| *l, L, load*                  | *{string=}* asset_path                                                            | Loads assets at the given path or, without a parameter, reload the current assets |
| *x, X, platform*              | *{string}* platform                                                               | Sets the current testing platform |
| *q, quit, exit*               |                                                                                   | If a framework has been loaded, this will gracefully close it. If not the *quit* command above will be executed. |
| *fload, load framework*       | *{string}* framework_name                                                         | "Loads" the given framework. This doesn't start it, but requires the module in an initializes it. |
| *fstart, start framework*     | {\*} arg_1, {\*} arg_2... {\*} arg_n                                              | Starts the currently loaded framework; all arguments are specific to the framework. |
| *frestart, restart framework* |                                                                                   | Restarts the last framework that was started first by gracefully stopping it, then starting it with the previously used arguments |
| *p, P, print*                 |                                                                                   | Retrieves the current DOM from the framework and dumps it to the screen |
| *e, E, elements*              |                                                                                   | Retrieves the current tree and then stores it to the variable *e* |

The command prefix can be changed by setting the value of *REPL.COMMAND_DELIMITER*

### Starting the Visual Editor from the CLI
**The Soda Visual Editor can be started directly from the CLI.**   
The Visual Editor will be started on the user's local machine at http://localhost:1337.

If multiple Soda instances are running, the port will be incremented by one until a free port is found (e.g. 1337, 1338, 1339, etc.).

Within the Soda REPL, enter:
```bash
> :ve
```
...to start the Visual Editor, and:
```bash
> :ves
```
...to stop the Visual Editor.

## Soda Visual Editor
---
The Soda Visual Editor is a complete testing IDE. From it you can start and stop frameworks, run tests, view the DOM, review element properties, and create, edit, delete actions, tests, modules, and suites.

**The Soda Visual Editor makes running, writing, and managing tests easy—even for those who aren't very dev-centric.**

The Visual Editor runs on your local machine, starting at http://localhost:1337.

**You can start up multiple Visual Editors (and multiple frameworks) by entering the *sodaeditor* command multiple times.** For each new visual editor, the port will be increased by one (1337, 1338, 1339, etc., etc.).

*Note: Apple limits you to one Simulator instance at a time, so starting a second Instruments framework will kill the first! However, Automator allows you to startup as many emulators as you'd like. However, there's been some odd behavior when starting up two emulators of the same type, so it's best to use two different emulators.*

### Starting the Visual Editor
Execute the command:
```bash
$ sodaeditor
```

Both the [Soda CLI](#soda-cli) and a webpage will open. Everything you can do in the [Soda CLI](#soda-cli), can be done in the Visual Editor.

**Now, you'll need to start up a framework to start working with the editor**   
This webpage will open to the Visual Editor "launch" page. This page allows you to start frameworks and save startup settings as "favorites".

#### Starting a Framework Using the Visual Editor
Click the icon which represents the frame work you wish to start (i.e. the Apple logo for Instruments, the Android logo for Automator, or the globe for Selenium).

Fill out the form to and press "start" to start the Visual Editor. You'll see the startup output on the launch page, and once the framework has fully loaded, the editor will open and you'll see a screen shot of the current screen.

**Each framework's startup form is different, so use the tables below for reference.**

**Automator**
| Field                 | Required | Description |
| :-------------------- | :------- | :---------- |
| Platform              | Yes      | The platform that corresponds to the device you're starting (see the [Platforms](#platforms) section for more information) |
| AVD Emulator Name     | Yes      | The emulator you wish to start, this will be pre-populated with the available devices |
| Path to Project       | Yes      | The path to your Soda project |
| Environment           | Yes      | An optional testing environment variable |
| Path to APK           | Yes      | The path to your APK file |
| Proxy URL             | No       | An optional proxy URL setting, if you're behind a proxy |
| Proxy Username        | No       | Your proxy username, if applicable |
| Proxy Password        | No       | Your proxy password, if applicable. This will be encrypted using 256-bit AES encryption |

**Instruments**
| Field                 | Required | Description |
| :-------------------- | :------- | :---------- |
| Platform              | Yes      | The platform that corresponds to the device you're starting (see the [Platforms](#platforms) section for more information) |
| Simulator             | Yes      | The Simulator or physical device you wise to start. This will be pre-populated with the available devices on your machine |
| Path to Project       | Yes      | The path to your Soda project |
| Environment           | Yes      | An optional testing environment variable |
| Path to Build         | Yes      | The path to your app binary |
| Proxy URL             | No       | An optional proxy URL setting, if you're behind a proxy |
| Proxy Username        | No       | Your proxy username, if applicable |
| Proxy Password        | No       | Your proxy password, if applicable. This will be encrypted using 256-bit AES encryption |

**Selenium**
| Field                 | Required | Description |
| :-------------------- | :------- | :---------- |
| Browser               | Yes      | The browser you wish to use. This will be pre-populated with the supported browsers installed on your machine |
| Path to Project       | Yes      | The path to your Soda project |
| Environment           | Yes      | An optional testing environment variable |
| Starting URL          | Yes      | The initial page to open the browser to, "about:blank" is a good choice |
| Proxy URL             | No       | An optional proxy URL setting, if you're behind a proxy |
| Proxy Username        | No       | Your proxy username, if applicable |
| Proxy Password        | No       | Your proxy password, if applicable. This will be encrypted using 256-bit AES encryption |

**Puppeteer**
| Field                 | Required | Description |
| :-------------------- | :------- | :---------- |
| Browser               | Yes      | The browser you wish to use, it works with chrome. |
| Path to Project       | Yes      | The path to your Soda project |
| Environment           | Yes      | An optional testing environment variable |
| Starting URL          | Yes      | The initial page to open the browser to, "about:blank" is a good choice |
| Proxy URL             | No       | An optional proxy URL setting, if you're behind a proxy |
| Proxy Username        | No       | Your proxy username, if applicable |
| Proxy Password        | No       | Your proxy password, if applicable. This will be encrypted using 256-bit AES encryption |

**Press the "start" button to start the framework, or the "save" button to save this set of settings as a favorite.**

If startup fails, the reason will be displayed and you can press the "back" arrow to edit your startup form and try again.

### Using Favorites
After filling out a framework form, you can click the "save" button to save the settings as a favorite. Favorites will show up under the "star" menu and will appear every time you start the Visual Editor. When you save a favorite, it will show up at the top of the list with the name of the framework and the date you saved it.

**Click the "star" icon to view your all of your favorites.**

The favorites are stored on your local hard drive at: *~/sodaFavorites.json*. This is a simple JSON file, so if you prefer, you can directly add or edit favorites from this file.

**Clicking on a favorite will start the framework with the settings saved in the favorite**

**To remove a favorite, click the "x" icon at the top right of the favorite**

### Using the Screen
Once a framework has loaded, you'll see a screenshot of the current screen, the [Screen Elements](#screen-elements) toolbox on the left and the [Element Inspector](#element-inspector) toolbox on the right.

When you hover over an element, you'll notice that the properties in the [Element Inspector](#element-inspector) toolbox changes at the right. This is a *very* useful feature for writing tests, as for every element on the screen you can clearly see each of its properties.

**To "sticky" the element (so that the [Element Inspector](#element-inspector) toolbox doesn't change as you move your cursor), simply click the element.** You'll notice a little "pin" icon highlight purple on the [Screen Elements](#screen-elements) toolbox to your left. You'll also notice that the DOM tree (on the left) will expand to show the element you've clicked.

**To "unsticky" the element, click the element again or any other element on the screen.**

**If an element is in the way (on top of) of another element, you can "stash" it by right-clicking the element.** You can stash as many elements as there are on the screen. This is useful if you'd like to see the properties of an element underneath another element.

**To return all the elements to the screen, press *Control-R***

**Finally, you'll notice some buttons at the top right of the editor in the menu bar.**
| Position (Left to Right) | Shortcut  | Button Description | Function |
| :----------------------: | :-------  | :----------------- | :------- |
| 1                        | Control-R | recycle icon       | Refreshes the DOM and screenshot. It will update the [Screen Elements](#screen-elements) toolbox. |
| 2                        | *None*    | flow chart icon    | Force updates your project files. It will update the [Project Manager](#project-manager) toolbox. Use this if you've added a test/action/screen/menu/popup and it doesn't show up int the [Project Manager](#project-manager) toolbox. |
| 3                        | Control-I | picture icon       | Download the current screenshot |
| 4                        | Control-D | download icon      | Download the current DOM in JSON format |
| 5                        | *None*    | power icon         | Gracefully shutsdown the current framework and returns to the launch screen |
| 6                        | *None*    | plug icon          | Kills the Soda process |

### Anatomy of the Editor
Within the editor are various "toolboxes" which perform different functions. There's two toolbox containers: left and right. To switch between toolboxes, click the icons on the very left and right sides of the screens. Additionally, if you hover over an icon, it will display the toolbox's name.

**The following sections describe each toolbox and its function.**
#### Element Inspector
The "Element Inspector" toolbox is on the right toolbox container, and is recognized by the "compass" icon. This toolbox is used to view an element's properties.

As you hover over elements, this toolbox will display that element's properties. If the property is a string, it will be displayed as a string. If it's an array it will list the elements of the array beneathit (tabbed in) with the index of the item on the left. If the property is an object, it will display the members of the object (tabbed in) with their key on the left.

#### Screen Elements
The "Screen Elements" or "Tree" toolbox is on the left toolbox, and is recognized by the "tree" icon. This toolbox is used to view the current DOM hierarchy and lists all the available elements.

The toolbox lists all the elements in the current DOM in a parent/child format. Notice, when you hover over an element is is highlighted on the screenshot.

Initially, each root element in the toolbox is closed, to expand the element and see its child elements, click the "right caret" icon on the element. To un-expand the element (to hide its children), click the "up caret" icon.

**There's two textfields on the Screen Elements toolbox:**

**The first is for querying selectors**   
Use this textfield to enter selectors to match against the current tree. After entering a selector, all elements that match the selector will be expanded into view and will be marked with a purple "check" icon. This is a useful feature for writing tests to see which elements a selector might match.

**The second is for searching elements**   
Entering data into this textfield will search the elements and their properties for matches. Elements that match the search parameter will be highlighted gray.

#### Console
The "Console" toolbox is on the right toolbox container, and is recognized by the "terminal" icon. This toolbox is used to enter commands and simulate the [Soda CLI](#soda-cli)

**To execute a command, enter the command in the textfield and press the "Execute" button.**   
The output will be displayed in the toolbox below the textfield.

**You can execute any command in the Console toolbox, that's available in the Soda CLI.**

#### Builder
The "Builder" toolbox is on the right toolbox container, and is recognized by the "block" icon. This toolbox is used to build and install your app. This toolbox will be hidden if you're running the Selenium framework, as it's not applicable.

##### To build your app...
**For Instruments**
- Enter the name of the app (with the *.app* extension) in the "Application Name" textfield.
- Enter the path to your XCode workspace/project in the "Path to Workspace" field.
- Enter the output build folder in the "Build path" textfield.
- Press the "Build Project" button

**For Automator**   
The build option for Automator doesn't actually build your app, but un-installs and re-installs the provided APK package to the specified emulator.

- Enter the emulator name in the "Emulator name" textfield
- Enter the path to the APK file in the "Path to apk" textfield
- Press the "Build Project" button

**Note some of these fields may be pre-filled based on the settings you chose to start the Visual Editor with.**

Build output will be displayed below the form and if the build succeeds, you'll be given to option to reset the device and restart the Visual Editor with the new build.

#### Running Tests
The "Test Runner" toolbox is on the left toolbox container, and is recognized by the "refresh" icon. This toolbox is used to run tests, modules, and suites.

**Here there's four buttons at the top:**
- **All** - Lists all tests, modules, and suites.
- **Suites** - Lists suites only
- **Modules** - Lists modules only
- **Tests** - Lists tests only

Clicking on a test/module/suite will start the test/module/suite and you will automatically be switched to the [Test Monitor](#test-monitor) toolbox.

You'll also notice that within the *Modules* menu, you have the option to filter module by their parent suite and within the *Tests* menu, you have the option to filter tests by both suite and module.

#### Test Monitor
The "Test Monitor" toolbox is on the left toolbox container, and is recognized by the "eye" icon. This toolbox is used to control tests that are currently running and view their progress.

**This toolbox is disabled, until a test has been started**

At the top of this toolbox, you'll see the "control panel" with the test status, and various buttons to control the test. The various buttons and their function are listed below:

| Button       | Description | Available When... |
| :----------- | :---------- | :---------------- |
| last         | Repeats the last test action | The test is paused, or has failed |
| stop         | Stops the test/module/suite  | When the test is running |
| pause        | Pauses the currently running test | When the test is running |
| play         | Resumes a paused test | When the test is paused |
| next         | Skips to the next test action | When the test is paused or has failed |
| fast-forward | Skips the current action | When the test has failed |
| eject        | Continues and ends the test | When the test has failed |

Beneath the "control panel" there's the "Test Info" section which describes the state of the test and provides useful information.

Then there's the "Test Information" section which lists the running test's name, id, module, suite, and description.

The "Current Action" section lists the action object/assertion object that is currently being evaluated.

The "Last Action" section lists the last action object/assertion object that was evaluated (and which has passed).

The final section "Test Output" displays the passes/failure messages from the test in the following format:   
*Should [action]*

**For example:** *Should tap \`.someElement\`*   
If the action/assertion passed, it will be green. If it failed it will be red.

Once a test has completed, you'll see the results in both the output (as you would in the [Soda CLI](#soda-cli)), and in the "control panel" section.
#### Results History
The "Results History" toolbox is on the left toolbox container, and is recognized by the "pie chart" icon. This toolbox is used to view past test/suite/module run results.

Test results history is available for the current Visual Editor session. To view archived history, open the */path/to/your/project/test_results* directory and browser the JSON files located there.

**The view test results history click the "pie chart" icon**   
For each test/suite/module that was run the toolbox will display:

- The test filename*
- The test id*
- The test/suite/module test name
- The test description*
- The test's suite*
- The test's module*
- The platform the test was run under
- The type (e.g. "Test", "Action", "Suite", "Module")
- The user, if the *_user_* variable was used*
- The result ("Pass", "Fail", or "Stopped")
- A boolean result (i.e. *true* for pass, *false* for fail)
- The time the test/suite/module was started
- The duration of the test/suite/module
- The reason(s) the test/suite/module failed
- A link to a variable JSON file containing all tests variables at the end of the test*
- A trace file*

*\* Only displayed for test results, not for suite and module results.*


#### Test Editor
The "Test Editor" toolbox is on the left toolbox container, and is recognized by the "pencil" icon. This toolbox is used to write and edit tests, actions, screens, menus and popups.

The Test Editor has four "lists" for asset editing:
- **Test** - For editing test assets
- **Action** - For editing action assets
- **Screen** - For editing screen assets
- **Menu** - For editing menu assets
- **Popup** - For editing popup assets

You can think of these lists as "scratch pads." You can add action/assertion objects to each list, remove them, and finally save each list as its respective asset type. When you load assets using the [Project Manager](#project-manager) toolbox, they will be loaded into these lists.

**There's a few sections for each list:**
- **Context**
    - Defines the suite the asset will be saved in when saving
    - Defines the module the asset will be saved in when saving
- **Metadata**
    - Set the asset's name, id, description, syntax name, and syntax version using the provided textfields.
- **Actions**
    - This section lists all the action/asset objects that have been added to this asset. These objects are added to the list by dragging an action/assertion object from the [Actions Toolbox](#actions-toolbox) onto this section or onto a screen element.

Beside the *Actions* section is a button labeled "[Asset Type] Menu" (e.g. "Test Menu", "Screen Menu", etc.). This menu provides "things you can do" with your list.

**Actions Menu Options**
| Option                          | Action |
| :------------------------------ | :----- |
| Save List                       | Save the current list as its respective asset type. |
| Download List                   | Downloads the list in JSON format for its respective asset type |
| Clear List                      | Clears the asset type list |
| Execute List                    | Runs the list as a test, action, screen, menu, or popup |
| Generate *[Screen/Menu/Popup]*  | For screens, menus, and popups only. Automatically "generate" the screen based on the current DOM |

**Saving Actions**   
See the section below on [saving assets](#saving-assets)

#### Actions Toolbox
The "Actions" toolbox is on the right toolbox container, and is recognized by the "lightning bolt" icon. This toolbox lists all the available action/assertion objects and is used in conjunction with the [Test Editor](#test-editor) toolbox.

This toolbox is used to add action/asset objects to the [Test Editor](#test-editor) toolbox.

The Actions Toolbox has five "lists" for adding asset/assertion objects:
- **Test** - For adding test action objects
- **Action** - For adding action, action objects
- **Screen** - For adding screen assertion objects
- **Menu** - For adding menu assertion objects
- **Popup** - For adding popup assertion objects
- **Widgets** - For adding widgets to tests or actions, see [Widgets](#widgets)

**Adding Action/Assertion Objects to Your Tests**   
Switch to this toolbox, and on the left, switch to the [Test Editor](#test-editor) toolbox.


You can add actions to your tests by dragging them into the [Test Editor](#test-editor) toolbox's "[Type] Actions" box (e.g. "Test Actions", "Screen Actions", etc.).

**You'll notice you can only drag test actions to the test toolbox, and menus to the menu toolbox, etc.**   
If the cursor has a circle with a slash through it, check that both the Test Editor toolbox and Actions Toolbox are on the same menu.

Once you've dragged an action object into the asset actions box, the action object will appear in the list. From here, you can edit both the action object's keys and values by clicking on either the key or value and entering the new value.

Additionally, you can click the action object's "play" icon to execute the single action object, you can click the "+" icon to add a new key/value pair to the action object, and you can click the "x" icon to remove the action object.

Once you've added some action objects, you can re-arrange their order by clicking on the action object and dragging it above or below other action objects.

**You can drag action objects onto elements on the screenshot**   
This is the preferred way to add action objects!

**Drag an action onto a screen element.** If the action requires a selector, a context menu will drop down and ask you for a selector. Within this context menu, you can test your selector to see if they match this element. Also, a list of pre-defined selectors will be provided for you. Click the "Selectors" button to select a selector. If this selector matches the element uniquely, it will display: "The selector matches this element uniquely" below the selector entry textfield. Otherwise, it will display: "The selector matches this element and x other(s)". *Keep in mind, some action objects require that a selector returns a single element, or it will fail your test*

After you've chosen a selector, you'll notice that the action is added to the action list box on the left. By dragging the action onto a screen element rather than directly into the action's box, the list will bind the element to the action and will highlight the element on the screenshot if you hover over the action object.

Beside the action object's *primary key*, you'll see an icon. This icon will either be a green checkmark, yellow dash, or red x. The green icon indicates that this selector matches the element uniquely, a yellow icon means it matches this element and others, are red icon indicates that it doesn't match the element at all. As you change the value of this "selector" field, this icon will update based on the results.

##### Saving Assets
After you've finished writing your tests/actions/screens/menus/popups, click the "[Asset Type] Menu" button, then "Save List".

A context menu will dropdown and ask you if the asset is generic or for this platform only. Select your preferred option, then enter the asset name in the textfield below. If an asset of that type with the same name already exists, you'll be warned, and subsequently prompted for verification. **Do not enter the *.json* file extension in the filename field**

Click the "Save" or "Cancel" button.

If you decided to save the asset, a context modal will dropdown and inform you whether or not the file was saved successfully. *The file should now be available for editing/running/deletion in the Project Manager*. If the file was a test, it should be available to run from within the [Test Runner](#running-tests-1) toolbox.

##### Widgets
Widgets are a special kind of action object that are **defined within your action files**. They are "re-usable" puzzle-pieces that perform a single function within your app (at least you should design them that way). Widgets, unlike action objects, are defined in your actions. *Note, widgets are for actions and tests only*

For example, if I have an action that logs in a user, I might want to specify it as a *widget*. Why not just execute the *login* action, you ask? Because widgets let you define and describe the variables needed to run an action, making writing tests as simple as plugging in puzzle-pieces.

**You should "widgetize" repetitive actions in your project.**

When a user adds a widget, the user is prompted for the variables needed (as defined in your asset).

**Within you test you can define a widget by adding the *widget* key to the *meta* section of your asset file.**

**An example widget for logging in**
```json
{
    "meta": {
        "name": "login",
        "description": "Logs in a user",
        "syntax": {
            "name": "mobile",
            "version": "2.0"
        },
        "widget": {
            "name": "Log In A User",
            "description": "This widget logs in a user with the credentials defined in the variables ${_user_} and ${password}",
            "group": "User Authentication",
            "vars": [
                "_user_",
                "password"
            ],
            "varDefaults": [
                "johndoe",
                "johndoespassword"
            ],
            "varDescriptions": [
                "The username to use to log in",
                "The password used to log in"
            ]
        }
    },
    "actions": [
        {
            "set": ".usernameField",
            "to": "${_user_}"
        },
        {
            "set": ".passwordField",
            "to": "${password}"
        },
        {
            "tap": "login"
        }
    ]
}
```

**A widget object takes the following keys:**
| Key              | Required | Type                | Description |
| :--------------- | :------- | :----------         | :---------- |
| name             | Yes      | {string}            | The name of the widget (will be displayed like this in the Visual Editor, you can use HTML) |
| description      | Yes      | {string}            | A description of the widget (will be displayed like this in the Visual Editor, you can use HTML) |
| group            | No       | {string=}           | The sub-heading to list the widget under (Will default to "Widget" if unspecified) |
| vars             | No       | {Array<String>=}    | An array of variable names needed by this widget |
| varDefaults      | No       | {Array<String>=}    | The default values to each variable |
| varDescriptions  | No       | {Array<String>=}    | An array of variable descriptions, parallel the *vars* array |

By defining re-useable actions using widgets, making a test might be as simple as dragging and dropping widgets into the action box. You'll notice (after you've created some widgets), that when you drag it into the actions box, you'll be prompted for the variables you've specified. After you've entered values for these variables, you'll notice that the Visual Editor will add multiple actions: a *set* action for every variable, and the *executeWidget* action to execute the action file. *Note: executeWidget and execute function exactly the same*

#### Project Manager
The "Project Manager" toolbox is on the left toolbox container, and is recognized by the "flow chart" icon. This toolbox is used create/delete suites, modules, test, actions, screens, menus, and popups.

This toolbox lists all of your project files in their folder hierarchy. Suites are at the root, then modules beneath them, followed by the asset type folder (tests/actions/screens/menu/popups) then the actual assets.

**Note, only generic and assets for this platform will display in the Visual Editor Project Manager**   
So, if I've started the Visual Editor using "ipad", then the following assets will be available:
- *some_asset.json*
- *some_asset.ipad.json*

...and the following will not:   
- *some_asset.iphone.json*
- *some_asset.android.json*
- *some_asset.androidtab.json*
- *some_asset.web.json*

To expand an item, click the "folder" icon. To un-expand it, click the "opened folder" icon.

**You can search for a file by entering the filename in the "Search..." texfield.**

**Adding new suites**   
To add a new suite to the project, click the "+ Add New Suite" button. You'll be prompted for the name of the suite. Enter the suite's name and press the "Add Suite" button on the context menu. The suite will be added, and it's *suite.json* file and all it's sub-folders (*common* directory) will be automatically added for you. *Note: this may take a few moments*

**Adding new modules**   
To add a new module to the project, click the "+" icon next to the suite you want to create it under. You'll be prompted for the name of the module. Enter the new module's name and press the "Add Module" button on the context menu. The module will be created, and it's *module.json* file and all it's sub-folders (*tests*, *actions*, *screens*, *menus*, and *popups* directories) will be automatically created for you. *Note: this may take a few moments*

**Creating New Tests/Actions/Screens/Menus/Popups**   
To add a new testing asset to the project, expand the module you wish to create the asset in, then click the "+" icon next to the asset type you wish to create.

The context menu will drop down and verify that you wish to create a new asset of that type. Additionally, it will warn you that creating a new asset will clear the [Test Editor](#test-editor) list for that type. Select either the "No, I need to save stuff first..." or the "Okay" button.

You can now begin editing your new test in the [Test Editor](#test-editor).

**Removing Assets**  
Beside the asset name click the "x" icon. You will be prompted for verification.

**Editing currently existing assets**   
Navigate the asset (*suite > module > asset type > asset*) in the Project Manager. Click the "pencil" icon. If the current asset type list isn't empty in the [Test Editor](#test-editor), you'll be warned that the list isn't empty and loading this asset will overwrite your current list. Click either the "Cancel" or "Yes, load asset" button.

**Running Individual Assets**
You can run any asset (test, screen, menu, popup, or action), individually. To do this, navigate the asset (*suite > module > asset type > asset*) in the Project Manager. Click the "play" button.

The asset will then run. **Note, running assets this way results in failure if the asset uses variables from other assets that haven't been set, or it you're not on the correct screen when running them.** The results of the run will drop down in the context menu after the run is complete.

**If you're running tests you should use the [Test Runner](#running-tests-1) toolbox**


#### Settings
The "Settings" toolbox is on the right toolbox container, and is recognized by the "cog" icon. This toolbox is used to view and change Soda configuration settings.

**To change a Soda configuration setting, click on the setting value and enter the new value.**   
Then press tab or unfocus the element.

If the setting reverts back to its old value, then it means there was a problem changing the setting or that you've entered an invalid value.

#### Visual Editor Keyboard Shortcuts
| Shortcut      | Description |
| :------------ | :---------- |
| Control-Space | Refreshes the screenshot and DOM |
| Control-R     | Add stashed elements back to the screen |
| Control-O     | Toggle Outline Mode |
| Control-I     | Download Screenshot |
| Control-D     | Download DOM Tree |
| Control-G     | Generate Screen for current action list (if available) |
| Control-L     | Download current action list |
| Control-S     | Save current action list |
| Control-C     | Clear the current list |
| Control-K     | Execute/Validate the current list |
| Control-F     | Action file picker |
| Control-X     | Displays the Console Toolbox |
| Control-P     | Displays the Element Inspector Toolbox |
| Control-A     | Displays the Actions Toolbox |
| Control-E     | Displays the Test Editor Toolbox |
| Control-T     | Displays the Screen Elements Toolbox |
| Control-U     | Displays the Test Runner Toolbox |
| Control-J     | Displays the Project Manager Toolbox |
| Control-Z     | Displays the Settings Toolbox |
| Control-?     | Displays the Help Toolbox |

## Trace Files
---
**Soda produces *trace* files at the end of each test.**   
These files can be sent to devs to get them to the exact point of failure in a script.

At the end of every test a trace file is saved to:   
*path/to/my/soda/project/test_results/traces/*

**To run a trace file, execute:**   
```bash
$ sodatrace [path_to_trace]
```

Or you can run a trace file from Node.
```js
var Trace = require("soda/Trace"),
    Soda  = require("soda"),
    fs    = require("fs");

fs.readFile("my/trace/file.json", function (err, contents) {
    if(err) throw err;

    new Soda().init(function (err, soda) {
        Trace.run(contents.toString("utf-8"), soda, function (err) {
            // Trace run complete
        });
    });
});
```

The trace file will start the framework used when the test was run with the options that were used to start it. Then it will re-trace all interactions that occurred during testing.

## Using Soda as a Node Module
---
You can use Soda as a Node.js module within your Node apps.

```js
/**
 * Starts two Soda instances on two different frameworks and runs tests in parallel.
 */
var Soda    = require("Soda"),
    options = { /* See the configuration section below */ };

var sodaiPad    = new Soda(options),
    sodaAndroid = new Soda(options);

// Start the Instruments framework and run a test
sodaiPad.init(function (err, soda) {
    if(err) throw err;

    soda.framework
        .load("instruments")
        .start("iPad Air 9.2", "path/to/my/binary", function (err) {
            if(err) throw err;
            soda.runner.run(
                {
                    suite  : "my_suite",
                    module : "my_module",
                    test   : "my_test",
                },
                function (err, resultObject, testObject, message) {
                    console.log("Testing complete, results:", resultObject.result);
                    // Testing done, stop the framework
                    soda.framework.stop(function (err) {
                        console.log("Instruments framework stopped!")
                    });
                }
            );
        });
});

// Start the Automator framework and run a module
sodaAndroid.init(function (err, soda) {
    if(err) throw err;

    soda.framework
        .load("automator")
        .start("iPad Air 9.2", "path/to/my/apk", function (err) {
            if(err) throw err;
            soda.runner.run(
                {
                    suite  : "my_suite",
                    module : "my_module"
                },
                function (err, resultObject, testObject, message) {
                    console.log("Testing complete, results:", resultObject.result);
                    // Testing done, stop the framework
                    soda.framework.stop(function (err) {
                        console.log("Automator framework stopped!")
                    });
                }
            );
        });
});
```

**When a test/suite/module results callback is invoked, it is passed the following arguments:**

- *{Error|null}* **err** - An error if one exists
- *{Object}* **resultObject** - An object with the following keys:
    - *{string}* **filename** - The filename of the test/action/module/suite that was run
    - *{string}* **id** - The test/action id
    - *{string}* **name** - The test/action/module/suite name
    - *{string}* **description** - The test/action description
    - *{string}* **suite** - The suite the test/action belongs to
    - *{string}* **module** - The module the test/action belongs to
    - *{string}* **platform** - The platform the test/action/suite/module was run under
    - *{string}* **type** - "Suite", "Module", "Test", or "Action"
    - *{string}* **user** - The user the test was run with. See the *variables* section in regard to the *${_user_}* variable
    - *{string}* **result** - "Pass", "Fail", or "Stopped"
    - *{boolean}* **resultBool** - True if the action passed, false otherwise
    - *{string}* **start** - A date/time string with the test start time using *Date.toLocaleString()*
    - *{string}* **failureId** - The filename of the failure screenshot if the test failed, "N/A" otherwise
    - *{string|Array}* **reason** - A failure reason, will be a string if it's a test, but an Array if it's a module or suite.
    - *{Array}* **variables** - The test variables and their values at the time the test ended
- *{Object=}* **testObject** - A *Test* object
    - This is only passed into test and action results callbacks, not module or suites.
    - See *SodaCore/lib/Classes/Test.js*
- *{String|Array}* **message**
    - A failure message, if the test failed. If this is a suite or module, this will be an array (multiple tests can fail).

### Hooking into Soda
You can hook into any Soda event using the *Soda.use* method.

```js
/**
 * Starts a test on the iPad. Example of using "use" to hook into events
 */
var Soda    = require("Soda"),
    options = { /* See the configuration section below */ };

var soda = new Soda(options);

soda.use(function (soda) {
    // Hook into test results
    soda.runner.on("test results", function (err, resultObject, testObject, message) {
        console.log("A test has ended!");
    }

    // Hook into variables
    soda.vars.on("save", function (name, value) {
        console.log("The variable", name, "was saved")!
    });

    // Hook into configuration
    soda.config.on("get", function (name) {
        console.log("Something got the configuration setting", name);
    });

    // For a complete list of Soda events see the API Documentation...
});

soda.init(function (err, soda) {
    if(err) throw err;

    // Start the Instruments framework and run a test
    soda.framework
        .load("instruments")
        .start("iPad Air 9.2", "path/to/my/binary", function (err) {
            soda.runner.run(
                {
                    suite  : "my_suite",
                    module : "my_module",
                    test   : "my_test"
                },
                function (err, resultObject, testObject, message) {
                    console.log("Testing complete, results:", resultObject.result);
                    // Testing done, stop the framework
                    soda.framework.stop(function (err) {
                        console.log("Instruments framework stopped!")
                    });
                }
            )
        });
});
```

### Awesome Soda Sub-Modules
As a by-product of the Soda Testing Framework, a few completely exportable modules have been built within Soda.

| Sub-Module                     | Require Syntax             | Purpose   |
| :----------------------------- | :------------------------- | :-------- |
| [Soda REPL](#soda-repl)        | *require("soda/SodaREPL")*             | A CLI application that accepts commands and stores history between sessions |
| [Soda Console](#soda-console)  | *require("soda/SodaCommon/Console")*   | A *better* console logging module |
| [Soda Assert](#soda-assert)    | *require("soda/SodaCommon/Assert")*    | An assertion library |

#### Soda REPL
The *Soda REPL* sub-module powers the Soda CLI. Natively, the REPL stores the REPL history at *~/sodareplhistory* between sessions. So the next time you start the REPL up, the history will remain.

The REPL accepts "commands", or anything prefixed with a colon (:). You can add commands to the REPL using the *REPL.addCommand* method.

**Additionally, the REPL will shutdown when the user enters the :q command or presses ^C twice**

**Simple REPL Useage**
```js
var repl = require("soda/SodaREPL");

repl.addCommand(
    "print-hello-world", // Definition, used as the key, this should be unique
    "hw|hello",          // Trigger on these strings, separated by pipes
    function (code, args) {
        console.log("Hello World!");
        // Do something important   
    }
);

repl.addCommand("print-bar", "f|foo", function (code, args) {
    console.log("Bar!");
    // Do something important
});

repl.init(consoleOptions);
```

```bash
> :hw
# Hello World!
> :hello
# Hello World!
```

```bash
> :f
# Bar!
> :foo
# Bar!
> :unknown
# Command not found!
```
**Stopping the REPL**
```js
repl.kill(function () {
    console.log("REPL Stopped!");
});
```

**You can change the command delimiter by setting *REPL.COMMAND_DELIMITER***

**The SodaREPL Emits The Following Events**
| Event             | Arguments       | Description     |
| :---------------- | :-------------- | :-------------- |
| got sigint        | {Function} next | When the user has pressed ^C twice, gives you a change to execute any final code before the REPL quits |
| command not found | {string} line   | When a user has entered an unrecognized command, *line* is the line entered into the CLI |
| line              | {string} line   | When the user enters a line, (anything that's not a command) |
| close             | {REPL} repl     | When the REPL is shutting down |
| closed            | {REPL} repl     | Post shutdown |

#### Soda Console
The *Soda Console* sub-module is a console logging module with optional colored output, and can enable/disabled different console output via settings.

```js
var Console = require("soda/SodaCommon/Console"),
    console = new Console({ /* Console Options */ });

    // Setting options
    console.setOption("log.debug", true);
    console.setOption("log.warning", false);

    // Logging types that can be enabled and disabled...
    console.log("This is a regular stdout log, by default it is blue");
    console.message("This is a regular stdout log, it is also blue");

    console.debug("This is a *debug* stdout log, by default it is gray");
    console.verbose("This is a *verbose* message, by default it is blue");
    console.comment("This is a *comment* message, by default it is fuschia");

    console.warn("This is a stdout warning, by default it is orange");
    console.error("This is a stdout error, by default it is red");

    console.pass("This is another type of log, by default it is green");
    console.fail("This is another type of log, by default it is red");
    console.start("This is another type of log, by default it is green");

    // Output will be converted to "pretty-print" JSON, if non-circular
    console.log({ hello: "world"});
    /*
        Output:
        {
            "hello": "world"
        }

     */
```

**The SodaConsole Emits The Following Events**
| Event             | Arguments                          | Description     |
| :---------------- | :--------------------------------- | :-------------- |
| pre log           | {Array} messages, {string} logType | Before anything is output to the screen and before color formatting |
| log               | {Array} messages, {Array} htmlMessages, {string} logType | Before anything is output to the screen, but after formatting. *htmlMessages* is an array of "<span>" elements with the classes "stdout" and the log type |
| post log          | {Array} message                    | After the output is printed to the screen |


#### Soda Assert
The *Soda Assert* module is an assertion library used by Soda.

```js
var assert = require("soda/SodaCommon/Assert");
assert.equal(value, value2, "Message to throw if not equal");
assert.notEqual(value, value2, "Message to throw if not un-equal");
assert.strictEqual(value, value2, "Message to throw if not strictly equal");
assert.strictNotEqual(value, value2, "Message to throw if not strictly un-equal");

assert.true(value, "Message to throw if not true");
assert.false(value, "Message to throw if not false");
assert.empty(value, "Message to throw if not 'empty'");
assert.defined(value, "Message to throw if not 'defined'");
```

**Available Assertions**
| Assertion        | Description |
| :--------------- | :---------- |
| true             | Asserts that the given value equates *strictly* to true |
| false            | Asserts that the given value equates *strictly* to false |
| empty            | Asserts that the given value is *null*, *undefined*, and *false*, 0 is not considered "empty" |
| defined          | Asserts that the given value is **not** *null*, *undefined*, and *false*, 0 is okay |
| equal            | Asserts that the two provided values are lazily equal (i.e. 5 == "5") |
| notEqual         | Asserts that the two provided values are not lazily equal (i.e. 5 != "7") |
| strictEqual      | Asserts that the two provided values are strictly equal (i.e. 5 === 5) |
| strictNotEqual   | Asserts that the two provided values are not strictly equal (i.e. 5 !== "5") |

## Using Databases
---
**You can configure Soda to work with your favorite database rather than the file system.**   
While we don't write the code to start, stop, or query your database, we do provide a template easily to hook into our asset resolution system.

To use a database with Soda, use the *Soda.useDb* method and make sure your test path matches the following regular expression: */^@database(:\w+)?$/*

**It's also worth mentioning that you can use the following for non-database asset solutions as well. For example, if you wanted to read your assets from a remote machine.** For that reason, we've alised *Soda.useDb* to *Soda.noFs* and allowed test paths to match */^@nofs(:\w+)?$/* as well. However, both methods perform the exact same function.

```js
var Soda = require("soda"),
    soda = new Soda({ testPath: "@database" });

// You should define database behavior before calling Soda.init
var sodadb = soda.useDb("@database");

// Do some connection stuff
var mysql      = require('mysql'),
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'user',
      password : 'pass',
      database : 'my_db'
    });

// Get all the suites
sodadb.on("list suites", function ( send) {
    // Query your db...
    connection.query("SELECT * FROM SUITES", function (err, results) {
        // Return the results
        send(err, results);
    });
});

// Get all the modules
sodadb.on("list modules", function (send) {
    // Query your db...
    query("SELECT * FROM MODULES", function (err, results) {
        // Return the results
        send(err, results);
    });
});

// Get all the asset definitions
sodadb.on("list assets", function (send) {
    // Query your db...
    query("SELECT * FROM ASSETS", function (err, results) {
        // Return the results
        send(err, results);
    });
});

// Get all the modules for the suite `suite`
sodadb.on("get contents for", function (asset, send) {
    // Query your db...
    query(
        "SELECT * FROM ASSET_CONTENTS WHERE module='" + asset.module + "' AND suite='" + asset.suite + "' AND platform='" + asset.module + "' AND name='" + asset.name + "'",
        function (err, results) {
            // Return the results
            send(err, results);
        }
    );
});

soda.init(function (err, soda) {
    if(err) throw err;
    // Run some tests...

    // When all done, free up the memory for this db driver
    sodadb.close();
});
```

Essentially, *Soda.useDb* returns an instance of *EventEmitter* tied to the given *@database...* string. By allowing you to specify multiple database references, you can swap between asset collections.

**For example:**
```js
var Soda = require("soda"),
    soda = new Soda({ testPath: "@database:a" });

// You should define database behavior before calling Soda.init
var sodaDbA = soda.useDb("@database:a"),
    sodaDbB = soda.useDb("@database:b");

// Do some connection stuff...
var mysql       = require('mysql'),
    connectionA = mysql.createConnection({
      host     : 'localhost',
      user     : 'user',
      password : 'pass',
      database : 'databaseA'
    }),
    connectionB = mysql.createConnection({
      host     : 'localhost',
      user     : 'user',
      password : 'pass',
      database : 'databaseB'
    });

// Add subscriptions for this db driver reference
sodaDbA.on("list suites", getSuitesA);
sodaDbA.on("list modules", getModulesA);
sodaDbA.on("list assets", listAssetsA);
sodaDbA.on("get contents for", getAssetContentsA);

// Add subscriptions for this db driver reference
sodaDbB.on("list suites", getSuitesB);
sodaDbB.on("list modules", getModulesB);
sodaDbB.on("list assets", listAssetsB);
sodaDbB.on("get contents for", getAssetContentsB);

soda.init(function (err, soda) {
    if(err) throw err;
    soda.framework
        .load("selenium")
        .start("chrome", "about:blank", function (err, done) {
            if(err) throw err;

            // Run tests from database A
            soda.runner.run(
                {
                    suite  : "my_suite",
                    module : "my_module",
                    test   : "my_test"
                },
                function (err, results, message, stopped) {

                    // Test from database A Complete...
                    // Load the new assets
                    soda.assets.load("@database:b", function (err) {
                        if(err) throw err;

                        // Run a test from database B
                        soda.runner.run(
                            {
                                suite  : "my_suite",
                                module : "my_module",
                                test   : "my_test"
                            },
                            function (err, results, message, stopped) {
                                if(err) throw err;

                                // Test from database B complete...
                                // Close the db driver refs
                                sodaDbA.close();
                                sodaDbB.close();

                                // Shutdown
                                soda.framework.stop(function () {
                                    console.log("All done!");
                                })
                            }
                        );
                    });
                }
            );
        });
})
```

**There are 9 database events that you must handle**

| Event              | Optional | Args Given                                       | Expected Args Provided to *Send/Done* Callback | Description |
| :----------------- | :------: | :----------------------------------------------- | :--------------------------------------------- | :---------- |
| *list suites*      | No       | *{Function}* send                                | *{Error\|null}* An error, if one occured,<br>*{Array<Object>}* An array of suite objects. See **suite objects** below | Gets a list of all suite in the database collection |
| *list modules*     | No       | *{Function}* send                                | *{Error\|null}* An error, if one occured,<br>*{Array<Object>}* An array of module objects. See **module objects** below | Gets a list of all modules in the database collection |
| *list assets*      | No       | *{Function}* send                                | *{Error\|null}* An error, if one occured,<br>*{Array<Object>}* An array of asset objects. See **asset objects** below | Gets a list of all modules in the database |
| *get contents for* | No       | *{Object}* options, *{Function}* send            | *{Error\|null}* An error, if one occured,<br>*{Object}* The asset's contents | Get's a specific actions's contents |
| *make suite*       | No       | *{Object}* data, *{Function}* done               | *{Error\|null}* An error, if one occured | Creates a suite  |
| *make module*      | No       | *{Object}* data, *{Function}* done               | *{Error\|null}* An error, if one occured | Creates a module |
| *make asset*       | No       | *{Object}* data, *{Function}* done               | *{Error\|null}* An error, if one occured | Creates an asset |
| *save results*     | Yes      | *{Object}* results                               | *n/a*                                  | Used to store test results |
| *save trace*       | Yes      | *{Object}* trace                                 | *n/a*                                  | Used to store trace files |


**Suite Objects**
Suite objects provided to *list suites* events should have the following format:
```js
{
    name        : "suite_name",          // Required,
    description : "suite_description",   // Optional
    map         : {}                     // Optional. See the section about selector mapping for more info on mappings.
}
```

**Module Objects**
Module objects provided to *list modules* events should have the following format:
```js
{
    name        : "module_name",          // Required.
    suite       : "modules_suite",        // Required.
    description : "module_description",   // Optional
    map         : {}                      // Optional. See the section about selector mapping for more info on mappings.
}
```

**Asset Objects**
Module objects provided to *list modules* events should have the following format:
```js
{
    name        : "asset_name",           // Required.
    type        : "asset_type",           // Required, should be "test", "menu", "screen", "popup", or "action"
    suite       : "assets_suite",         // Required. The asset's suite name
    module      : "assets_module",        // Required. The asset's module name
    platform    : "assets_platform",      // Highly Suggested. (i.e. "ipad", "iphone", "generic", etc.)
    id          : "asset_id",             // Highly Suggested. The asset id.
    description : "asset_description",    // Optional.
    syntax      : {                       // The asset's syntax information
        name    : "asset_syntax_name",
        version : "asset_syntax_version"
    }
}
```

**We recommend the following Database Structure:**

- **A table for *suites***
    - The suites table should define suites with fields like the **suite objects** above.
- **A table for *modules***
    - The modules table should define modules with fields like the **module objects** above.
    - The suite field should be foreign keys to records in the suite table.
- **A table for *asset definitions***
    - The asset table should define the asset with fields like the **asset objects** above.
    - The suite and module fields should be foreign keys to records in the suite and module tables.
- **A table for *asset contents***
    - The asset contents table should store asset contents with a foreign key to the owning asset.
    - You can store the contents in any format/charset you want, but when you pass the contents to the *send* function, it must be either a *JSON.parse* acceptable string or a valid JS object.
##  Configuration
---
**Important files, with configuration settings and such.**

- *Soda/SodaCommon/Config.js*   
These are the default configuration settings for the entire Soda testing application
    - **root**   
    The path to the Soda directory (e.g. *$SODA_HOME*)
    - **androidSDKPath**   
    The path to the Android SDK
    - **core**   
    The path to the *SodaCore* directory
    - **env**   
    The testing environment. Used by tests which use the *${env}* variable.
    - **proxy**   
    Proxy settings, in the format: *http://[user]:[pass]@[proxy_ip]*
    - **port**   
    *Deprecated* The port to start the Visual Editor on. **This is no longer used.**
    - **pid**   
    The process id
    - **framework**   
    Name of the currently running framework
    - **say**   
    If true, and on OS X, it will announce when tests fail/pass. In not on OS X, this does nothing.
    - **devMode**   
    "Dev Testing Mode". If true, will prevent Soda from writing test results and taking failure screenshots. Useful if you're writing tests.
    - **maxFileScanDepth**   
    The maximum depth Soda will scan down a project directory.
    - **defaultSyntaxName**   
    The default syntax name. Used if a test/action doesn't specify a syntax object with a name key.
    - **ignoreTestDirectories**   
    Ignores the listed directories in the project path. It's highly recommended that *.git* and *test_results* is listed here.
    - **resultsJSON**   
    The path to where to save test results.
    - **resultsScreenshot**   
    The path to where to save test failure screenshots.
    - **resultsTrace**   
    The path to where to save traces.
    - **testPath**   
    The project path. Set on Soda startup, or defaults to the current working directory.
    - **veUserFavorites**   
    The path to store the Visual Editor user favorites data.
    - **veUserSettings**   
    The path to store the Visual Editor user settings data.
    - **interactiveMode**   
    If true, when running tests in the CLI you can pause, step forward, backward, and repeat actions. If false, a test will run through until failure/completion uninterrupted.
    - **stopOnOrphanedAction**   
    If true, will stop testing if an unidentified action object is encountered.
    - **interactiveMode**   
    If true, when running tests in the CLI you can pause, step forward, backward, and repeat actions. If false, a test will run through until failure/completion uninterrupted.
    - **stopOnFailure**   
    If true stops modules and suites on failure, if false continues to the next test on failure
    - **takeScreenshotOnFailure**   
    If true, a screenshot will be taken on failure
    - **reportJSON**   
    If true, results will be written to file on failure
    - **findElementRetries**   
    The number of times to grab the tree and look for an element, when an element isn't found in the DOM
    - **testingInProgress**   
    Whether or not testing is in progress
    - **maxBuffer**   
    The maximum buffer size for *child_process.exec*
    - **defaultVariableFormat**   
    The default variable format (how to determine variables in actions), can be overwritten by the framework
    - **defaultVariableMatch**   
    The default callback for when a variable is found, can be overwritten by the framework
    - **console**   
    Console options for the SodaCommon/Console module
    - **suite**   
    The default suite name
    - **module**   
    The default module name
    - **test**   
    The default test name
    - **action**   
    The default action name
    - **platform**   
    The default platform name
    - **syntax**   
    The default syntax name and version
    - **resetDevice**   
    If true, the device will be reset on the next framework.start() call

- *Soda/SodaCore/frameworks/instruments/imports/Config.js*
Contains the settings for the Instruments (iOS) framework

- *Soda/SodaCore/frameworks/automator/imports/Config.js*
Contains the settings for the Automator (Android) framework

- *Soda/SodaCore/frameworks/selenium/imports/Config.js*
Contains the settings for the Selenium (Web) framework

## People
---
**Concept**   
The concept and idea belongs to [James Pavlic].

**Developers**   
People who have done an awesome job writing the Soda Testing Framework...

- [Jason Pollman]
- [James Pavlic]

## License
---
**To be determined**
