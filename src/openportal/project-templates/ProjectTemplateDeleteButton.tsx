import { FC } from 'react';
import { openportalProjectTemplateDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

export const ProjectTemplateDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      openportalProjectTemplateDestroy({ path: { uuid: r.uuid } })
    }
    refetch={refetch}
    confirmTitle={translate('Delete project template')}
    confirmMessage={translate(
      'Are you sure you would like to delete this project template?',
    )}
    successMessage={translate('Project template has been deleted.')}
    errorMessage={translate('Unable to delete this project template.')}
  />
);
