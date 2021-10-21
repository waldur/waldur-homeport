# Sidebar customization

In Waldur HomePort there are 4 workspaces. Eeach workspace has it's own sidebar. Sidebar consists of list of sidebar items. There are two sources where sidebar items are defined: base and plugins.

Following are the links to the base definitions of sidebar items for each workspace.

* [user workspace](../src/user/UserSidebar.tsx)
* [project workspace](../src/project/ProjectSidebar.tsx)
* [organization workspace](../src/customer/workspace/CustomerSidebar.tsx)
* [support workspace](../src/issues/workspace/SupportSidebar.tsx)

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
