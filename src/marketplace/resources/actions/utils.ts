import { translate } from '@/i18n/translate';
import { ActionContext } from '@/resource/actions/types';

import { ResourceAction } from './constants';

export const validateStaffAction = (ctx: ActionContext) => {
  if (ctx?.user?.is_staff) {
    return;
  }
  return translate('Only staff users are allowed to perform this action.');
};

export const getMarketplaceResourceUuid = (resource) =>
  resource.marketplace_resource_uuid ||
  (resource.offering_type ? resource.uuid : null);

export const getResourceActionOptions = () =>
  [
    { value: ResourceAction.SWITCH_PLAN, label: translate('Change plan') },
    {
      value: ResourceAction.CREATE_ROBOT_ACCOUNT,
      label: translate('Create robot account'),
    },
    { value: ResourceAction.MOVE_RESOURCE, label: translate('Move') },
    { value: ResourceAction.REPORT_USAGE, label: translate('Report usage') },
    { value: ResourceAction.SET_AS_ERRED, label: translate('Set as erred') },
    {
      value: ResourceAction.UPDATE_BACKEND_ID,
      label: translate('Set backend ID'),
    },
    { value: ResourceAction.SET_SLUG, label: translate('Set slug') },
    {
      value: ResourceAction.EDIT_TERMINATION_DATE,
      label: translate('Set termination date'),
    },
    { value: ResourceAction.SHOW_USAGE, label: translate('Show usage') },
    { value: ResourceAction.SUBMIT_REPORT, label: translate('Submit report') },
    { value: ResourceAction.SYNCHRONIZE, label: translate('Synchronise') },
    { value: ResourceAction.TERMINATE, label: translate('Terminate') },
    { value: ResourceAction.UNLINK, label: translate('Unlink') },
    { value: ResourceAction.UPDATE_LIMITS, label: translate('Update limits') },
    {
      value: ResourceAction.VERSION_HISTORY,
      label: translate('Version history'),
    },
    { value: ResourceAction.VIEW_DETAILS, label: translate('View details') },
  ].sort((a, b) => a.label.localeCompare(b.label));
