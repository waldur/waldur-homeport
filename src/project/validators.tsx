import debounce from 'lodash/debounce';
import { projectsList } from 'waldur-js-client';

import { translate } from '@/i18n';

const checkPattern = (value: string) => {
  if (!value) {
    return translate('Name is required field.');
  }
  const length = value.trim().length;
  if (length < 3) {
    return translate('Name should contain at least 3 symbols.');
  }
  if (length > 500) {
    return translate('Must be 500 characters or less.');
  }
};

// State for debounced validation
let pendingResolve: ((result: string | undefined) => void) | null = null;

const debouncedCheckDuplicate = debounce(
  async (
    value: string,
    customerUuid: string,
    projectUuid: string | undefined,
    resolve: (result: string | undefined) => void,
  ) => {
    // Only proceed if this is still the pending validation
    if (pendingResolve !== resolve) {
      resolve(undefined);
      return;
    }

    try {
      const response = await projectsList({
        query: {
          name: value,
          customer: [customerUuid],
        },
      });
      const exactMatch = response.data.find(
        (project) => project.name === value && project.uuid !== projectUuid,
      );
      resolve(
        exactMatch
          ? translate('Name is duplicated. Choose other name.')
          : undefined,
      );
    } catch {
      resolve(undefined);
    } finally {
      if (pendingResolve === resolve) {
        pendingResolve = null;
      }
    }
  },
  500,
);

const checkDuplicate = (value: string, props): Promise<string | undefined> => {
  const customerUuid = props.customer?.uuid;
  const projectUuid = props.project_uuid;

  return new Promise((resolve) => {
    // Cancel previous pending validation
    if (pendingResolve) {
      pendingResolve(undefined);
    }
    pendingResolve = resolve;

    debouncedCheckDuplicate(value, customerUuid, projectUuid, resolve);
  });
};

export const validateProjectName = (value, props) => {
  const error = checkPattern(value);
  if (error) {
    return error;
  }
  if (!props.customer?.uuid) {
    return undefined;
  }
  return checkDuplicate(value, props);
};
