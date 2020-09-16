import * as React from 'react';

import { translate } from '@waldur/i18n';

import { useCreateOrganization } from './utils';

export const CreateOrganizationButton = () => {
  const [enabled, onClick] = useCreateOrganization();
  if (!enabled) {
    return null;
  }
  return (
    <a
      className="pull-right btn btn-sm btn-default"
      onClick={onClick}
      id="add-new-organization"
    >
      <i className="fa fa-plus" /> {translate('Add new')}{' '}
      <span className="hidden-xs">{translate('organization')}</span>
    </a>
  );
};
