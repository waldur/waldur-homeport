import * as React from 'react';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

const gotoCreateProject = () => $state.go('organization.createProject');

export const ProjectCreateField = () => (
  <button
    type="button"
    className="btn btn-default"
    onClick={gotoCreateProject}>
    <i className="fa fa-plus"/>
    {' '}
    {translate('Add project')}
  </button>
);
