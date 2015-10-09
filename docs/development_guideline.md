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

 1. Markup HTML using `translate` directive. For example:
`<h1 translate>Hello!</h1>`

 2. Run `grunt nggettext_extract`. It will extract strings from HTML files and put it in `i18n/template.pot`. Doc: https://angular-gettext.rocketeer.be/dev-guide/annotate/

 3. Create or edit PO files in i18n directory. You can merge new string from POT to PO using `poedit`.

 4. Run `grunt po2json_angular_translate`. It will convert PO files to JSON files at `static/js/i18n/locale-LANGUAGECODE.json`

### Active button directive

Active button directive calling looks like:

`<action-button button-list="CustomerList.actionButtonsListItems"
    button-controller="CustomerList"
    button-model="customer"></action-button>`
    
button-list - array of objects.

 - object params:
  1. title - title of button
 
  2. clickFunction - function for click. In button template: `ng-click="button.clickFunction(buttonModel)"`
 
  3. className - class for button. In button template: `class="button-simple {{ button.className }}"`
 
  4. isDisabled - function for checking button status. In button template:
   `ng-class="{'disabled': button.isDisabled && !button.isDisabled(buttonModel)}"`
  
button-controller - controller of list page

button-model - model of item

button-type - type for action button directive. Either 'refresh' or usual button list.

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
 

## Entity list directive

 Directive is used for displaying different lists throughout project.  
 Sample directive usage:  
 
    <entitylist entity-list="UserList" 
                  entity-service="UserList.service" 
                  entity-buttons="UserList.actionButtonsListItems" 
                  entity-options="UserList.entityOptions"></entitylist>
  
  Directive parameters:
  
  
   1. entity-list - current controller      
   2. entity-service - service for controller   
   3. entity-buttons - action buttons for list rows (action-button directive)   
   4. entity-options - object with list of field properties. Partly described in    
       ENTITYLISTFIELDTYPES constant. entityOptions object is defined in controller
              
   entityOptions sample:
   
    this.entityOptions = {
      entityData: {
        title: 'Users',
        noDataText: 'No users yet.',
        createLink: '', // Param to check if entity can be added to list
        createLinkText: 'Create a backup', // text for link
        expandable: false, // for entity element to be expandable or not
        hideActionButtons: true // hide or show buttons with actions 
        actionButtonsType: 'refresh' // 'refresh' to show only icon, do not set this field to use usual buttons
      },
      list: [
        {
          type: ENTITYLISTFIELDTYPES.avatarPictureField,
          className: 'avatar'
        },
        {
          name: 'Name',  // Display name of list column
          propertyName: 'full_name', // name of field to display in column
          emptyText: '', // text to output if field value is empty
          type: ENTITYLISTFIELDTYPES.link, // field type - see ENTITYLISTFIELDTYPES constant for types list
          link: 'users.details({uuid: user.uuid})', // ui-sref attr value
          className: 'name' // class name for field html element
        }
      ]
    }    
  Where entityOptions.list is list of fields to display,  
  entityOptions.entityData - variables to display at list header
  
  Required fields for list types:  
  entityStatusField: onlineStatus, offlineStatus  
  link: link

## ENTITYLISTFIELDTYPES constant (entity-list directive)

 Container for different types of fields in entities lists - backups list, resources list, users list etc
 Every type has list of fields for proper display. 
 
    date:                    date in days ago
        name          - string - name of column, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required
    dateCreated:             date field 
        name          - string - name of field, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required        
    name:                    name of entity  
        name          - string - name of column, required
        propertyName  - string - name of field, required
        emptyText     - string -  text to display for field with no value, required
        link          - string - link for ui-sref attribute, required
        className     - string - css class name for field, optional
        showForMobile - string, constant - constant to show field on mobile devices, required
    link:                    field with link  
        name          - string - name of column, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required
        link          - string - link for ui-sref attribute, required
        showForMobile - string, constant - constant to show field on mobile devices, required  
    listInField:   constant for entity AccessInfo field  
        name          - string - name of column, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required
    entityStatusField:       constant for entity Status field  
        name          - string - name of column, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required
        onlineStatus  - string, constant - constant in ENV.onlineStatus
        offlineStatus - string, constant - constant in  ENV.offlineStatus
    avatarPictureField:      field with avatar      
        className     - string - css class name for field, optional
        showForMobile - string, constant - constant to show field on mobile devices, required
    noType:                  default field type
        name          - string - name of column, required
        propertyName  - string - name of field, required
        className     - string - css class name for field, optional
        emptyText     - string -  text to display for field with no value, required
    
    showForMobile:           add class to show field on mobile devices

## Expandableitem directive

  Directive is used to show additional information in list elements.   
  Directive is placed in entity-list.html file:
  
   
    <expandableitem ng-if="entityList.expandableOptions"  
        ng-repeat="item in entityList.expandableOptions"   
        ng-show="expandItem" 
        ng-class="{'opened': expandItem}" 
        class="list-item-details" 
        expandable-element="entity" <!-- entity item -->
        expandable-list="entityList" <!-- entity controller -->
        expandable-options="item"></expandableitem> <!-- options array -->
  
  
  Expandable item shows one section of information, so it is used within a loop to          
  display multiple sections if necessary.
  As entity-list directive, expandableitem requires an object with settings
  in corresponding controllers init function:
  
  
    this.expandableOptions = [
      {
        // options for current information section
        isList: true, // is information given in a list
        sectionTitle: 'Connected projects', // section title
        addItemBlock: true, // display adding item instructions block
        articleBlockText: 'Manage users through', // text in article section
        entitiesLinkRef: 'projects.list', // link state to entities list
        entitiesLinkText: 'project details', // text for entities link
        listKey: 'userProjects', // list controller key for list in expandable block
        modelId: 'username', // model key for getting id
        headBlock: 'description', // 'description' or 'header' to use either layout
        hasAnswerForm: true, // if section has feedback form (for support list)
        answersBlock: true, // if section displays answers (for support list)
        viewType: 'support' // filename suffix for template file 
                    
        // object with options for minipagination directive
        minipaginationData:
        {
          pageChange: 'getProjectsForUser', // list controller key for callback function
          pageEntityName: 'projects' // entity name for sublist
        },
        // types to display in list section (could be one or more objects in the list)
        list: [
          {
            entityDetailsLink: 'projects.details({uuid: element.project_uuid})', // state for link
            entityDetailsLinkText: 'project_name', // field key
            type: 'link' // type of field
          },
          {
            avatarSrc: 'email', // field key
            type: 'avatar' // type of field
          }
        ]
      }
    ];  
  
   
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
Also optional tooltip can be shown to notify user about lack of quotas. <br/>
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


