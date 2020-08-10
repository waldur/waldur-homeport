import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { getYAML } from '../api';

import { ViewYAMLPanel } from './ViewYAMLPanel';

export const ViewYAMLDialog = ({ resolve }) => {
  const { loading, error, value } = useAsync(() =>
    getYAML(resolve.resource.url),
  );
  return (
    <ModalDialog
      title={translate('View/edit YAML')}
      footer={<CloseDialogButton />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div>{translate('Unable to load data.')}</div>
      ) : (
        <ViewYAMLPanel yaml={value.yaml} />
      )}
    </ModalDialog>
  );
};
