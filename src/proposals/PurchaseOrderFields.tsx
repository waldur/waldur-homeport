import { FC } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { AttachmentRow } from '@/marketplace/resources/common/AttachmentRow';

interface PurchaseOrderFieldsProps {
  /** The call demands one, so the proposal cannot be submitted without it. */
  isRequired: boolean;
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
 * others only the reference from the customer's finance system. The reference
 * carries the `required` validator because a file input cannot show one, and
 * demanding a PDF from someone who only has a number would be worse.
 */
export const PurchaseOrderFields: FC<PurchaseOrderFieldsProps> = ({
  isRequired,
  disabled,
}) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const hasAttachment = Boolean(values.attachment);

  return (
    <div className="mt-4">
      <div className="fw-bold">{translate('Purchase order')}</div>
      <div className="text-muted fs-7 mb-4">
        {isRequired
          ? translate(
              'This offering requires a purchase order. Give its reference, attach the document, or both.',
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
        // Only mandatory while nothing is attached, so the document alone is
        // still a complete answer.
        required={isRequired && !hasAttachment}
        validate={isRequired && !hasAttachment ? required : undefined}
      />
      <FormGroup
        label={translate('Purchase order document')}
        description={translate('Attach a PDF purchase order document.')}
        spaceless
      >
        <AttachmentRow
          value={(values.attachment as File) || null}
          onChange={(value) => form.change('attachment', value)}
        />
      </FormGroup>
    </div>
  );
};
