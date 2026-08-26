import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { Field } from '@/resource/summary';

export const ResourceOrderErrorDialog = ({ resolve }) => {
  const creationOrder = resolve.resource.creation_order;
  const { error_message, error_traceback } = creationOrder;
  const tracebackVisible = 'error_traceback' in creationOrder;
  return (
    <ModalDialog
      title={translate('Order errors')}
      subtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resolve.resource.name}
        />
      }
    >
      <Field label={translate('Error message')}>
        {error_message || translate('No error message reported.')}
      </Field>
      {tracebackVisible ? (
        <Field label={translate('Error traceback')} valueClass="text-pre">
          {error_traceback ? (
            <div style={{ height: 300, overflow: 'scroll' }}>
              {error_traceback}
            </div>
          ) : (
            translate('No traceback recorded for this order.')
          )}
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
