# Action dialog

## Submit button

Action form is build dynamically which makes it hard to determine whether form data has been changed.
There are 2 things have been made to improve form state management:

- It is assumed that DELETE actions do not have any complex data in the form and can be fired immediately as form is open.

- Form is passed to action-field which allows component to modify form state (see openstack-instance-floating-ips for example).
