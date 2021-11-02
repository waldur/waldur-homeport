import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getAllOrganizationDivisions } from '@waldur/marketplace/common/api';
import { SetAccessPolicyDialogForm } from '@waldur/marketplace/offerings/actions/SetAccessPolicyDialogForm';
import { Offering } from '@waldur/marketplace/types';

interface SetAccessPolicyDialogProps {
  resolve: { offering: Offering };
}

export const SetAccessPolicyDialog: FunctionComponent<SetAccessPolicyDialogProps> =
  ({ resolve }) => {
    const {
      loading,
      error,
      value: divisions,
    } = useAsync(async () => await getAllOrganizationDivisions(), [resolve]);
    return loading ? (
      <LoadingSpinner />
    ) : error ? (
      <>{translate('Unable to load divisions.')}</>
    ) : (
      <SetAccessPolicyDialogForm
        divisions={divisions}
        offering={resolve.offering}
      />
    );
  };
