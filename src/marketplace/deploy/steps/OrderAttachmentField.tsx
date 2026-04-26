import { Field } from 'react-final-form';

import { required as requiredValidator } from '@waldur/core/validators';
import { AttachmentRow } from '@waldur/marketplace/resources/common/AttachmentRow';

export const OrderAttachmentField = ({ required }: { required?: boolean }) => (
  <Field
    name="attachment"
    validate={required ? requiredValidator : undefined}
    component={({ input }) => (
      <AttachmentRow value={input.value || null} onChange={input.onChange} />
    )}
  />
);
