import { InfoIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface UpgradeNotificationDialogProps {
  resolve: {
    version: string;
  };
}

export const UpgradeNotificationDialog: FunctionComponent<
  UpgradeNotificationDialogProps
> = ({ resolve: { version } }) => (
  <ModalDialog
    title={translate('Upgrade available')}
    iconNode={<InfoIcon size={28} color="#04bc38" />}
  >
    <div className="modal-body">
      <p>
        {translate('Waldur {version} is now available.', {
          version,
        })}
      </p>
      <p>
        {translate(
          'Your Waldur installation needs to be upgraded. For upgrade instructions, please visit:',
        )}
      </p>
      <ul>
        <li>
          <a
            href="https://docs.waldur.com/latest/admin-guide/deployment/helm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate('For Helm-based deployments')}
          </a>
        </li>
        <li>
          <a
            href="https://docs.waldur.com/latest/admin-guide/deployment/docker-compose/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate('For Docker Compose deployments')}
          </a>
        </li>
      </ul>
    </div>
    <div className="modal-footer d-block px-4 pb-4">
      <CloseDialogButton
        label={translate('Close')}
        className="btn-success w-100 text-center"
      />
    </div>
  </ModalDialog>
);
