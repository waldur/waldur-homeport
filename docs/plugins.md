## Plugins

You can extend Waldur HomePort by writing your own plugins.
All plugins are built statically as part of the main app in the single bundle,
so whenever you modify your plugin you should rebuild the whole app too.

1. Setup a Waldur HomePort development environment.
2. Create new directory with module.js file in src/plugins directory:
For example, put following code in src/plugins/my-plugin/module.js

```javascript
// @ngInject
function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return [
      {
        label: 'Custom link label',
        link: 'project.custom({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-vcard',
      }
    ];
  });
}

// @ngInject
function registerRoutes($stateProvider) {
  $stateProvider
    .state('project.custom', {
      url: 'custom/',
      template: '<my-custom-component></my-custom-component>',
    });
}

const myCustomComponent = {
  template: '<p ng-if="$ctrl.user">Current user name is {{ $ctrl.user.username }}</p>',
  controller: class ComponentController {
    // @ngInject
    constructor(usersService) {
      this.usersService = usersService;
    }

    $onInit() {
      this.usersService.getCurrentUser().then(user => this.user = user);
    }
  }
};

// @ngInject
function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('organization-dashboard-button', 'My button');
}

export default module => {
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  module.config(registerRoutes);
  module.component('myCustomComponent', myCustomComponent);
};
```

As you can see, you may implement custom functionality using following mechanism:

* inject custom link in sidebar in user, project, organization or support workspace;
* register custom state using Angular-UI router;
* register custom Angular 1.5 component;
* inject data from REST API services into component's template;
* inject custom code into existing components using extension points.

There are few important notes:
* module.js should export module callback function as the default export;
* all functions which use Angular services, and Angular component controller constructors,
should have `// @ngInject` annotation, otherwise Angular dependency injection would fail.
