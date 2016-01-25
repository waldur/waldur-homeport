Web applications usually allow user to manage lists of things,
for example list of customers, projects or resources.

We have implemented several AngularJS directives in order to:
1) render multi-column lists for both desktop and mobile clients
2) apply action to selected item
3) paginate through large list
4) expand item in order to receive more information without switching to another view

## Entity list directive

Directive is used for displaying different lists throughout project.
Sample directive usage:

`
<entitylist entity-list="UserList"
              entity-service="UserList.service"
              entity-buttons="UserList.actionButtonsListItems"
              entity-options="UserList.entityOptions"></entitylist>
`

Directive parameters:

1) entity-list - current controller
2) entity-service - service for controller
3) entity-buttons - action buttons for list rows (action-button directive)
4) entity-options - object with list of field properties. Partly described in ENTITYLISTFIELDTYPES constant. entityOptions object is defined in controller

entityOptions sample:
`
    this.entityOptions = {
      entityData: {
        title: 'Users',
        noDataText: 'No users yet.',
        createLink: '', // Param to check if entity can be added to list
        createLinkText: 'Create a backup', // text for link
        expandable: false, // for entity element to be expandable or not
        hideActionButtons: true // hide or show buttons with actions
        actionButtonsType: 'refresh' // 'refresh' to show only icon, do not set this field to use usual buttons
        timer: 7, // Set a timer if you want to refresh the list by setInterval
        rowTemplateUrl: 'views/payment/invoice.html'  // URL of template used for rendering row in mobile client
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
`

  Where entityOptions.list is list of fields to display,
  entityOptions.entityData - variables to display at list header

  Required fields for list types:
  entityStatusField: onlineStatus, offlineStatus
  link: link

## ENTITYLISTFIELDTYPES constant (entity-list directive)

Container for different types of fields in entities lists - backups list, resources list, users list etc
Every type has list of fields for proper display.

    date:                    date in days ago
        name           - string - name of column, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
    dateCreated:              date field
        name           - string - name of field, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
    name:                     name of entity
        name           - string - name of column, required
        propertyName   - string - name of field, required
        emptyText      - string -  text to display for field with no value, required
        link           - string - link for ui-sref attribute, required
        className      - string - css class name for field, optional
        showForMobile  - string, constant - constant to show field on mobile devices, required
    link:                     field with link
        name           - string - name of column, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
        link           - string - link for ui-sref attribute, required
        showForMobile  - string, constant - constant to show field on mobile devices, required
    listInField:   constant for entity AccessInfo field
        name           - string - name of column, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
    entityStatusField:        constant for entity Status field
        name           - string - name of column, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
        onlineStatus   - string, constant - constant in ENV.onlineStatus
        offlineStatus  - string, constant - constant in  ENV.offlineStatus
    avatarPictureField:      field with avatar
        className      - string - css class name for field, optional
        showForMobile  - string, constant - constant to show field on mobile devices, required
    noType:                   default field type
        name           - string - name of column, required
        propertyName   - string - name of field, required
        className      - string - css class name for field, optional
        emptyText      - string -  text to display for field with no value, required
    icon:
        getTitle(item) - function that returning title for field
        getIcon(item)  - function that returning icon url
    linkOrText:
        initField(item)- function that sets necessary field to item
        propertyName   - string - contains field name
        urlPropertyName - string - contains field url

    showForMobile:           add class to show field on mobile devices

## Actions
In order to allow user to apply action on selected item you should define `actionButtonsListItems` variable
in the list controller. It should contain list of actions, each of which has following fields

1) title, for example `Add` or `Delete`
2) icon, for example 'fa-plus', which is used as class name of icon, FontAwesome icons are preferred
3) clickFunction - function executed when user clicks on action
4) isDisabled - function which returns boolean value indicating whether this action enabled or not
5) tooltip - function which returns string value
6) isHidden - function which returns boolean value indicating whether this action hidden or not

Action specification is used in `action-button` and `action-list` directive.
Former is used in desktop client, and latter is used in mobile client.

### Action button directive

Action button directive calling looks like:

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

### Action list directive

Action list directive is primarily used in mobile client and its calling looks like:

`<action-list actions="entityButtons" entity="entity" ng-show="expanded"></action-list>`

It has the following parameters:

1) actions - it should correspond to list of actions defined in the list controller
2) entity - this is reference to current list item

## Expandableitem directive

Directive is used to show additional information in list elements.
Directive is placed in entity-list.html file:

`
    <expandableitem ng-if="entityList.expandableOptions"
        ng-repeat="item in entityList.expandableOptions"
        ng-show="expandItem"
        ng-class="{'opened': expandItem}"
        class="list-item-details"
        expandable-element="entity" <!-- entity item -->
        expandable-list="entityList" <!-- entity controller -->
        expandable-options="item"></expandableitem> <!-- options array -->
`

Expandable item shows one section of information, so it is used within a loop to
display multiple sections if necessary.
As entity-list directive, expandableitem requires an object with settings
in corresponding controllers init function:

`
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
`

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
