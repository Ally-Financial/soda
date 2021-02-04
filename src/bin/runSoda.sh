#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
SELENIUMPATH="$SCRIPTPATH/selenium"
NODEPATH="$SCRIPTPATH/nodejs"
NEWPATH="$SELENIUMPATH:$NODEPATH:$PATH"
export PATH=$NEWPATH
export SODA_HOME=$SCRIPTPATH/soda
export SODA_ROOT=$SCRIPTPATH
echo 'PATH' $PATH
echo 'SODA_HOME' $SODA_HOME
echo 'SODA_ROOT' $SODA_ROOT
rm -rf "$SCRIPTPATH/soda/node_modules"
unzip "$SCRIPTPATH/node_modules_linux.zip" -d "$SCRIPTPATH/soda"
rm -rf "$SCRIPTPATH/selenium"
unzip "$SCRIPTPATH/seleniumlinux64.zip" -d "$SCRIPTPATH"
chromedriver -v
Xvfb :1 -screen 5 1024x768x8 &
export DISPLAY=:1.5
node "$SCRIPTPATH/soda/bin/sodarun" $1 about:blank -f $2 -t $SCRIPTPATH/$3 -e $4 -p 1337 -x $5 -s $6 -m $7 -dvc --headless --applikey m98a6qFskwdt5jncHAbCCLpRN106eJ3AzFq85QxC104ZzFFk110 --testurl $8
