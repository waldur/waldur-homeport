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

## Base configuration file base-config.js

Base configuration file variables are overridden in custom-config.js

Config file settings:

    name:                          environment name  
    apiEndpoint:                   rest server address   
    googleClientId:                google client id   
    googleEndpointUrl:             google api url   
    facebookClientId:              facebook client id   
    facebookEndpointUrl:           facebook api url   
    pageSizes:                     page size step to display different types of lists   
    pageSize:                      default page size   
    topMenuCustomersCount:         top menu customers quantity  
    serviceIcon:                   image to display on appstore page  
    topMenuCustomersCacheTime:     time to store customers in browser cache  
    dashboardEventsCacheTime:      time to store events in browser cache  
    listControlPanelShow:          variable for displaying action switcher panel: true to show, false to hide 
    currentCustomerUuidStorageKey: key for localStorage to ged customer uuid for customer selected in top menu 
    addonsList:                    additional options for virtual machine purchase on appstore page
    resourceOfflineStatus:                 value for offline fields received from server
    resourceOnlineStatus:                  value for online fields received from server
    IntercomAppId:                 app id for Intercom statistic
 

## Multilingual user interface

Workflow looks as following:

 1. Markup HTML using `translate` directive. For example:
`<h1 translate>Hello!</h1>`

 2. Run `grunt nggettext_extract`. It will extract strings from HTML files and put it in `i18n/template.pot`. Doc: https://angular-gettext.rocketeer.be/dev-guide/annotate/

 3. Create or edit PO files in i18n directory. You can merge new string from POT to PO using `poedit`.

 4. Run `grunt po2json_angular_translate`. It will convert PO files to JSON files at `static/js/i18n/locale-LANGUAGECODE.json`


## submitButton directive

Used for disabling button after click to prevent double click

action function should return promise for correct directive work

if promise returns true - button will stay disabled

example:

    <a class="button-apply" submit-button="ProjectAdd.save()">Add project</a>

## scrollToMe directive

Let's say you have a container with list of expandable items.
When last item of the menu is expanded, it's not visible because it is located outside of the viewport.
This directive allows to scroll container to the element on which you have clicked.

containerClass attribute is used for locating container by its class.

example:

    <div class="mobile-menu-side">
        <!-- A lot of items -->
        <a scroll-to-me container-class="mobile-menu-side" ng-click="showExpanded = !showExpanded">
          Click me
          <div ng-if="showExpanded">
            Submenu
          </div>
        </a>
    </div>

## scrollToTop directive

Used for scrolling document to top each time when state has been changed.
