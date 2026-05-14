import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { Field } from '@/resource/summary';

export const ResourceOrderErrorDialog = ({ resolve }) => {
  const { error_message, error_traceback } = resolve.resource.creation_order;
  return (
    <ModalDialog title={translate('Order errors')}>
      <Field label={translate('Error message')}>
        {error_message || translate('No error message reported.')}
      </Field>
      {error_traceback ? (
        <Field label={translate('Error traceback')} valueClass="text-pre">
          <div style={{ height: 300, overflow: 'scroll' }}>
            {error_traceback}
          </div>
        </Field>
      ) : (
        <Field label={translate('Error traceback')}>
          {translate(
            'Detailed traceback is visible to support staff only. Please contact support if you need more information.',
          )}
        </Field>
      )}
    </ModalDialog>
  );
};
