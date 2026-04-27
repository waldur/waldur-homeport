import { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IssueTypeEnum } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate, formatJsxTemplate } from '@/i18n';
import { sendIssueCreateRequest } from '@/issues/create/utils';
import { ISSUE_IDS } from '@/issues/types/constants';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';
import { getUser } from '@/workspace/selectors';

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
          value: renderFieldOrDash(resolve.customer.native_name),
        }),
      );
      parts.push(
        translate('Proposed native name: {value}.', {
          value: renderFieldOrDash(resolve.formData.native_name),
        }),
      );
    }
    if (resolve.customer.abbreviation != resolve.formData.abbreviation) {
      parts.push(
        translate('Current abbreviation: {value}.', {
          value: renderFieldOrDash(resolve.customer.abbreviation),
        }),
      );
      parts.push(
        translate('Proposed abbreviation: {value}.', {
          value: renderFieldOrDash(resolve.formData.abbreviation),
        }),
      );
    }
    if (resolve.customer.domain != resolve.formData.domain) {
      parts.push(
        translate('Current domain name: {value}.', {
          value: renderFieldOrDash(resolve.customer.domain),
        }),
      );
      parts.push(
        translate('Proposed domain name: {value}.', {
          value: renderFieldOrDash(resolve.formData.domain),
        }),
      );
    }
    if (
      resolve.customer.registration_code != resolve.formData.registration_code
    ) {
      parts.push(
        translate('Current registry code: {value}.', {
          value: renderFieldOrDash(resolve.customer.registration_code),
        }),
      );
      parts.push(
        translate('Proposed registry code: {value}.', {
          value: renderFieldOrDash(resolve.formData.registration_code),
        }),
      );
    }
    if (
      resolve.customer.agreement_number != resolve.formData.agreement_number
    ) {
      parts.push(
        translate('Current agreement number: {value}.', {
          value: renderFieldOrDash(resolve.customer.agreement_number),
        }),
      );
      parts.push(
        translate('Proposed agreement number: {value}.', {
          value: renderFieldOrDash(resolve.formData.agreement_number),
        }),
      );
    }
    if (resolve.customer.address != resolve.formData.address) {
      parts.push(
        translate('Current address: {value}.', {
          value: renderFieldOrDash(resolve.customer.address),
        }),
      );
      parts.push(
        translate('Proposed address: {value}.', {
          value: renderFieldOrDash(resolve.formData.address),
        }),
      );
    }
    if (resolve.customer.email != resolve.formData.email) {
      parts.push(
        translate('Current email: {value}.', {
          value: renderFieldOrDash(resolve.customer.email),
        }),
      );
      parts.push(
        translate('Proposed email: {value}.', {
          value: renderFieldOrDash(resolve.formData.email),
        }),
      );
    }
    if (resolve.customer.phone_number != resolve.formData.phone_number) {
      parts.push(
        translate('Current contact phone: {value}.', {
          value: renderFieldOrDash(resolve.customer.phone_number),
        }),
      );
      parts.push(
        translate('Proposed contact phone: {value}.', {
          value: renderFieldOrDash(resolve.formData.phone_number),
        }),
      );
    }
    if (resolve.customer.vat_code != resolve.formData.vat_code) {
      parts.push(
        translate('Current VAT code: {value}.', {
          value: renderFieldOrDash(resolve.customer.vat_code),
        }),
      );
      parts.push(
        translate('Proposed VAT code: {value}.', {
          value: renderFieldOrDash(resolve.formData.vat_code),
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
          value: renderFieldOrDash(resolve.customer.access_subnets),
        }),
      );
      parts.push(
        translate('Proposed subnets: {value}.', {
          value: renderFieldOrDash(resolve.formData.access_subnets),
        }),
      );
    }
    if (resolve.customer.postal != resolve.formData.postal) {
      parts.push(
        translate('Current postal code: {value}.', {
          value: renderFieldOrDash(resolve.customer.postal),
        }),
      );
      parts.push(
        translate('Proposed postal code: {value}.', {
          value: renderFieldOrDash(resolve.formData.postal),
        }),
      );
    }
    if (resolve.customer.bank_name != resolve.formData.bank_name) {
      parts.push(
        translate('Current bank name: {value}.', {
          value: renderFieldOrDash(resolve.customer.bank_name),
        }),
      );
      parts.push(
        translate('Proposed bank name: {value}.', {
          value: renderFieldOrDash(resolve.formData.bank_name),
        }),
      );
    }
    if (resolve.customer.bank_account != resolve.formData.bank_account) {
      parts.push(
        translate('Current bank account: {value}.', {
          value: renderFieldOrDash(resolve.customer.bank_account),
        }),
      );
      parts.push(
        translate('Proposed bank account: {value}.', {
          value: renderFieldOrDash(resolve.formData.bank_account),
        }),
      );
    }
    if (
      resolve.customer.country_name != resolve.formData.country?.display_name
    ) {
      parts.push(
        translate('Current country: {value}.', {
          value: renderFieldOrDash(resolve.customer.country_name),
        }),
      );
      parts.push(
        translate('Proposed country: {value}.', {
          value: renderFieldOrDash(resolve.formData.country?.display_name),
        }),
      );
    }

    return parts;
  }, [resolve]);
  const onCreateIssue = () => {
    const payload = {
      type: ISSUE_IDS.SERVICE_REQUEST as IssueTypeEnum,
      summary: translate('Incorrect organization details'),
      customer: resolve.customer.url,
      description: description.join('\n'),
      caller: user.url,
    };
    sendIssueCreateRequest(payload, dispatch, resolve.refetch);
  };
  return (
    <ModalDialog
      title={translate('Incorrect organization details')}
      footer={
        <>
          <CloseDialogButton />
          {ENV.plugins.WALDUR_SUPPORT.ENABLED && (
            <SubmitButton
              submitting={false}
              onClick={onCreateIssue}
              type="button"
              label={translate('Propose changes')}
            />
          )}
        </>
      }
    >
      {ENV.plugins.WALDUR_SUPPORT.ENABLED ? (
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
    </ModalDialog>
  );
};
