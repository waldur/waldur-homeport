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
        noDataText: 'No users yet.'
        createLink: '' // Param to check if entity can be added to list
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

## ENTITYLISTFIELDTYPES constant (entity-list directive)

 Container for different types of fields in entities lists - backups list, resources list, users list etc
 
    date:                    date in days ago  
    dateCreated:             date field  
    name:                    name of entity  
    link:                    field with link  
    entityAccessInfoField:   constant for entity AccessInfo field  
    entityStatusField:       constant for entity Status field  
    avatarPictureField:      field with avatar  
    noType:                  default field type
    showForMobile:           add class to show field on mobile devices
  