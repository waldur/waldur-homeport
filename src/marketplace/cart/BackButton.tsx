import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

export const BackButton: React.FC = () => {
  const workspace = useSelector(getWorkspace);
  const router = useRouter();

  const goBack = () => {
    if (workspace === ORGANIZATION_WORKSPACE) {
      router.stateService.go('marketplace-landing-customer');
    } else {
      router.stateService.go('marketplace-landing');
    }
  };

  return (
    <ActionButton
      title={translate('Back to shopping')}
      icon="fa fa-arrow-left"
      className="btn btn-outline btn-default"
      action={goBack}
    />
  );
};
