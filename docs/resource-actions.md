# Resource actions

Initially, workflow for resource action looked as following:
* Generate configuration for resource actions on backend side from serializer.
* In HomePort fetch configuration using OPTIONS request and render action dialog.

Later we needed to implement customization for resource actions on frontend side, including custom form components, validation logic and request serialization. So we merged resource action configuration from backend with frontend customization. Eventually, we came to conclusion that configuration should be specified exclusively on frontend side. So currently we're migrating configuration from backend to frontend.

## Filesystem layout conventions

Consider the following example:

```
openstack/
  instance/
    module.js
    actions/
      index.ts
      CreateBackupScheduleAction.ts
      ChangeFlavorAction.ts
  tenant/
    module.js
    actions/
      index.ts
      ChangePackageAction.ts
      CreateNetworkAction.ts
```

As you can see, each action is declared in separate module. All actions are grouped in `actions` package, which in turn is located in separate resource package. All plugin's resources are grouped in separate plugin module.

## Action declaration

Each action module should define `createAction` function, which takes action context and returns resource action. Action context consists of current user and resource object. It allows you to tweak action configuration depending on user and resource properties, for example:

```javascript
export default function createAction(ctx: ActionContext<OpenStackTenant>): ResourceAction {
  return {
    // ...
    isVisible: ctx.user.is_staff && !tenantHasPackage(ctx.resource),
  };
}
```

There're only 4 mandatory action options: name, title, type and method, for example:

```javascript
export default function createAction(): ResourceAction {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    title: translate('Destroy'),
  };
}
```

* `name` is internal action identifier, it is concatenated to resource URL to build full action endpoint.
* `title` is a localized action identifier, it is rendered in user interface.
* `type` is either 'form' and 'button', action dialog is rendered if type is 'form', otherwise action is executed immediately.
* `method` is a HTTP method, it is used to submit AJAX request against action endpoint.

### Concealing and disabling actions

There're two options which allow you to either hide action or render it as disabled:

* `isVisible` is a boolean parameter, it allows to conceal action, if it should not be rendered at all.
* `validators` is an array of validator functions, each of which accepts action context and returns string with a validation message, it should be used if actions should be rendered as disabled with a detailed explanation. Note that you may use predefined validators, such as `validateState`, `validateRuntimeState` or implement custom validator, for example:

```javascript
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState, validateRuntimeState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Instance is already stopped.');
  }
}

export default function createAction(): ResourceAction {
  return {
    name: 'stop',
    type: 'button',
    method: 'POST',
    title: translate('Stop'),
    validators: [
      validate,
      validateState('OK'),
      validateRuntimeState('ACTIVE'),
    ],
  };
}
```

### Actions for related resources

By default, actions list is rendered as dropdown menu only when user clicks at `Actions` button in resource list or resource details view. However, if action is about managing related resource, it makes more sense to render resource action in the toolbar of related resources list. In this case you shall specify following options:

* `tab` is a string, it should match tab name for related resource specified in resource tab configuration.

```javascript
// waldur-homeport/src/openstack/openstack-tenant/tabs.js
  ResourceTabsConfigurationProvider.register('OpenStack.Tenant', {
    order: [
      'networks',
    ],
    options: {
      networks: {
        heading: gettext('Networks'),
        component: 'openstackTenantNetworks'
      },
    }
  });

  // waldur-homeport/src/openstack/openstack-tenant/actions/CreateNetworkAction.ts
  export default function createAction(): ResourceAction {
    return {
      name: 'create_network',
      type: 'form',
      method: 'POST',
      tab: 'networks',
      title: translate('Create'),
      dialogTitle: translate('Create network for OpenStack tenant'),
      iconClass: 'fa fa-plus',
    };
  }
```
* `iconClass` is an optional string, which should specify font icon, usually FontAwesome icon, it is rendered in the button for that action.

### Rendering resource action dialog

If action's `type` is 'form', modal dialog is rendered. By default, it's assumed that input data is collected via form rendered from `fields` parameter. You may control modal dialog contents and appearance:

* `dialogTitle` is a localized string, it is rendered in standard modal dialog header. Note, that by default action `title` is rendered.
* `dialogSize` is a string which allows to toggle rendering of large modal dialog by specifying `lg` value.
* `component` is an optional string, it should correspond to the name of the custom resource action component declared in AngularJS. Eventually, it would be replaced with ReactJS component reference.
* `useResolve` is a boolean value, which allows you to toggle input parameters binding for custom action dialog. By convention, if component is defined as an AngularJS component, `useResolve` should be true. Consequently, if component is defined as an AngularJS directive, `useResolve` should be false.

## Rendering action form

By convention, form for resource action is rendered using `fields` parameter, which should specify array of action fields. It is assumed that each action field has at least name and type. 

* `name` is internal field identifier, it is used as a key in JSON object for resource action request.
* `label` is a localized action identifier, it is rendered in user interface. By default, if it is not provided, name is used instead.
* `type` is either 'string', 'text' or 'integer'. Depending on the field type, additional parameters should be specified. By default, if it is not provided, 'string' type is used instead.
* `required` is a boolean value, it allows to declare mandatory fields, which are rendered with red asterisk indicator so that it would be clear for the user which fields to fill first.
* `help_text` is a localized help text for the field, it is rendered as muted text under the field.
* `placeholder` allows to indicate example value for the field.
* `default_value` is a value, if it is defined, it is filled by default as field's value.
* `resource_default_value` is a boolean flag, if it is defined, the corresponding value is copied from resource, if it exists. It is useful, for example, in the edit action.
* `init` is a callback with field and resource parameters, it allows to modify any attribute of the field when action form is initialized.
