import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import {
  FieldError,
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';

const SIDEBAR_STYLES = [
  {
    label: translate('Primary accent'),
    value: 'accent',
  },
  {
    label: translate('Dark'),
    value: 'dark',
  },
  {
    label: translate('Light'),
    value: 'light',
  },
];

const PureBrandingForm: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.saveConfig)}>
    <FormContainer submitting={props.submitting} floating={true}>
      <StringField
        name="SHORT_PAGE_TITLE"
        label={translate('Site name')}
        disabled={props.disabled}
      />
      <StringField
        name="SITE_DESCRIPTION"
        label={translate('Site description')}
        disabled={props.disabled}
      />
      <StringField
        name="BRAND_COLOR"
        label={translate(
          'Hex color definition is used for sidebar background.',
        )}
        disabled={props.disabled}
      />
      <StringField
        name="BRAND_LABEL_COLOR"
        label={translate(
          'Hex color definition is used in landing page for font color of login button.',
        )}
        disabled={props.disabled}
      />
      <StringField
        name="HERO_LINK_LABEL"
        label={translate('Label for link in hero section of landing page.')}
        disabled={props.disabled}
      />
      <StringField
        name="HERO_LINK_URL"
        label={translate('Link URL in hero section of landing page.')}
        disabled={props.disabled}
      />
      <ImageField
        floating={false}
        label={translate('File for login page.')}
        name="LOGIN_LOGO"
        initialValue={ENV.plugins.WALDUR_CORE.LOGIN_LOGO}
      />
      <ImageField
        floating={false}
        label={translate('Image used in marketplace order header.')}
        name="SITE_LOGO"
        initialValue={ENV.plugins.WALDUR_CORE.SITE_LOGO}
      />
      <ImageField
        floating={false}
        label={translate('Image rendered at the bottom of login menu.')}
        name="POWERED_BY_LOGO"
        initialValue={ENV.plugins.WALDUR_CORE.POWERED_BY_LOGO}
      />
      <ImageField
        floating={false}
        label={translate('Image rendered at hero section of landing page.')}
        name="HERO_IMAGE"
        initialValue={ENV.plugins.WALDUR_CORE.HERO_IMAGE}
      />
      <ImageField
        floating={false}
        label={translate('Image rendered at the top of sidebar menu.')}
        name="SIDEBAR_LOGO"
        initialValue={ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO}
      />
      <ImageField
        floating={false}
        label={translate('Image rendered at the top of mobile sidebar menu.')}
        name="SIDEBAR_LOGO_MOBILE"
        initialValue={ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE}
      />
      <ImageField
        floating={false}
        label={translate(
          'Image rendered at the top of sidebar menu in dark mode.',
        )}
        name="SIDEBAR_LOGO_DARK"
        initialValue={ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_DARK}
      />
      <ImageField
        floating={false}
        label={translate('Custom favicon .png image file')}
        name="FAVICON"
        initialValue={ENV.plugins.WALDUR_CORE.FAVICON}
      />
      <SelectField
        floating={false}
        name="SIDEBAR_STYLE"
        label={translate('Sidebar style')}
        options={SIDEBAR_STYLES}
        simpleValue
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

const enhance = reduxForm<
  any,
  { saveConfig: any; initialValues: any; disabled: boolean }
>({
  form: 'BrandingForm',
});

export const BrandingForm = enhance(PureBrandingForm);
