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

Each component consists of script, SCSS stylesheet, HTML template and unit test.
All these files reside in one directory, one directory for each component.

Script imports template and stylesheet and exports component.
Unit test imports component and specifes test case.
In the module root there's script which declares components in the module.
In the application root there's module which connects all other modules.

Stylesheet file may import dependencies from core module.

In order to inject dependencies into component, ng-annotate-loader is used.
It is required to mark each function which needs annotations, with the following comment: `// @ngInject`

# General tips on writing React components

New tables should be implemented using 'Table' component under 'table-react' folder.
A new table should be named with 'List' postfix, for instance: UsersList.
Try to maximize usage of theme's colors and do not add custom styling if not necessary.
