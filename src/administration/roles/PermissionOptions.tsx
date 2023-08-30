import { translate } from '@waldur/i18n';

export const PermissionOptions = [
  {
    label: translate('Offering'),
    options: [
      {
        label: translate('Update offering thumbnail'),
        value: 'OFFERING.UPDATE_THUMBNAIL',
      },
      {
        label: translate('Update offering'),
        value: 'OFFERING.UPDATE',
      },
      {
        label: translate('Update offering attributes'),
        value: 'OFFERING.UPDATE_ATTRIBUTES',
      },
      {
        label: translate('Update offering location'),
        value: 'OFFERING.UPDATE_LOCATION',
      },
      {
        label: translate('Update offering description'),
        value: 'OFFERING.UPDATE_DESCRIPTION',
      },
      {
        label: translate('Update offering overview'),
        value: 'OFFERING.UPDATE_OVERVIEW',
      },
      {
        label: translate('Update offering options'),
        value: 'OFFERING.UPDATE_OPTIONS',
      },
      {
        label: translate('Update offering secret options'),
        value: 'OFFERING.UPDATE_SECRET_OPTIONS',
      },
      {
        label: translate('Add offering endpoint'),
        value: 'OFFERING.ADD_ENDPOINT',
      },
      {
        label: translate('Delete offering endpoint'),
        value: 'OFFERING.DELETE_ENDPOINT',
      },
      {
        label: translate('Update offering components'),
        value: 'OFFERING.UPDATE_COMPONENTS',
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
        label: translate('Archive offering'),
        value: 'OFFERING.ARCHIVE',
      },
      {
        label: translate('Dry run offering script'),
        value: 'OFFERING.DRY_RUN_SCRIPT',
      },
      {
        label: translate('Manage campaign'),
        value: 'OFFERING.MANAGE_CAMPAIGN',
      },
      {
        label: translate('Manage offering user group'),
        value: 'OFFERING.MANAGE_USER_GROUP',
      },
    ],
  },
  {
    label: translate('Order'),
    options: [
      { label: translate('Approve order'), value: 'ORDER.APPROVE' },
      {
        label: translate('Approve private order'),
        value: 'ORDER.APPROVE_PRIVATE',
      },
      { label: translate('Reject order'), value: 'ORDER.REJECT' },

      { label: translate('Approve order item'), value: 'ORDER_ITEM.APPROVE' },
      { label: translate('Reject order item'), value: 'ORDER_ITEM.REJECT' },
      { label: translate('Destroy order item'), value: 'ORDER_ITEM.DESTROY' },
      {
        label: translate('Terminate order item'),
        value: 'ORDER_ITEM.TERMINATE',
      },
    ],
  },
  {
    label: translate('Resource'),
    options: [
      { label: translate('Terminate resource'), value: 'RESOURCE.TERMINATE' },
      {
        label: translate('List importable resources'),
        value: 'RESOURCE.LIST_IMPORTABLE',
      },
      {
        label: translate('Set resource end date'),
        value: 'RESOURCE.SET_END_DATE',
      },
      { label: translate('Set resource usage'), value: 'RESOURCE.SET_USAGE' },
      { label: translate('Switch resource plan'), value: 'RESOURCE.SET_PLAN' },
      {
        label: translate('Update resource limits'),
        value: 'RESOURCE.SET_LIMITS',
      },
      {
        label: translate('Set resource backend id'),
        value: 'RESOURCE.SET_BACKEND_ID',
      },
      {
        label: translate('Submit resource report'),
        value: 'RESOURCE.SUBMIT_REPORT',
      },
      { label: translate('List resource users'), value: 'RESOURCE.LIST_USERS' },
      {
        label: translate('Complete resource downscaling'),
        value: 'RESOURCE.COMPLETE_DOWNSCALING',
      },
      {
        label: translate('Accept booking request'),
        value: 'RESOURCE.ACCEPT_BOOKING_REQUEST',
      },
      {
        label: translate('Reject booking request'),
        value: 'RESOURCE.REJECT_BOOKING_REQUEST',
      },
    ],
  },
];
