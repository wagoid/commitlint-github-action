#!/bin/sh

set -e

cd ${GITHUB_WORKSPACE}

NODE_PATH=/node_modules node /run.js
