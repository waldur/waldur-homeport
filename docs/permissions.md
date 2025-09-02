# Role-based access control

## Introduction

Waldur authorization system determines what user can do. It consists of permissions and roles. Permission is unique string designating action to be executed. Role is named set of permissions.

Permissions are defined in `PermissionEnum` which is automatically generated from backend code and pushed to fronted code by GitLab CI. Most of the time you're going to use `hasPermission` function which checks, whether user is allowed to perform action on given customer, project or offering. The following example shows how to check whether user is allowed to create offering in organization.

```js
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';

hasPermission(user, {
  permission: PermissionEnum.CREATE_OFFERING,
  customerId: customer.uuid,
})
```

## Migration examples

Previously we have relied on hard-coded roles, such as customer owner and project manager. Migration to dynamic roles on frontend is relatively straightforward process. Consider the following example.

```js
export const AcceptAction = (props) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (!isOwnerOrStaff && !isServiceManager) {
    return null;
  } else {
    return <Button/>;
  }
}
```

As you may see, we have relied on selectors with hard-coded roles. The main drawback of this approach is that it is very hard to inspect who can do what without reading all source code. And it is even hard to adjust this behaviour. Contrary to its name, by using dynamic roles we don't need to care much about roles though.

```js
export const AcceptAction = (props) => {
  if (!hasPermission(user, {
    permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
    customerId: customer.uuid,
  })) {
    return null;
  } else {
    return <Button/>;
  }
}

```

The only prerequisite of course is to ensure that backend uses dynamic roles too.
