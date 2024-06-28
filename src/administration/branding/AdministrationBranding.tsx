import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';
import { pick } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { BrandingForm } from './BrandingForm';

const saveConfig = (values) =>
  sendForm('POST', `${ENV.apiEndpoint}api/override-settings/`, values);

const LOGOS = [
  'LOGIN_LOGO',
  'SITE_LOGO',
  'POWERED_BY_LOGO',
  'HERO_IMAGE',
  'SIDEBAR_LOGO',
  'SIDEBAR_LOGO_MOBILE',
  'SIDEBAR_LOGO_DARK',
  'FAVICON',
];

export const AdministrationBranding = () => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = async (formData) => {
    try {
      for (const key of Object.keys(formData)) {
        if (
          LOGOS.includes(key) &&
          typeof formData[key] === 'string' &&
          formData[key] !== ''
        ) {
          delete formData[key];
        }
      }
      await saveConfig(formData);
      dispatch(showSuccess(translate('Configuration has been updated.')));
      location.reload();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update configuration.')),
      );
    }
  };

  const { mutate } = useMutation(callback);
  const initialValues = useMemo(
    () =>
      pick([
        'SHORT_PAGE_TITLE',
        'SITE_DESCRIPTION',
        'BRAND_COLOR',
        'BRAND_LABEL_COLOR',
        'HERO_LINK_LABEL',
        'HERO_LINK_URL',
        'SIDEBAR_STYLE',
        ...LOGOS,
      ])(ENV.plugins.WALDUR_CORE),
    [],
  );
  return (
    <Card>
      <Card.Header>{translate('Naming')}</Card.Header>
      <Card.Body>
        <BrandingForm
          saveConfig={mutate}
          initialValues={initialValues}
          disabled={!isStaff}
        />
      </Card.Body>
    </Card>
  );
};
