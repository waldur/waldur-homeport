import { translate } from '@waldur/i18n';

const VIRTUAL_MACHINE_NAME_PATTERNS = new RegExp('^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]?$');

export const virtualMachineName = (value: string) =>
  value.length > 15 ? translate('The name must be shorter than 15 characters.') :
  // tslint:disable-next-line:max-line-length
  !value.match(VIRTUAL_MACHINE_NAME_PATTERNS) ? translate('The name can contain only letters, numbers, and hyphens. It should start with a letter and must end with a letter or a number') :
  undefined ;

const SQL_SERVER_NAME_PATTERN = new RegExp('^[a-z0-9][a-z0-9-]+[a-z0-9]$');

export const sqlServerName = (value: string) =>
  // tslint:disable-next-line:max-line-length
  !value.match(SQL_SERVER_NAME_PATTERN) ? translate('The name can only be made up of lowercase letters, numbers and the hyphen. The hyphen may not lead or trail in the name.') :
  undefined ;
