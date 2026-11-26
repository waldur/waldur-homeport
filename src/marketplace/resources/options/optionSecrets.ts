import { Resource } from 'waldur-js-client';

/** Whether the resource's offering has secret options, whose status it lists. */
export const hasOptionSecrets = (resource: Pick<Resource, 'option_secrets'>) =>
  Object.keys(resource?.option_secrets || {}).length > 0;
