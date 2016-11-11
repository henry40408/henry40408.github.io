#!/bin/bash

if [ -d build ]; then
  rm -rf build
fi

git config --global user.name $GIT_USER_NAME
git config --global user.email $GIT_USER_EMAIL

bundle exec middleman build
bundle exec middleman deploy
