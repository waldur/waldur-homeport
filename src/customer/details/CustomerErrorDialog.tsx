import { FunctionComponent, useMemo } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { sendIssueCreateRequest } from '@waldur/issues/create/utils';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getUser } from '@waldur/workspace/selectors';

export const CustomerErrorDialog: FunctionComponent<{ resolve }> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const description = useMemo<string[]>(() => {
    const parts = [];
    if (resolve.customer.name != resolve.formData.name) {
      parts.push(
        translate('Current name: {value}.', {
          value: resolve.customer.name,
        }),
      );
      parts.push(
        translate('Proposed name: {value}.', {
          value: resolve.formData.name,
        }),
      );
    }
    if (resolve.customer.native_name != resolve.formData.native_name) {
      parts.push(
        translate('Current native name: {value}.', {
          value: resolve.customer.native_name || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed native name: {value}.', {
          value: resolve.formData.native_name || 'N/A',
        }),
      );
    }
    if (resolve.customer.abbreviation != resolve.formData.abbreviation) {
      parts.push(
        translate('Current abbreviation: {value}.', {
          value: resolve.customer.abbreviation || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed abbreviation: {value}.', {
          value: resolve.formData.abbreviation || 'N/A',
        }),
      );
    }
    if (resolve.customer.domain != resolve.formData.domain) {
      parts.push(
        translate('Current domain name: {value}.', {
          value: resolve.customer.domain || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed domain name: {value}.', {
          value: resolve.formData.domain || 'N/A',
        }),
      );
    }
    if (
      resolve.customer.registration_code != resolve.formData.registration_code
    ) {
      parts.push(
        translate('Current registry code: {value}.', {
          value: resolve.customer.registration_code || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed registry code: {value}.', {
          value: resolve.formData.registration_code || 'N/A',
        }),
      );
    }
    if (
      resolve.customer.agreement_number != resolve.formData.agreement_number
    ) {
      parts.push(
        translate('Current agreement number: {value}.', {
          value: resolve.customer.agreement_number || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed agreement number: {value}.', {
          value: resolve.formData.agreement_number || 'N/A',
        }),
      );
    }
    if (resolve.customer.address != resolve.formData.address) {
      parts.push(
        translate('Current address: {value}.', {
          value: resolve.customer.address || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed address: {value}.', {
          value: resolve.formData.address || 'N/A',
        }),
      );
    }
    if (resolve.customer.email != resolve.formData.email) {
      parts.push(
        translate('Current email: {value}.', {
          value: resolve.customer.email || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed email: {value}.', {
          value: resolve.formData.email || 'N/A',
        }),
      );
    }
    if (resolve.customer.phone_number != resolve.formData.phone_number) {
      parts.push(
        translate('Current contact phone: {value}.', {
          value: resolve.customer.phone_number || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed contact phone: {value}.', {
          value: resolve.formData.phone_number || 'N/A',
        }),
      );
    }
    if (resolve.customer.vat_code != resolve.formData.vat_code) {
      parts.push(
        translate('Current VAT code: {value}.', {
          value: resolve.customer.vat_code || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed VAT code: {value}.', {
          value: resolve.formData.vat_code || 'N/A',
        }),
      );
    }

    if (
      resolve.customer.default_tax_percent !=
      resolve.formData.default_tax_percent
    ) {
      parts.push(
        translate('Current VAT rate: {value}.', {
          value: resolve.customer.default_tax_percent,
        }),
      );
      parts.push(
        translate('Proposed VAT rate: {value}.', {
          value: resolve.formData.default_tax_percent,
        }),
      );
    }
    if (resolve.customer.access_subnets != resolve.formData.access_subnets) {
      parts.push(
        translate('Current subnets: {value}.', {
          value: resolve.customer.access_subnets || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed subnets: {value}.', {
          value: resolve.formData.access_subnets || 'N/A',
        }),
      );
    }
    if (resolve.customer.postal != resolve.formData.postal) {
      parts.push(
        translate('Current postal code: {value}.', {
          value: resolve.customer.postal || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed postal code: {value}.', {
          value: resolve.formData.postal || 'N/A',
        }),
      );
    }
    if (resolve.customer.bank_name != resolve.formData.bank_name) {
      parts.push(
        translate('Current bank name: {value}.', {
          value: resolve.customer.bank_name || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed bank name: {value}.', {
          value: resolve.formData.bank_name || 'N/A',
        }),
      );
    }
    if (resolve.customer.bank_account != resolve.formData.bank_account) {
      parts.push(
        translate('Current bank account: {value}.', {
          value: resolve.customer.bank_account || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed bank account: {value}.', {
          value: resolve.formData.bank_account || 'N/A',
        }),
      );
    }
    if (
      resolve.customer.country_name != resolve.formData.country?.display_name
    ) {
      parts.push(
        translate('Current country: {value}.', {
          value: resolve.customer.country_name || 'N/A',
        }),
      );
      parts.push(
        translate('Proposed country: {value}.', {
          value: resolve.formData.country?.display_name || 'N/A',
        }),
      );
    }

    return parts;
  }, [resolve]);
  const onCreateIssue = () => {
    const payload = {
      type: ISSUE_IDS.SERVICE_REQUEST,
      summary: translate('Incorrect organization details'),
      customer: resolve.customer.url,
      description: description.join('\n'),
      caller: user.url,
    };
    sendIssueCreateRequest(payload, dispatch);
  };
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Incorrect organization details')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ENV.plugins.WALDUR_SUPPORT ? (
          <div>
            <p>
              <b>{translate('Preview changes')}</b>
            </p>
            {description.map((part, index) => (
              <p key={index}>{part}</p>
            ))}
          </div>
        ) : (
          translate(
            'To correct details of your organization, please send an email to {supportEmail} highlighting the errors in current details. Thank you!',
            {
              supportEmail: (
                <a href={`mailto:${ENV.plugins.WALDUR_CORE.SITE_EMAIL}`}>
                  {ENV.plugins.WALDUR_CORE.SITE_EMAIL}
                </a>
              ),
            },
            formatJsxTemplate,
          )
        )}
      </Modal.Body>
      <Modal.Footer>
        {ENV.plugins.WALDUR_SUPPORT && (
          <Button onClick={onCreateIssue} variant="primary">
            {translate('Propose changes')}
          </Button>
        )}
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
