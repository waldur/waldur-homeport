import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { withFeature } from '@waldur/features/connect';
import HelpRegistry from '@waldur/help/help-registry';

export const PureProviderHelpLink = ({ translate, type, isVisible }) =>
  (isVisible('help') && HelpRegistry.hasItem('providers', type.name)) ? (
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-5">
        <Link
          state="help.details"
          params={{type: 'providers', name: type.name}}
          label={translate('How to obtain credentials')}/>
      </div>
    </div>
  ) : null;

export const ProviderHelpLink = withFeature(PureProviderHelpLink);
