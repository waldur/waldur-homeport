// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_permissions_description.py
// Do not edit it manually. All manual changes would be overridden.
import { translate } from '@waldur/i18n';

export const PermissionOptions = [
  {
    label: translate('Call management'),
    options: [
      {
        label: translate('Approve and reject proposals'),
        value: 'CALL.APPROVE_AND_REJECT_PROPOSALS',
      },
      {
        label: translate('Close rounds'),
        value: 'CALL.CLOSE_ROUNDS',
      },
      {
        label: translate('Create call'),
        value: 'CALL.CREATE',
      },
      {
        label: translate('Create permission'),
        value: 'CALL.CREATE_PERMISSION',
      },
      {
        label: translate('Delete permission call'),
        value: 'CALL.DELETE_PERMISSION',
      },
      {
        label: translate('Delete permission proposal'),
        value: 'PROPOSAL.DELETE_PERMISSION',
      },
      {
        label: translate('List call'),
        value: 'CALL.LIST',
      },
      {
        label: translate('List proposal'),
        value: 'PROPOSAL.LIST',
      },
      {
        label: translate('List round'),
        value: 'ROUND.LIST',
      },
      {
        label: translate('Manage proposal'),
        value: 'PROPOSAL.MANAGE',
      },
      {
        label: translate('Manage review'),
        value: 'PROPOSAL.MANAGE_REVIEW',
      },
      {
        label: translate('Update permission call'),
        value: 'CALL.UPDATE_PERMISSION',
      },
      {
        label: translate('Update permission proposal'),
        value: 'PROPOSAL.UPDATE_PERMISSION',
      },
    ],
  },
  {
    label: translate('Customer'),
    options: [
      {
        label: translate('Create customer'),
        value: 'CUSTOMER.CREATE',
      },
      {
        label: translate('Delete customer'),
        value: 'CUSTOMER.DELETE',
      },
      {
        label: translate('List users'),
        value: 'CUSTOMER.LIST_USERS',
      },
      {
        label: translate('Update customer'),
        value: 'CUSTOMER.UPDATE',
      },
    ],
  },
  {
    label: translate('Customer actions for resources'),
    options: [
      {
        label: translate('Accept booking request for resource'),
        value: 'RESOURCE.ACCEPT_BOOKING_REQUEST',
      },
      {
        label: translate('Consumption limitation'),
        value: 'RESOURCE.CONSUMPTION_LIMITATION',
      },
      {
        label: translate('List importable for resource'),
        value: 'RESOURCE.LIST_IMPORTABLE',
      },
      {
        label: translate('List resource'),
        value: 'RESOURCE.LIST',
      },
      {
        label: translate('Reject booking request for resource'),
        value: 'RESOURCE.REJECT_BOOKING_REQUEST',
      },
      {
        label: translate('Set limits for resource'),
        value: 'RESOURCE.SET_LIMITS',
      },
      {
        label: translate('Set plan for resource'),
        value: 'RESOURCE.SET_PLAN',
      },
      {
        label: translate('Terminate resource'),
        value: 'RESOURCE.TERMINATE',
      },
      {
        label: translate('Update options for resource'),
        value: 'RESOURCE.UPDATE_OPTIONS',
      },
    ],
  },
  {
    label: translate('Offering'),
    options: [
      {
        label: translate('Accept call request'),
        value: 'OFFERING.ACCEPT_CALL_REQUEST',
      },
      {
        label: translate('Add endpoint'),
        value: 'OFFERING.ADD_ENDPOINT',
      },
      {
        label: translate('Archive offering'),
        value: 'OFFERING.ARCHIVE',
      },
      {
        label: translate('Archive plan'),
        value: 'OFFERING.ARCHIVE_PLAN',
      },
      {
        label: translate('Create offering'),
        value: 'OFFERING.CREATE',
      },
      {
        label: translate('Create permission'),
        value: 'OFFERING.CREATE_PERMISSION',
      },
      {
        label: translate('Create plan'),
        value: 'OFFERING.CREATE_PLAN',
      },
      {
        label: translate('Create screenshot'),
        value: 'OFFERING.CREATE_SCREENSHOT',
      },
      {
        label: translate('Create user'),
        value: 'OFFERING.CREATE_USER',
      },
      {
        label: translate('Delete endpoint'),
        value: 'OFFERING.DELETE_ENDPOINT',
      },
      {
        label: translate('Delete offering'),
        value: 'OFFERING.DELETE',
      },
      {
        label: translate('Delete permission'),
        value: 'OFFERING.DELETE_PERMISSION',
      },
      {
        label: translate('Delete screenshot'),
        value: 'OFFERING.DELETE_SCREENSHOT',
      },
      {
        label: translate('Delete user'),
        value: 'OFFERING.DELETE_USER',
      },
      {
        label: translate('Dry run script'),
        value: 'OFFERING.DRY_RUN_SCRIPT',
      },
      {
        label: translate('Manage campaign'),
        value: 'OFFERING.MANAGE_CAMPAIGN',
      },
      {
        label: translate('Manage user group'),
        value: 'OFFERING.MANAGE_USER_GROUP',
      },
      {
        label: translate('Manage user role'),
        value: 'OFFERING.MANAGE_USER_ROLE',
      },
      {
        label: translate('Pause offering'),
        value: 'OFFERING.PAUSE',
      },
      {
        label: translate('Unpause offering'),
        value: 'OFFERING.UNPAUSE',
      },
      {
        label: translate('Update attributes'),
        value: 'OFFERING.UPDATE_ATTRIBUTES',
      },
      {
        label: translate('Update components'),
        value: 'OFFERING.UPDATE_COMPONENTS',
      },
      {
        label: translate('Update description'),
        value: 'OFFERING.UPDATE_DESCRIPTION',
      },
      {
        label: translate('Update integration'),
        value: 'OFFERING.UPDATE_INTEGRATION',
      },
      {
        label: translate('Update location'),
        value: 'OFFERING.UPDATE_LOCATION',
      },
      {
        label: translate('Update offering'),
        value: 'OFFERING.UPDATE',
      },
      {
        label: translate('Update options'),
        value: 'OFFERING.UPDATE_OPTIONS',
      },
      {
        label: translate('Update permission'),
        value: 'OFFERING.UPDATE_PERMISSION',
      },
      {
        label: translate('Update plan'),
        value: 'OFFERING.UPDATE_PLAN',
      },
      {
        label: translate('Update restriction for offeringuser'),
        value: 'OFFERINGUSER.UPDATE_RESTRICTION',
      },
      {
        label: translate('Update screenshot'),
        value: 'OFFERING.UPDATE_SCREENSHOT',
      },
      {
        label: translate('Update thumbnail'),
        value: 'OFFERING.UPDATE_THUMBNAIL',
      },
      {
        label: translate('Update user'),
        value: 'OFFERING.UPDATE_USER',
      },
    ],
  },
  {
    label: translate('Order'),
    options: [
      {
        label: translate('Approve order'),
        value: 'ORDER.APPROVE',
      },
      {
        label: translate('Approve private for order'),
        value: 'ORDER.APPROVE_PRIVATE',
      },
      {
        label: translate('Cancel order'),
        value: 'ORDER.CANCEL',
      },
      {
        label: translate('Destroy order'),
        value: 'ORDER.DESTROY',
      },
      {
        label: translate('List order'),
        value: 'ORDER.LIST',
      },
      {
        label: translate('Reject order'),
        value: 'ORDER.REJECT',
      },
    ],
  },
  {
    label: translate('Other'),
    options: [
      {
        label: translate('Create access subnet'),
        value: 'ACCESS_SUBNET.CREATE',
      },
      {
        label: translate('Create lexis link'),
        value: 'LEXIS_LINK.CREATE',
      },
      {
        label: translate('Delete access subnet'),
        value: 'ACCESS_SUBNET.DELETE',
      },
      {
        label: translate('Delete lexis link'),
        value: 'LEXIS_LINK.DELETE',
      },
      {
        label: translate('Update access subnet'),
        value: 'ACCESS_SUBNET.UPDATE',
      },
    ],
  },
  {
    label: translate('Project'),
    options: [
      {
        label: translate('Create project'),
        value: 'PROJECT.CREATE',
      },
      {
        label: translate('Delete project'),
        value: 'PROJECT.DELETE',
      },
      {
        label: translate('List project'),
        value: 'PROJECT.LIST',
      },
      {
        label: translate('Update project'),
        value: 'PROJECT.UPDATE',
      },
    ],
  },
  {
    label: translate('Provider actions'),
    options: [
      {
        label: translate('Create robot account'),
        value: 'RESOURCE.CREATE_ROBOT_ACCOUNT',
      },
      {
        label: translate('Delete robot account'),
        value: 'RESOURCE.DELETE_ROBOT_ACCOUNT',
      },
      {
        label: translate('Generate api secret code'),
        value: 'SERVICE_PROVIDER.GENERATE_API_SECRET_CODE',
      },
      {
        label: translate('List customer projects'),
        value: 'SERVICE_PROVIDER.LIST_CUSTOMER_PROJECTS',
      },
      {
        label: translate('List customers'),
        value: 'SERVICE_PROVIDER.LIST_CUSTOMERS',
      },
      {
        label: translate('List keys'),
        value: 'SERVICE_PROVIDER.LIST_KEYS',
      },
      {
        label: translate('List project permissions'),
        value: 'SERVICE_PROVIDER.LIST_PROJECT_PERMISSIONS',
      },
      {
        label: translate('List projects'),
        value: 'SERVICE_PROVIDER.LIST_PROJECTS',
      },
      {
        label: translate('List user customers'),
        value: 'SERVICE_PROVIDER.LIST_USER_CUSTOMERS',
      },
      {
        label: translate('List users'),
        value: 'SERVICE_PROVIDER.LIST_USERS',
      },
      {
        label: translate('Manage offerings username'),
        value: 'SERVICE_PROVIDER.SET_OFFERINGS_USERNAME',
      },
      {
        label: translate('Manage service account'),
        value: 'SERVICE_ACCOUNT.MANAGE',
      },
      {
        label: translate('Manage users for resource'),
        value: 'RESOURCE.MANAGE_USERS',
      },
      {
        label: translate('Openstack image management for service provider'),
        value: 'SERVICE_PROVIDER.OPENSTACK_IMAGE_MANAGEMENT',
      },
      {
        label: translate('Register service provider'),
        value: 'SERVICE_PROVIDER.REGISTER',
      },
      {
        label: translate('Set backend id for resource'),
        value: 'RESOURCE.SET_BACKEND_ID',
      },
      {
        label: translate('Set backend metadata for resource'),
        value: 'RESOURCE.SET_BACKEND_METADATA',
      },
      {
        label: translate('Set end date for resource'),
        value: 'RESOURCE.SET_END_DATE',
      },
      {
        label: translate('Set state for resource'),
        value: 'RESOURCE.SET_STATE',
      },
      {
        label: translate('Set usage for resource'),
        value: 'RESOURCE.SET_USAGE',
      },
      {
        label: translate('Submit report'),
        value: 'RESOURCE.SUBMIT_REPORT',
      },
      {
        label: translate('Update robot account'),
        value: 'RESOURCE.UPDATE_ROBOT_ACCOUNT',
      },
      {
        label: translate('View api secret code'),
        value: 'SERVICE_PROVIDER.GET_API_SECRET_CODE',
      },
      {
        label: translate('View revenue'),
        value: 'SERVICE_PROVIDER.GET_REVENUE',
      },
      {
        label: translate('View robot account customers'),
        value: 'SERVICE_PROVIDER.GET_ROBOT_ACCOUNT_CUSTOMERS',
      },
      {
        label: translate('View robot account projects'),
        value: 'SERVICE_PROVIDER.GET_ROBOT_ACCOUNT_PROJECTS',
      },
      {
        label: translate('View statistics'),
        value: 'SERVICE_PROVIDER.GET_STATISTICS',
      },
    ],
  },
  {
    label: translate('Team members'),
    options: [
      {
        label: translate('Create permission customer'),
        value: 'CUSTOMER.CREATE_PERMISSION',
      },
      {
        label: translate('Create permission project'),
        value: 'PROJECT.CREATE_PERMISSION',
      },
      {
        label: translate('Delete permission customer'),
        value: 'CUSTOMER.DELETE_PERMISSION',
      },
      {
        label: translate('Delete permission project'),
        value: 'PROJECT.DELETE_PERMISSION',
      },
      {
        label: translate('List invitation'),
        value: 'INVITATION.LIST',
      },
      {
        label: translate('List permission reviews'),
        value: 'CUSTOMER.LIST_PERMISSION_REVIEWS',
      },
      {
        label: translate('Update permission customer'),
        value: 'CUSTOMER.UPDATE_PERMISSION',
      },
      {
        label: translate('Update permission project'),
        value: 'PROJECT.UPDATE_PERMISSION',
      },
    ],
  },
];
