# Styleguides

* [Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/tree/master/a1)
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

## Unit tests

In order to run unit tests only once, for example in Jenkins, execute command `npm test`.
If you want to run server, which watches for changes in tests, run `npm run test-server`.

Unit tests are used for testing services, controllers and directives.
Unit tests are written in the `.spec.js` files.
We use the following testing stack: Jasmine, Karma, Phantom.

Consider [this example](app/scripts/components/core/filter.spec.js) of filter test.

# Component approach

Previously all code have been split by several directories: scripts, views, assets, tests.
In scripts directory there was configs, controllers, directives and services.
As project has even grown further, it became apparent that this approach does not scale very well.
Think of situation when are working on some component and you need to switch all the time between its parts.
Moreover, all these parts have been connected to the single Angular module and it made unit testing infeasible.

In order to improve modularity and testability, we need to adopt component approach.
Each component consists of script, SCSS stylesheet, HTML template and unit test.
All these files reside in one directory, one directory for each component.

Script imports template and stylesheet and exports component.
Unit test imports component and specifes test case.
In the module root there's script which declares components in the module.
In the application root there's module which connects all other modules.

Stylesheet file may import dependencies from core module.

In order to inject dependencies into component, ng-annotate-loader is used.
It is required to mark each function which needs annotations, with the following comment: `// @ngInject`
