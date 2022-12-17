import { Modal } from 'react-bootstrap';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import {
  offeringsAutocomplete,
  organizationAutocomplete,
} from '@waldur/marketplace/common/autocompletes';

export const NotificationForm = ({ submitting }) => (
  <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
    <FormContainer submitting={submitting}>
      <StringField
        name="subject"
        label={translate('Subject')}
        required={true}
        validate={required}
      />
      <TextField
        name="body"
        label={translate('Message')}
        required={true}
        validate={required}
      />
      <AsyncSelectField
        name="offerings"
        label={translate('Offerings')}
        placeholder={translate('Select offerings...')}
        loadOptions={(query, prevOptions, page) =>
          offeringsAutocomplete(
            { name: query, shared: true },
            prevOptions,
            page,
          )
        }
        isMulti={true}
      />
      <AsyncSelectField
        name="customers"
        label={translate('Organizations')}
        placeholder={translate('Select organizations...')}
        loadOptions={(query, prevOptions, page) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'uuid'],
            o: 'name',
          })
        }
        isMulti={true}
      />
      <DateField name="send_at" label={translate('Send at')} />
    </FormContainer>
  </Modal.Body>
);
