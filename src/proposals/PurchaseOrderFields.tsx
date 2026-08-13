import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { FormGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { AttachmentRow } from '@/marketplace/resources/common/AttachmentRow';

interface PurchaseOrderFieldsProps {
  /** The call demands one, so the proposal cannot be submitted without it. */
  isRequired: boolean;
  /** URL of the document already stored on the request, if any. */
  existingAttachment?: string | null;
  disabled?: boolean;
}

/**
 * Purchase order for a requested resource.
 *
 * Reuses the order-side components so the applicant meets the same widgets
 * here as in the deploy and change-limits flows.
 *
 * Either half satisfies the requirement, matching
 * RequestedResource.has_purchase_order — some providers want the document,
 * others only the reference from the customer's finance system.
 *
 * Nothing here blocks the form. The requirement is enforced at proposal
 * submission, by validate_purchase_orders_present, and the backend accepts
 * writes to a resource request with no purchase order at all. A validator on
 * the reference disabled the wizard's Create/Edit button, so an applicant who
 * had the amounts but not yet the authorisation could not save the request and
 * come back to it — which is the order the two usually arrive in.
 */
export const PurchaseOrderFields: FC<PurchaseOrderFieldsProps> = ({
  isRequired,
  existingAttachment,
  disabled,
}) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  // A stored document counts: the picker starts empty on edit because the
  // stored file is a URL rather than a File, and an empty picker must not read
  // as "no purchase order given".
  const hasAttachment =
    Boolean(values.attachment) || Boolean(existingAttachment);

  return (
    <div className="mt-4">
      <div className="fw-bold">{translate('Purchase order')}</div>
      <div className="text-muted fs-7 mb-4">
        {isRequired
          ? translate(
              'This offering requires a purchase order. Give its reference, attach the document, or both. You can save the request now and add it before submitting the proposal.',
            )
          : translate(
              'Optional. Attach a purchase order if your organisation needs one to authorise this spend.',
            )}
      </div>
      <StringGroup
        name="purchase_order_reference"
        label={translate('Purchase order reference')}
        placeholder={translate('e.g. PO-4711')}
        disabled={disabled}
        // A hint, not a gate: the document alone is a complete answer, and the
        // proposal is where the requirement is actually enforced.
        required={isRequired && !hasAttachment}
      />
      <FormGroup
        label={translate('Purchase order document')}
        description={translate('Attach a PDF purchase order document.')}
        spaceless
      >
        {existingAttachment && !values.attachment ? (
          <div className="mb-2">
            <a
              href={existingAttachment}
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center gap-1"
            >
              <DownloadSimpleIcon weight="bold" />
              {translate('Currently attached document')}
            </a>
            <div className="text-muted fs-7">
              {translate('Attaching a new file replaces it.')}
            </div>
          </div>
        ) : null}
        <AttachmentRow
          value={(values.attachment as File) || null}
          onChange={(value) => form.change('attachment', value)}
        />
      </FormGroup>
    </div>
  );
};
