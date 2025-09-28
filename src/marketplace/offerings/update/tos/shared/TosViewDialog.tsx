import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const TosViewDialog = ({ resolve: { tos } }) => {
  return (
    <ModalDialog
      title={translate('View ToS {version}', { version: tos.version })}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {tos.terms_of_service && (
        <div className="mb-4">
          <h5 className="mb-3">{translate('Terms of service content')}</h5>
          <div className="border rounded tos-content-preview">
            <SafeMarkdown text={tos.terms_of_service} />
          </div>
        </div>
      )}

      {tos.terms_of_service_link && (
        <div className="mb-3">
          <strong>{translate('External link:')}</strong>
          <div className="mt-2">
            <a
              href={tos.terms_of_service_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              {tos.terms_of_service_link}
            </a>
          </div>
        </div>
      )}
    </ModalDialog>
  );
};
