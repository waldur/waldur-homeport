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


## details-view directive

  Directive is used to show details profile
  
  Details view directive calling looks like:
  
    <details-view details-options="CustomerDetailUpdate.detailsViewOptions"
                  details-controller="CustomerDetailUpdate"></details-view>
    
  - details-options - object of directive options
  - details-controller - current controller
  
  Options object looks like:
    
    this.detailsViewOptions = {
      title: 'Customer',
      activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
      hasLogo: true,
      listState: 'organizations.list',
      aboutFields: [
        {
          fieldKey: 'name',
          isEditable: true,
          className: 'name'
        },
        {
          fieldKey: 'contact_details',
          isEditable: true
        }
      ],
      tabs: [
        {
          title: 'Resources',
          key: 'resources',
          viewName: 'tabResources'
        },
        {
          title: 'Projects',
          key: 'projects',
          viewName: 'tabProjects'
        },
        {
          title: 'Services',
          key: 'services',
          viewName: 'tabServices'
        }
      ]
    };
  
  Options object
  
    title       - string - name of entity
    activeTab   - string - key of tab witch should be active at first
    hasLogo     - bool   - state of logo showing 
    listState   - string - link to list page
    aboutFields - array  - objects with options for fields
        fieldKey   - string - key for filed
        isEditable - bool   - state of using edit in place directive (in controller should be 'canEdit' variable)
        className  - string - class name for field
    tabs        - array  - objects with options for tabs
        title      - string - title of tab
        key        - string - key of tab
        viewName   - string - key for tab view

## checkQuotas directive

Used on links to check whether it should be disabled based on current quotas or not. <br/>
In addition optional tooltip can be shown to notify user about lack of quotas. <br/>
Two options in controller should be defined e.g:

     this.entityOptions = {
       entityData: {
         ...
         checkQuotas: 'service'
       },
     ...
     }

checkQuotas possible values: user, project, service, resource <br/>

    <div class="tooltip-relative inline"
         check-quotas="{{entityOptions.entityData.checkQuotas}}"
         sref="{{ entityOptions.entityData.createLink }}"
         class-link="button"
         tooltip-type="list-items">
        <span>{{ entityOptions.entityData.createLinkText }}</span>
    </div>

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
