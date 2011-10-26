#!/bin/sh

cd ../lib/dojo-src/util/buildscripts/
#For the future, use different releasenames for different releases to make it easy to switch between releases!
./build.sh profileFile=../../../../build/hnetconfolio.profile.js action=clean,release version=confolio1.0 releaseName=target-hnetfolio localeList=en,en-us,de,el,es,et,hu,no-nb,pt,ro,ru,sv releaseDir=../../../../ cssOptimize=comments.keepLines
