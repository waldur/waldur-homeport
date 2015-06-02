# Development guidelines

## Getting data from backend to view

To get data from backend to view (and vice versa) 4 (3) layers have to be realized.

#### Raw layer

Deepest layer that contains basic providers for communication with a certain API endpoint (always only one!).
Usually providers for raw layer are realized as `ng-factory`. Example: `RawProject` from `projects-service.js`.

Recommended name: `Raw<ObjectName>`

#### Service layer

Optional layer that combines data from one or more raw layer providers and creates one complete object.
Providers for service layer are implemented as `ng-service`. Example: `ProjectsService` from `projects-service.js`.

Recommended name: `<ObjectsName>Service`

#### Controller layer

Uses providers from service layer to get or create objects with backend data.
It is possible to use raw layer providers - only if objects are really simple, don't require any additional data
and there is no provider from service layer for this type of objects.
The results of promise request must be process in then block and put into variable which is available for a view.

Recommended name: `<ObjectName><Actions>Controller`. Examples: `ProjectAddController`, `ProjectDetailUpdateController`

#### Views layer

Shows controller attributes to users, allows users to modify them.

## URLs

 - list of objects: `/objects/`
 - list-level operation (example: add): `/objects/<operation>/`
 - one object: `/object/<uuid>/`
 - object-level operation (example: update): `/object/<uuid>/<operation>/`

### Pagination directives

Pagination directive calling looks like:
<pagination pages-href="#/resources/" pages-list="ResourceList" pages-service="ResourceList.service"/>
pages-list - list controller
pages-service - list model
pages-href is not required, current url by default

page-size directive calling looks like:
<pagesize pages-href="#/resources/" pages-list="ResourceList" pages-service="ResourceList.service"/>
pages-list - list controller
pages-service - list model
pages-href is not required, current url by default

## Multilingual user interface

Workflow looks as following:
1) Markup HTML using `translate` directive. For example:
`<h1 translate>Hello!</h1>`
2) Run `grunt nggettext_extract`. It will extract strings from HTML files and put it in `i18n/template.pot`. Doc: https://angular-gettext.rocketeer.be/dev-guide/annotate/
3) Create or edit PO files in i18n directory. You can merge new string from POT to PO using `poedit`.
4) Run `grunt po2json_angular_translate`. It will convert PO files to JSON files at `static/js/i18n/locale-LANGUAGECODE.json`
