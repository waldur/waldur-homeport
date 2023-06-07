import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { translate } from '@waldur/i18n';

export const PureBrandingForm: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.saveConfig)}>
    <FormContainer submitting={props.submitting} floating={true}>
      <StringField name="SHORT_PAGE_TITLE" label={translate('Site name')} />
      <StringField
        name="SITE_DESCRIPTION"
        label={translate('Site description')}
      />
      <StringField
        name="BRAND_COLOR"
        label={translate(
          'Hex color definition is used in landing page for login button.',
        )}
      />
      <StringField
        name="BRAND_LABEL_COLOR"
        label={translate(
          'Hex color definition is used in HomePort landing page for font color of login button.',
        )}
      />
      <StringField
        name="HERO_LINK_LABEL"
        label={translate(
          'Label for link in hero section of HomePort landing page.',
        )}
      />
      <StringField
        name="HERO_LINK_URL"
        label={translate('Link URL in hero section of HomePort landing page.')}
      />
    </FormContainer>
    <Form.Group>
      <div className="pull-right">
        <FieldError error={props.error} />
        {props.dirty && (
          <Button
            variant="secondary"
            size="sm"
            className="me-2"
            onClick={props.reset}
          >
            {translate('Discard')}
          </Button>
        )}
        {!props.initial ? (
          props.dirty ? (
            <SubmitButton
              className="btn btn-primary btn-sm me-2"
              submitting={props.submitting}
              label={translate('Save changes')}
            />
          ) : null
        ) : (
          <SubmitButton
            submitting={props.submitting}
            label={translate('Agree and proceed')}
          />
        )}
      </div>
    </Form.Group>
  </form>
);

const enhance = reduxForm<{}, { saveConfig }>({
  form: 'BrandingForm',
});

export const BrandingForm = enhance(PureBrandingForm);
