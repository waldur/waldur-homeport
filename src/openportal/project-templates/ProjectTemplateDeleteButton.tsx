import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { openportalProjectTemplateDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ProjectTemplateDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete project template'),
        translate(
          'Are you sure you would like to delete this project template?',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await openportalProjectTemplateDestroy({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Project template has been deleted.')));
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to delete this project template.'),
        ),
      );
    }
  };

  const [{ loading }, callback] = useAsyncFn(action);

  return (
    <ActionItem
      title={translate('Delete')}
      disabled={loading}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
