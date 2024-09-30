#!/usr/bin/env bash

set -euxo pipefail

BASE_URL="https://henry40408.eth.limo"
IPFS_KEY_NAME="ipns"

hugo --gc --minify --baseURL "$BASE_URL"
CID="$(ipfs add -r -Q public/)"

ipfs name publish --key="$IPFS_KEY_NAME" "/ipfs/$CID"
