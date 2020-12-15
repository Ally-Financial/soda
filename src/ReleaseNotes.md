# Soda Release Notes
---

#### Version 0.9.0
**April, 22, 2016**  
*Released: TBD*

- **Added support for building either from a project or a WorkSpace
    - This allows for run-time determination of and building with appropriate flags.

#### Version 0.9.0
**January, 19, 2016**  
*Released: TBD*

- **Created 0.9.0 Branch**
- **Feature: Raw JSON Editor in Visual Editor**
    - Users can click the "Raw" toggle button to toggle between raw JSON and the "Interactive Editor" from within the Visual Editor
    - Users can drop actions/assertions from the "Actions Toolbox" into the raw JSON editor, or on to a screen element (like the Interactive Editor)
- **Added support for dashes in variable names**
- **Modified Vars.save to iterate over objects**
    - Before you could only store variables using a *string* name, no you can store within existing variables, iterating over objects using the . (dot) notation.
    - { "store": "foo", "as": "bar.baz" } would have stored *foo* in the variable *bar.baz*, now it stores *foo* in *bar* as the property *baz* (if *baz* exists, that is).
- **Modified the Action Search to search only action titles**
    - Before the search included action descriptions as well, which returned many irrelevant results.
- **Rounded position and size element properties for Instruments framework**
- **Major Bug fixes**
    - Fixed a bug where widgets were being lost if a user edited an action in the Visual Editor and subsequently saved it
    - Fixed a bug in the Visual Editor tree search that traversed both all elements and also iterated through child elements. This was causing the search to be very slow and nearly unusable on large DOMs.
    - Fixed a bug where raw edit mode wouldn't clear the list.
    - Fixed a bug where the module and suite were being changed if a test was running and the visual editor was launched while the test was in the *failed* or *paused* state, causing the user to have to manually set the module (using *:m*) before resuming the test.
    - Fixed a bug where if a framework was starting in the visual editor, and a background visual editor tab of the same port was closed, it would attempt to shutdown the framework (therefore setting *framework.started* to false).
    - Fixed a bug where the visual editor would crash Soda if using the selector query before any test was run (i.e. before any mapping is set).
    - Wrapped all action regular expressions in try/catch blocks so invalid regular expressions won't break testing.
    - Fixed a bug where empty strings were being removed from actions after editing them using the *filesystem* driver.
    - Fixed some type errors around *Tree.findElementsBySelector*
- **Added "delete" action object, to delete test variables during testing**
    - { "delete": "variable_name" }
    - Removes the variable and prevents its output at the end of the test.
- **Added "clickIfExists" action object**
    - Will click a *single* element if and only if it exists, will pass if the element does not exist.
- **Added "tapIfExists" action object**
    - Will tap a *single* element if and only if it exists, will pass if the element does not exist.
- **Added the Windows framework**
- **Modified selector mappings to account for variables**
    - Variables are now replaced in selector mappings
    - Variable replacement done at the tree level, and thus you can now query selectors using variable in the visual editor selector query field.
- **Added *ignore* action key**
    - Adding a key with *ignore* to any action will now skip that action, the value of the *ignore* key should be the platform you wish to ignore the action on, an array of platforms, or true to ignore the action object on every platform
- **Removed the delay between Instruments stdout logging**
    - This seems to be a fix by Apple in XCode 7.2+
    - Added the *Config.WRITE_CHUNK_DELAY* option to the Instruments framework configuration.
    - If tree begins to fail increase this value (0.2 used to be the default value)
- **Loosened the strictness of *CoreSyntax.saveAll* and *CoreSyntax.executeAndRepeatType***
    - *saveAll* will no longer fail if no elements are returned, it will simply store an empty array.
    - *executeAndRepeatType* will no longer fail if repeat is zero, it will no act like any other iteration function over a collection of zero items.
- **Resolved outstanding jshint errors **
- **Added REPL *:history* command**
    - Similar to history command in terminal


#### Version 0.8.0
**January, 19, 2016**  
*Released: January 25, 2016*

- **Created 0.8.0 Branch**
- **Major Bug fixes**
    - *Instruments.findDevices* was reading *every* device's Plist file for every device. For a large number of devices, this was causing *EMFILE* errors.
    - Fixed bug in Visual Editor where the user could use the asset picker to change the value of *any* element. This now only works on *input* and *contenteditable* HTML elements, as expected.
    - Fixed bug in REPL where the prompt wasn't updated when switching from a killed Soda instance.
    - Changing the *env* config variable now sets the test variable *_env_*'s value when changed.
    - Fixed a few more places found where Path.join was not being used.
    - Fixed asset updating in Visual Editor. Previously module and suite creation callbacks were not being invoked.
    - Fixed bug where TestRunner would let you execute a test without a loaded framework, resulting in no callback invocation.
    - Fixed bug in VisualEditor where the *suite* drop downs where looping a ridiculous number of times.
    - Fixed bug in VisualEditor that didn't strip out blank keys (i.e. ""), resulting in an *OrphanedActionError* when the user removed the text from the action key field.
    - Fixed bug in VisualEditor where running individual tests would run modules
    - Fixed module and suite from displaying un-run tests as passing
    - Fixed a bug that would let a user run tests if a test was already running by escaping test mode with "x" and entering a run
    - Fixed a bug in the Automator framework that was storing boolean element properties as strings
    - Fixed a bug where starting one Automator framework would kill the tests of another
    - Fixed some ADB commands which failed when multiple simulators were running (didn't specify device)
    - Fixed a bug in running trace files which killed the process if any *device interactions* were encountered
    - Fixed a bug in Instruments framework where SDK Versions < 9.1 failed when trying to build
    - Downloading actions now opens the action in a new window, rather than the same (which kills the framework)
    - Fixed a bug in VisualEditor where non-generic assets weren't generating filenames correctly for the FileSystem driver (i.e. "asset.platform" was writing to "assetplatform")
    - Fixed a bug on test inquiry ("i" keypress) that listed the asset path as "(undefined)"
- **Automator Framework Refactored**
    - No longer uses intervals to check for ADB Devices and boot status
    - Created functions for duplicated code
    - Fixed *Launching app `undefined`*
    - Fixed stdout output
    - App is now force quite when Soda is killed, so on next start, if attached the app will launch correctly
    - Startup performance has increased as a result of removing intervals
    - Fixed a few places where if a non-function value was passed in as the callback, the script would have thrown
    - Emulators names now replace spaces with underscores, so if a user enters "Nexus 5" it will be changed to "Nexus_5"
- **Feature: Automatic Building for iOS/VisualEditor**
    - If the user's selected app path does not exist, the app is built there.
- **Refactored the Asset System for DB Integration**
    - AssetCollection has become an abstraction, which now uses *asset drivers*
    - Moved most of AssetCollection into the *FileSystem* asset driver
    - Added method of linking strings to database names for CRUD event attaching
- **Added special UTF-8 characters to Test Output**
    - For easily identifying important messages
- **Added framework name & device to process title**
    - So, in the case of multiple processes and a problem, you'll know which process to kill
- **Refactored SodaCore/TestRunner**
    - Cleaned up some duplicated code
    - Found an edge case where module runs would fail to invoke the provided callback
    - Made unnecessarily public methods private
- **Added favicon.ico to VisualEditor**


#### Version 0.7.0
**January, 14, 2016**  
*Released: Skipped*

- **Created 0.7.0 Branch**
- **Removed installer which adds soda, sodab, etc. binaries to .bash_profile and added the binaries "bin" key to package.json**
    - Node uses this object to symlink the binaries in the bin folder to /usr/local/bin
    - More more .bash_profile injection
    - Compatible with Windows
    - This is the "right" way to use binaries in Node.js and npm
    - Bundle creation still uses old method, since bundle users will run a local copy of node (without npm)
    - New binaries are now named:
        - *soda*
        - *sodabuild*
        - *sodarun*
        - *sodareset*
        - *sodatrace*
    - Bundle version of Soda still uses old names (e.g. *sodab*, *sodar*, etc.) with the exception...
        - *soda* renamed to *sodac* to prevent bundle/npm conflicts
        - Bundle users should use *sodac*, *sodab*, *sodar*, etc.
        - Users with Node.js installed, should run *npm install . -g* and use *soda*, *sodabuild*, *sodarun*, etc.
- **All files now utilize path.join and/or path.normalize**
    - Done for Windows compatibility
    - *String.withTrailingSlash* and *String.withoutTrailingSlash* still used in some places to explicitly add or remove slashes, but these methods have been updated for windows compatibility as well.
- **Soda temp directory now defaults to the OS's temp folder + .sodatemp (e.g. $TMPDIR/.sodatemp)**
    - Better cross-platform compatibility
    - Allows the user to install Soda as a global node module without having to run as sudo
    - Default OS Permissions in */usr/local/node_modules* prevented files from writing to temp
    - As a side-effect, a new import had to be written for Instruments (SodaCore/frameworks/instruments/imports/Vars.js)
        - Instruments will *only* let you import hard coded string (no variables or concatenation)
            - Unable to import from temp, since temp location is no longer hard coded
            - So rather than import the *vars.js* file (with paths and locations, etc.), this file is now written to disk as JSON into the temp folder
            - Instruments reads in environment variable *$TMPDIR*, then...
            - File is read in Instruments and parsed
- **Updated bundle script to add version to app filename**
    - Bundle now uses *$SODA_SCRIPTS_PATH* variable over the contents of *Soda-vX.X.X/.scriptspath*
        - Allows users to set the location of the scripts path, post bundle install
- **Feature: Selector Mapping**
    - Utilizing *suite.json* and *module.json* files a user can specify a "map" key to translate constants to selectors for each platform.
    - The map key should be an object with keys as the name of the constants the user wishes to be translated into selectors
    - These keys should be an object with platform/select key values
    - Ex: *{ "map": LOGIN_SUBMIT_BUTTON: { "iphone": ".iphone_submit", "ipad": ".ipad_submit", "android": "^android_submit", ... } }*
    - In scripts, each selector will be attempted to be replaced by a mapping. If the mapping key matches the selector, it will be translated.
        - Ex: *"tap": "MY_MAPPING_KEY"*
    - Mappings, like assets, are scoped first by module, then suite, then global. With the lowest level used first if it exists.
- **Separated trace from results**
    - Moved result traces to their files.
    - Results files now list the trace filename, rather than the whole trace
    - This was done to make results more readable, and to make result traces easily runnable using *sodatrace*
    - Added configuration value *resultsTrace* to specify the trace destination directory
- **Bug fix: Soda console config updates are reflected by the REPL now**
    - Before the REPL and Soda's console options were detached until you "switched to a Soda"
    - Now, when you update a Soda instance's console configuration, it is reflected by the REPL immediately.
- **Bug Fix: Selectors without a space, were parsed as separate hierarchies**
    - Ex: *#window:0.userName* was unexpectedly parsed as *#window:0 .userName*
    - A space is now mandatory for selector hierarchy, as expected.
    - Tree unit tests updated to cover this defect for future verification
- **Feature: Compound Selectors**
    - Selectors operators can now be strung together (as in CSS)
    - Ex: *.userName@Username*, *.userName^{userName}@{Username}*, *.someClassA.someClassB.someClassC*
    - Stringing them together without spaces will ensure the element meets all the selector type requirements.
    - Done in effort to make selectors more "web" like.
        - Since the name property can now be an array, the Selenium framework can now grab elements as they would in jQuery or CSS
        - Ex: *#elementWithId.elementClassA.elementClassB*
    - *Nth* and other property filters apply like single selectors
    - Tree unit tests coverage extended for this feature
    - Updated Selectors documentation to reflect feature
- **The Automator framework now uses the $ANDROID_SDK_HOME (or for windows, %ANDROID_SDK_HOME%) variable**
    - Users can now just set the *ANDROID_SDK_HOME* environment variable, rather than having to edit a Soda file.
    - This path used to be a hard coded config value
    - Soda first attempts to use the value of the *ANDROID_SDK_HOME* variable
        - If the variable is set, it checks that the directory exists and uses this value over the hard coded value
            - If the directory doesn't exist it falls back to the config value
        - If the variable is not set, it falls back to the config value
    - If both *ANDROID_SDK_HOME* and *SodaConfig.androidSDKPath* point to invalid paths, an error is now returned to the caller. In the case that the user is using the REPL, an error is printed and Soda quits.
- **Feature: Added *sodamake* command**
    - *sodamake [destination/path] [project_name]*
    - Creates a blank Soda project structure at the specified path
    - If the directory already exists, the process aborts
- **Created man pages for all binaries**
    - See: */man* for the manual entry pages.
- **Added keywords to package.json**
- **Added *Soda.toSafeString***
    - As of current, the *Soda.toString* method uses colons, which aren't safe for filenames in most OS'
    - Previously this led to a lot of *String.replace* calls
    - *Soda.toSafeString* replaces colons from *Soda.toString* with dashes
- **Changed Instruments directive filename from *directive* to *directive-[soda.toSafeString()]***
    - Allow devices and simulators to run concurrently
- **Added *close* device interaction for web frameworks**
    - Closes the browser window when testing is done
    - If no browser is open at the start of a new test, a new window is opened with the previous session
- **Added *:web* command to REPL**
    - Sets the platform to *web*
    - All other platforms were represented, so adding web only made sense.
- **Wrote Readme.md and Documented all of Soda**
- **Bundle creation now uses the user's current version of Node.js from /user/local/bin/node**
    - No longer need to keep a copy of Node.js in the Soda repository
    - */user/local/bin/node* binary copied to bundle
    - Bundle uses same version of Node that the bundle creator is using...

#### Version 0.6.0
**January, 01, 2016**  
*Released: January 13, 2016*

- **Soda moved to its own repository!**
    - Created 0.6.0 Branch
- **Script written to automatically generate an OS X app bundle**
    - The script can be found at *./support/bundle/createbundle.js*
        - *node createbundle.js [soda_scripts_destination] [scripts_branch] [scripts_repository_path] [app_desintation_relative_to_user_home]*
        - All arguments are optional
    - The bundle creates an OS X app bundle structure and copies the contents of the Soda/ folder into it
    - The scripts branch, repo, and destination location are specified in the bundle creation script, or can be passed in a arguments
    - On first launch the app pulls the latest scripts repository using the specified branch and writes a *.installed* file
    - Following the install, the latest scripts are pulled from the specified branch on startup
    - If the scripts repository has conflicts, the user is notified and given the option to quit (and fix the conflicts) or continue without pulling
    - Additionally, on startup, the app silently pulls the latest updates from the Soda branch used to create it. If this fails, no action is taken.
- **Bug fix: Fixed console command line options**
    - These weren't working before
    - Debug was always enabled if true in default config file.
        - This was causing *osexec* calls to *sodar* to buffer overflow
        - Configuration value *maxBuffer* was also changed from 536576 to 1048576 to combat this
- **Swapped the value of the name (.) and label (^) tree attributes for web (see SodaCore/frameworks/selenium/imports/Script.js)**
    - This was done to better mimic CSS
    - Now an element's class maps to . and it's HTML name attribute maps to ^
    - Web scripts were updated to reflect these changes
- **The name tree attribute can now be an array**
    - This allows web elements with more than one class to be selected by any class
    - Ex: *<div class=“one two three”></div>* can now be selected using ".one”, “.two”, or “.three
    - If the value of the name attribute is a string, behavior is unchanged.
- **Added the "has" (?=) and "doesn't have" (?!) property filters**
    - Used to filter by non-string attributes
    - Specifies that an object has, or doesn't have the specified key (or value, if an array)
    - Ex: *.someWebElement[name?='someClass'][name?='someOtherClass']*
    - Only works on objects (arrays and pure objects)
    - Can be used in web to grab an element with multiple classes
        - Ex: *.classOne[name?='classTwo'][name?='classThree']*
        - Use ?= and ?!, as .classOne[name='classTwo'] won't work because name is an array... classTwo !== [object Object]
    - Returns empty set if used on a string
- **Bug fix for using property filters of the same name multiple times**
    - Previously using the same property filter twice or more would result in only the last one being evaluated
    - For example, .someElement\[value='invalid value'][value='valid value'] would return the element, and [value='invalid value'] would be ignored.
    - Now all are evaluated as expected
- **Updated Selectors documentation and DirectoryStructure documentation**
