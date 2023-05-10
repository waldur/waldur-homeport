import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
} from '@waldur/workspace/types';

const DocumentSearchIllustration = require('@waldur/images/table-placeholders/undraw_file_searching_duff.svg');

const stateSelector = (state: RootState) => {
  const workspace = getWorkspace(state);
  if (workspace === ORGANIZATION_WORKSPACE) {
    return 'marketplace-landing-customer';
  } else if (workspace === PROJECT_WORKSPACE) {
    return 'marketplace-landing-project';
  } else {
    return 'marketplace-landing-user';
  }
};

export const OrderItemslistTablePlaceholder: FunctionComponent = () => {
  const state = useSelector(stateSelector);

  return (
    <ImageTablePlaceholder
      illustration={DocumentSearchIllustration}
      title={translate(`Seems there's nothing here`)}
      description={translate(
        `You can find offerings to order in the marketplace`,
      )}
      action={
        <Link state={state} className="btn btn-success btn-md">
          {translate('Go to marketplace')}
        </Link>
      }
    />
  );
};
