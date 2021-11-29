#!/bin/sh

# Exit as soon as any command fails
set -e

BASE_URL="https://storage.googleapis.com/flow-cli"
# The version to download, set by get_version (defaults to args[1])
VERSION="0.28.4"
# The architecture string, set by get_architecture
ARCH="$(uname -m)"
if [ "$ARCH" = "aarch64" ]; then
  ARCH="arm64"
fi

if [ "$ARCH" != "arm64" ]; then
  sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
  exit 0
fi

TARGET_PATH=/usr/local/bin

# Determine the system architecure, download the appropriate binary, and
# install it in `/usr/local/bin` on macOS and `~/.local/bin` on Linux
# with executable permission.
main() {

  echo "Downloading version $VERSION ..."

  tmpfile=$(mktemp 2>/dev/null || mktemp -t flow)

  url="$BASE_URL/flow-$ARCH-linux-v0.28.4"
  echo $url
  curl --progress-bar "$url" -o $tmpfile

  # Ensure we don't receive a not found error as response.
  if grep -q "The specified key does not exist" $tmpfile
  then
    echo "Version $VERSION could not be found"
    exit 1
  fi

  chmod +x $tmpfile

  [ -d $TARGET_PATH ] || mkdir -p $TARGET_PATH
  mv $tmpfile $TARGET_PATH/flow

  echo "Successfully installed the Flow CLI to $TARGET_PATH."
  echo "Make sure $TARGET_PATH is in your \$PATH environment variable."
}

main
