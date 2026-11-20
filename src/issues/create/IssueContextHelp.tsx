import { InfoIcon } from '@phosphor-icons/react';
import { useFormState } from 'react-final-form';

import { HelpIcon } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

import { IssueFormData } from './types';

/**
 * The context picked on the first step, in a help tooltip at the top of the
 * second. It used to sit in the first step's label, but the stepper draws a
 * step as a button, which cannot hold this one.
 */
export const IssueContextHelp = () => {
  const { values: formValues } = useFormState<IssueFormData>({
    subscription: { values: true },
  });

  const hasDetails =
    Boolean(
      ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && formValues?.type,
    ) ||
    Boolean(formValues?.customer) ||
    Boolean(formValues?.project) ||
    Boolean(formValues?.resource);

  const details = (
    <>
      {ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && formValues?.type && (
        <div>
          <strong>{translate('Request type')}</strong>:{' '}
          {typeof formValues.type === 'string'
            ? formValues.type
            : formValues.type.label}
        </div>
      )}
      {formValues?.customer && (
        <div>
          <strong>{translate('Organization')}</strong>:{' '}
          {formValues.customer.name}
        </div>
      )}
      {formValues?.project && (
        <div>
          <strong>{translate('Project')}</strong>: {formValues.project.name}
        </div>
      )}
      {formValues?.resource && (
        <div>
          <strong>{translate('Resource')}</strong>: {formValues.resource.name}
        </div>
      )}
    </>
  );

  if (!hasDetails) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-1.5 text-sm text-secondary">
      {translate('Issue details')}
      <HelpIcon
        label={details}
        aria-label={translate('Issue details')}
        icon={InfoIcon}
      />
    </div>
  );
};
