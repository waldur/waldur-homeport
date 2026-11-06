import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { MoveOfferingFields } from '../../list/MoveOfferingFields';

import { SelectedOfferingsSummary } from './SelectedOfferingsSummary';
import {
  BulkOfferingsDialogResolve,
  useOfferingBatch,
} from './useOfferingBatch';

interface FormValues {
  organization?: { name: string; url: string };
  preserve_permissions: boolean;
}

export const BulkMoveOfferingsDialog: FunctionComponent<{
  resolve: BulkOfferingsDialogResolve;
}> = ({ resolve: { offerings, skippedNote, table, refetch } }) => {
  const batch = useOfferingBatch({ table, refetch, closeModal: true });

  const onSubmit = (values: FormValues) =>
    batch.submit({
      offerings,
      run: (offering) =>
        marketplaceProviderOfferingsMoveOffering({
          path: { uuid: offering.uuid },
          body: {
            customer: values.organization.url,
            preserve_permissions: values.preserve_permissions,
          },
        }),
      successMessage: (count) =>
        translate(
          '{count} offering(s) have been moved to {organizationName} organization.',
          { count, organizationName: values.organization.name },
        ),
      failureMessage: (count) =>
        translate('Unable to move {count} offering(s).', { count }),
    });

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move offerings')}
            footer={<FormFooter submitLabel={translate('Move')} />}
          >
            <div className="flex flex-col gap-4">
              <SelectedOfferingsSummary
                targets={offerings}
                skippedNote={skippedNote}
              />
              <div>
                <MoveOfferingFields submitting={submitting} spaceless />
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
