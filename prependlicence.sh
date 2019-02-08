#!/bin/sh

#Licence notice to prepend
fileName="licencenotice.txt"
notice=`cat $fileName`

# sed -i '1s/^/$notice/' file
# echo "$notice"

sourceDir=./lib/*
sourceDir=./scrap/profiler.js
find $sourceDir -type f -iname '*.js' -exec sed -e "s|^|${notice}|g" "{}" +;

# query="Loggerize"
# replacement="Loggerizing"
# find $sourceDir -type f -iname '*.js' -exec sed "s/$query/$replacement/g" "{}" +;