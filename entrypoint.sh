#!/bin/sh

set -e

if [ -z "$NODE_PATH" ]; then
  export NODE_PATH=/node_modules
else
  export NODE_PATH="$NODE_PATH":/node_modules
fi

# Since actions/checkout can be setup with a different user ID, we need to set the workspace as safe inside this action
# Info about the vunlerability: https://github.blog/2022-04-12-git-security-vulnerability-announced/
git config --global --add safe.directory "$GITHUB_WORKSPACE"

export NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules"

node /run.mjs
