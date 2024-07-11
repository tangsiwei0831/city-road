#!/bin/sh
rm -rf ./dist
npm run build
cd ./dist
git init
git add .
git commit m 'push to gh-pages'
git push --force git@github.com:tangsiwei0831/city-road.git main:gh-pages
cd ../
git tag `date "+release-%Y%m%d%H%M%S"`
git oush --tags