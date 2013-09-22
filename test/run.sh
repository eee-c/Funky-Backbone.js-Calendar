#!/bin/bash

# Start the test server
packages/plummbur_kruk/start.sh

# Run a set of Dart Unit tests
results=$(content_shell --dump-render-tree test/index.html 2>&1)
echo -e "$results"

# Stop the server
packages/plummbur_kruk/stop.sh

# check to see if DumpRenderTree tests
# fails, since it always returns 0
if [[ "$results" == *"Some tests failed"* ]]
then
    exit 1
fi

echo
echo "Looks good!"
