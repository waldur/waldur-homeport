# Tests development guidelines

## Start tests

Follow instructions from `README` (part: Tests) to install protractor and run tests all at once or separately.

## Implement tests

1. All tests have to pass on [Alice dataset][1]. If tests do not pass on this dataset - they are failed.

2. After success `describe` block completion user have to be logged out.
Ideally no additional data does not have to be added to backend.

3. One file with tests does not have to depend on other tests file(but it can use helpers).

[1]: http://nodeconductor.readthedocs.org/en/stable/developer/sample-data.html

## Modes tests

All modes tests files are located in test/internal/{MODE_NAME}

For tests we use mocked endpoints in `test/mocks.json`. These mocks are handled on node.js server `test/server.js`.
To add new test you should add needed endpoints to `test/mocks.json`. POST request require adding additional endpoint
to mocks.json in following format: `"/add" + {endpoint}`.

For test server we use configs from `app/scripts/configs/test`. For testing purposes index-template.html compiles
to test.html. Test server runs at 8002 port. Test backend runs at 3011 port.
