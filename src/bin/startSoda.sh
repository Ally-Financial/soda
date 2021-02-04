#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
SELENIUMPATH="$SCRIPTPATH/selenium"
NODEPATH="$SCRIPTPATH/nodejs"
NEWPATH="$SELENIUMPATH:$NODEPATH:$PATH"
export PATH=$NEWPATH
export SODA_HOME=$SCRIPTPATH/soda
export SODA_ROOT=$SCRIPTPATH
node "$SCRIPTPATH/soda/bin/soda"
