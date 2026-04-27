import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  CourseAccount,
  marketplaceCourseAccountsDestroy,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface OwnProps {
  row: CourseAccount;
  refetch;
}

export const CourseAccountDeleteAction = ({ row, refetch }: OwnProps) => {
  const dispatch = useDispatch();
  const { mutate: callback, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate(
            'Are you sure you want to delete the {name} course account?',
            {
              name: (
                <strong>{row.project_name || row.email || row.username}</strong>
              ),
            },
            formatJsxTemplate,
          ),
          { forDeletion: true, size: 'sm' },
        );
      } catch {
        return;
      }

      try {
        await marketplaceCourseAccountsDestroy({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('Course account has been deleted.')));
        refetch();
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to delete course account.')),
        );
      }
    },
  });

  return (
    <ActionItem
      action={callback}
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      disabled={isPending || row.state === 'Closed'}
      tooltip={
        row.state === 'Closed'
          ? translate('Cannot delete closed course account.')
          : undefined
      }
    />
  );
};
