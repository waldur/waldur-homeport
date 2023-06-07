import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { post } from '@waldur/core/api';
import { pick } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { BrandingForm } from './BrandingForm';

const saveConfig = (values) => post('/branding/', values);

export const AdministrationBranding = () => {
  const dispatch = useDispatch();
  const callback = async (values) => {
    try {
      await saveConfig(values);
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
      ])(ENV.plugins.WALDUR_CORE),
    [],
  );
  return (
    <Card>
      <Card.Header>{translate('Naming')}</Card.Header>
      <Card.Body>
        <BrandingForm saveConfig={mutate} initialValues={initialValues} />
      </Card.Body>
    </Card>
  );
};
