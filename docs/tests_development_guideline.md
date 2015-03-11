# Tests development guidelines

## Start tests

Follow instructions from `README` (part: Tests) to install protractor and run tests all at once or separately.

## Implement tests

1. All tests have to pass on [Alice dataset][1]. If tests do not pass on this dataset - they are failed.

2. After success `describe` block completion user have to be logged out.
Ideally no additional data does not have to be added to backend.

3. One file with tests does not have to depend on other tests file(but it can use helpers).

[1]: http://nodeconductor.readthedocs.org/en/stable/developer/sample-data.html
