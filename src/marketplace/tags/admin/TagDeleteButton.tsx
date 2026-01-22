import { marketplaceTagsDestroy, Tag } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { formatJsxTemplate, translate } from '@waldur/i18n';

interface TagDeleteButtonProps {
  row: Tag;
  refetch: () => void;
}

export const TagDeleteButton = (props: TagDeleteButtonProps) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) => marketplaceTagsDestroy({ path: { uuid: r.uuid } })}
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {name} tag?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove tag.')}
    title={translate('Remove')}
  />
);
