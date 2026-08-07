import { debounce } from 'lodash-es';
import { projectsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

const getProjectNameRegex = (): { regex: string; message: string } => ({
  regex: ENV.plugins?.WALDUR_CORE?.PROJECT_NAME_REGEX || '',
  message: ENV.plugins?.WALDUR_CORE?.PROJECT_NAME_REGEX_ERROR_MESSAGE || '',
});

// Human-readable hint for the configured project-name pattern, or undefined when
// no restriction is set. Shown as a tooltip on the project name field.
export const getProjectNameRestrictionHint = (): string | undefined => {
  const { regex, message } = getProjectNameRegex();
  if (!regex) {
    return undefined;
  }
  return (
    message ||
    translate('Project name must match the pattern: {pattern}', {
      pattern: regex,
    })
  );
};

// Mirror the backend PROJECT_NAME_REGEX check (a full-string match) so the user
// gets immediate feedback. An invalid pattern is an admin misconfiguration and
// is skipped, matching the backend.
//
// Exported for the proposal name field: a proposal name becomes part of the
// project name created on approval, and ProposalSerializer.validate_name holds
// it to this same pattern.
export const checkProjectNameRegex = (value: string) => {
  const { regex, message } = getProjectNameRegex();
  if (!regex) {
    return undefined;
  }
  try {
    if (!new RegExp(`^(?:${regex})$`).test(value)) {
      return (
        message ||
        translate('Project name does not match the required pattern.')
      );
    }
  } catch {
    // Invalid regex configured; leave enforcement to the backend.
  }
  return undefined;
};

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
  return checkProjectNameRegex(value);
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
