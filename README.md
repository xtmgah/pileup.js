[![Build Status](https://travis-ci.org/hammerlab/pileup.js.svg?branch=travis-flow)](https://travis-ci.org/hammerlab/pileup.js) [![Coverage Status](https://coveralls.io/repos/hammerlab/pileup.js/badge.svg?branch=master)](https://coveralls.io/r/hammerlab/pileup.js?branch=master)

# pileup.js
Interactive in-browser track viewer

## Quickstart

    git clone https://github.com/danvk/pileup.js.git
    cd pileup.js
    npm install
    grunt prod

To play with the demo, you'll need to install the node.js [http-server][hs]:

    npm install http-server
    http-server

Then open `http://localhost:8080/playground.html` in your browser of choice.

## Development

Run the tests from the command line:

    grunt test

Run the tests in a real browser:

    grunt browserify:watchTest
    open tests/runner.html

To continuously regenerate the combined JS, run:

    grunt browserify:watchDist

To typecheck the code, run

    flow status .

For best results, use one of the flowtype editor integrations.

[hs]: https://github.com/nodeapps/http-server
