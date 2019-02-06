import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';

const PureAzureSQLServerSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Username')}
        value={resource.username}
      />
      <Field
        label={translate('Password')}
        value={<UserPassword {...props}/>}
      />
    </>
  );
};

export const AzureSQLServerSummary = withTranslation(PureAzureSQLServerSummary);
