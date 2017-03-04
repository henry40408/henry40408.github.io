#!/bin/bash

git clone ${CIRCLE_REPOSITORY_URL} ../repo-clone

pushd ../repo-clone
git checkout master
rm -rf *
popd

cp -r ./_site/* ../repo-clone/

pushd ../repo-clone
git config user.email 'sayhi@circleci.com'
git config user.name 'CircleCI'
git add -A .
git commit --amend -m "Automate deploy by CircleCI #${CIRCLE_BUILD_NUM}"
git push origin master --force
popd
