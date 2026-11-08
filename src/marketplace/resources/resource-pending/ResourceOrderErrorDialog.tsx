import { Resource } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

export const ResourceOrderErrorDialog = ({
  resolve,
}: {
  resolve: { resource: Resource };
}) => {
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
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Error message')}
          value={error_message}
          placeholder={translate('No error message reported.')}
          hideIfEmpty={false}
        />
        {tracebackVisible ? (
          <PropertyItem
            label={translate('Error traceback')}
            valueClass="whitespace-pre"
          >
            {error_traceback ? (
              <div className="overflow-scroll h-[300px]">{error_traceback}</div>
            ) : (
              translate('No traceback recorded for this order.')
            )}
          </PropertyItem>
        ) : (
          <PropertyItem label={translate('Error traceback')}>
            {translate(
              'Detailed traceback is visible to support staff only. Please contact support if you need more information.',
            )}
          </PropertyItem>
        )}
      </PropertyList>
    </ModalDialog>
  );
};
