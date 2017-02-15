Web applications usually allow user to manage lists of things,
for example list of customers, projects or resources.

We have implemented several AngularJS directives in order to:

 1. render multi-column lists for both desktop and mobile clients

 2. apply action to selected item

 3. paginate through large list

 4. expand item in order to receive more information without switching to another view

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

 4. entity-options - object with list of field properties.

entityOptions object is defined in controller. entityOptions.list is list of fields to display, it is described in column specification section of documentation. entityOptions sample:

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

## Column specification

Column types are constants in ENTITYLISTFIELDTYPES object. Each column type has list of fields for proper display:

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

## Actions specification

In order to allow user to apply action on selected item you should define `actionButtonsListItems` variable
in the list controller. It should contain list of actions, each of which has following fields

 1. title, for example `Add` or `Delete`

 2. icon, for example 'fa-plus', which is used as class name of icon, FontAwesome icons are preferred

 3. clickFunction - function executed when user clicks on action

 4. isDisabled - function which returns boolean value indicating whether this action enabled or not

 5. tooltip - function which returns string value

 6. isHidden - function which returns boolean value indicating whether this action hidden or not

Action specification is used in `action-button` and `action-list` directive.
Former is used in desktop client, and latter is used in mobile client.

### Action button directive

Action button directive is primarily used in desktop client and its call looks like:

<action-button button-list="CustomerList.actionButtonsListItems"
    button-controller="CustomerList"
    button-model="customer"></action-button>

The attributes of the directive are as following:

 1. button-controller - controller of list page

 2. button-model - model of item

 3. button-type - type for action button directive. Either 'refresh' or usual button list.
