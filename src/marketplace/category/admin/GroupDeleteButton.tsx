import { marketplaceCategoryGroupsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';

interface GroupDeleteButtonProps {
  row: CategoryGroup;
  refetch;
}

export const GroupDeleteButton = (props: GroupDeleteButtonProps) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) =>
      marketplaceCategoryGroupsDestroy({ path: { uuid: r.uuid } })
    }
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {title} category group?',
        { title: <strong>{r.title}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove category group.')}
    title={translate('Remove')}
  />
);
