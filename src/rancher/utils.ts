import { translate } from '@waldur/i18n';

const CLUSTER_NAME_PATTERN = new RegExp('^[a-z0-9]([-a-z0-9])+[a-z0-9]$');

export const rancherClusterName = (value: string) =>
  // tslint:disable-next-line:max-line-length
  !value.match(CLUSTER_NAME_PATTERN) ? translate('Name must consist of lower case alphanumeric characters.') :
  undefined ;
