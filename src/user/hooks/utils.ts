import * as React from 'react';
import { useDispatch } from 'react-redux';

import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { updateEntity, createEntity } from '@waldur/table-react/actions';

import { getEventGroups, updateHook, createHook } from './api';
import { HOOK_LIST_ID } from './constants';
import {
  EventGroupOption,
  HookType,
  HookResponse,
  HookFormData,
} from './types';

export const formatEventTitle = choice => {
  const map = {
    ssh: 'SSH',
    jira: 'JIRA',
    vms: 'Resources',
    customers: 'Organizations',
  };
  if (map[choice]) {
    choice = map[choice];
  } else {
    choice = titleCase(choice.replace('_', ' '));
  }
  return choice + ' events';
};

export const loadEventGroupsOptions: () => Promise<
  EventGroupOption[]
> = async () => {
  const groups = await getEventGroups();
  const options = Object.keys(groups)
    .map(key => ({
      key,
      title: formatEventTitle(key),
      help_text: groups[key].join(', '),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return options;
};

export const getInitialValue = hook =>
  hook
    ? {
        is_active: hook.is_active,
        hook_type: hook.hook_type as HookType,
        email: hook.email,
        destination_url: hook.destination_url,
        event_groups: hook.event_groups.reduce(
          (result, group) => ({ ...result, [group]: true }),
          {},
        ),
      }
    : {
        hook_type: 'webhook' as HookType,
        event_groups: {},
      };

const serializeHook = (hookType: HookType, formData: HookFormData) => {
  const payload: Partial<HookResponse> = {
    hook_type: hookType,
    is_active: formData.is_active,
    event_groups: Object.keys(formData.event_groups),
  };
  if (hookType === 'email') {
    payload.email = formData.email;
  } else if (hookType === 'webhook') {
    payload.destination_url = formData.destination_url;
  }
  return payload;
};

export const useHookForm = (hook?: HookResponse) => {
  const dispatch = useDispatch();
  return React.useCallback(
    async (formData: HookFormData) => {
      const hookType = hook ? hook.hook_type : formData.hook_type;
      if (hook) {
        try {
          const response = await updateHook(
            hook.uuid,
            hook.hook_type,
            serializeHook(hookType, formData),
          );
          dispatch(updateEntity(HOOK_LIST_ID, hook.uuid, response.data));
          dispatch(showSuccess(translate('Notification has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to update notification.')));
        }
      } else {
        try {
          const response = await createHook(
            hookType,
            serializeHook(hookType, formData),
          );
          dispatch(
            createEntity(HOOK_LIST_ID, response.data.uuid, response.data),
          );
          dispatch(showSuccess(translate('Notification has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to create notification.')));
        }
      }
    },
    [hook, dispatch],
  );
};
