# Testing

In order to run unit tests only once, execute command `yarn jest`.
If you want to run server, which watches for changes in tests, run `yarn jest --watch`.

Unit tests are used for testing React components, Redux actions, sagas, reducers, selectors.
Unit tests are written in the `.spec.ts` files.

Integration tests are implemented using [Cypress framework](https://www.cypress.io/).
In order to run all integration tests, execute command `yarn ci:test`.
If you already have Webpack server running, it's better to execute command `yarn cypress open`.
