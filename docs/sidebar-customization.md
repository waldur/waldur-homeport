# Sidebar customization

In Waldur HomePort there are 4 workspaces. Eeach workspace has it's own sidebar. Sidebar consists of list of sidebar items. There are two sources where sidebar items are defined: base and plugins.

Following are the links to the base definitions of sidebar items for each workspace.
* [user workspace](../src/user/constants.js)
* [project workspace](../src/project/project-workspace.js)
* [organization workspace](../src/customer/workspace/customer-workspace.js)
* [support workspace](../src/issues/workspace/issue-navigation-service.js)

## Sidebar structure

Plugins are allowed to inject custom items into sidebar. Sidebar item has following fields:
* icon - class name for FontAwesome icon;
* label - translatable string displayed to the user;
* key - optional unique string identifier;
* link - optional string, which specifies state as it is described by Angular-UI router;
* index - optional integer value used for items ordering;
* feature - optional string which specifies feature name, it allows to conceal sidebar item if feature is disabled;
* action - optional callback function which gets called whenever sidebar item is clicked;
* orderByLabel - optional boolean value, it allow to order sidebar items lexicographically by name, disabled by default;
* children - optional list of sidebar items, each item has the same structure, nested items are not allowed;
* countFieldKey - optional string, allows to render counter value returned by counters endpoint.

Consider the following example:
```json
  {
    "label": "Providers",
    "icon": "fa-database",
    "link": "organization.providers({uuid: $ctrl.context.customer.uuid})",
    "feature": "providers",
    "countFieldKey": "services",
    "index": 200,
  }
```

## Project workspace sidebar

Waldur HomePort allows to render sidebar items in the project workspace depending on project's type.
Consider the following snippet from config.json:
```json
  "sidebarItemsByProjectType": {
    "Basic": [
      "dashboard",
      "appstore",
      "resources",
      "vms",
      "private_clouds",
      "storages"
    ],
    "Enterprise": [
      "dashboard",
      "eventlog",
      "team"
    ]
  }
```

As you may see, each project type name specifies white list of allowed sidebar items.
If project does not have project type yet, or if sidebar configuration is not defined for that project type yet, all sidebar items are displayed by default. Otherwise, only sidebar items with specified keys are displayed only.
