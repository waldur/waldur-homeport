# Development guidelines

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
