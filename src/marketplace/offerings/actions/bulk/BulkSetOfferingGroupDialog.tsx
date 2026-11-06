import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsSetOfferingGroup,
  OfferingGroup,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { OfferingGroupField } from '../OfferingGroupField';

import { SelectedOfferingsSummary } from './SelectedOfferingsSummary';
import {
  BulkOfferingsDialogResolve,
  useOfferingBatch,
} from './useOfferingBatch';

interface FormValues {
  offering_group: OfferingGroup | null;
}

/**
 * Puts the offerings in one group, or takes them out of theirs. A group
 * belongs to an organization and holds only that organization's offerings, so
 * the menu opens this only for offerings of a single organization.
 */
export const BulkSetOfferingGroupDialog: FunctionComponent<{
  resolve: BulkOfferingsDialogResolve & { customerUuid: string };
}> = ({
  resolve: { offerings, skippedNote, customerUuid, table, refetch },
}) => {
  const batch = useOfferingBatch({ table, refetch, closeModal: true });

  const onSubmit = (values: FormValues) => {
    const group = values.offering_group;
    return batch.submit({
      offerings,
      run: (offering) =>
        marketplaceProviderOfferingsSetOfferingGroup({
          path: { uuid: offering.uuid },
          body: { offering_group: group?.uuid ?? null },
        }),
      successMessage: (count) =>
        group
          ? translate('{count} offering(s) have been added to {group}.', {
              count,
              group: group.title,
            })
          : translate(
              '{count} offering(s) have been removed from their group.',
              {
                count,
              },
            ),
      failureMessage: (count) =>
        translate('Unable to update the group of {count} offering(s).', {
          count,
        }),
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={{ offering_group: null }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set offering group')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <SelectedOfferingsSummary
                targets={offerings}
                skippedNote={skippedNote}
              />
              <OfferingGroupField
                customerUuid={customerUuid}
                disabled={submitting}
                description={translate(
                  'Leave empty to take the offerings out of their group.',
                )}
                spaceless
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
