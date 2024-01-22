import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { loadConfig } from '@waldur/core/bootstrap';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ManageCommonFooterDialog = lazyComponent(
  () => import('./ManageCommonFooterDialog'),
);

interface ManageCommonFooterButtonProps {
  refetch: () => void;
}

export const ManageCommonFooterButton: FunctionComponent<ManageCommonFooterButtonProps> =
  ({ refetch }) => {
    const dispatch = useDispatch();
    const CommonFooterText = ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT;
    const CommonFooterHtml = ENV.plugins.WALDUR_CORE.COMMON_FOOTER_HTML;

    const openManageDialog = () => {
      dispatch(
        openModalDialog(ManageCommonFooterDialog, {
          size: 'xl',
          resolve: {
            refetch: () => {
              loadConfig().then(() => {
                refetch();
              });
            },
          },
        }),
      );
    };

    return (
      <ActionButton
        action={openManageDialog}
        title={
          CommonFooterText || CommonFooterHtml
            ? translate('Edit footer')
            : translate('Add footer')
        }
        icon={
          CommonFooterText || CommonFooterHtml ? 'fa fa-edit' : 'fa fa-plus'
        }
        variant="primary"
      />
    );
  };
