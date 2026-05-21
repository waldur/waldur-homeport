import { InfoIcon } from '@phosphor-icons/react';
import { useFormState } from 'react-final-form';

import { ENV } from '@/core/config';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { IssueFormData } from './types';

export const IssueDetailsStepLabel = () => {
  const { values: formValues } = useFormState<IssueFormData>();

  const hasDetails =
    Boolean(
      ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && formValues?.type,
    ) ||
    Boolean(formValues?.customer) ||
    Boolean(formValues?.project) ||
    Boolean(formValues?.resource);

  return (
    <>
      {translate('Issue details')}
      {hasDetails && (
        <span className="mx-2">
          <Tip
            label={
              <>
                {ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE &&
                  formValues.type && (
                    <div>
                      <strong>{translate('Request type')}</strong>:{' '}
                      {typeof formValues.type === 'string'
                        ? formValues.type
                        : formValues.type.label}
                    </div>
                  )}
                {formValues.customer && (
                  <div>
                    <strong>{translate('Organization')}</strong>:{' '}
                    {formValues.customer.name}
                  </div>
                )}
                {formValues.project && (
                  <div>
                    <strong>{translate('Project')}</strong>:{' '}
                    {formValues.project.name}
                  </div>
                )}
                {formValues.resource && (
                  <div>
                    <strong>{translate('Resource')}</strong>:{' '}
                    {formValues.resource.name}
                  </div>
                )}
              </>
            }
            id="tooltip"
          >
            <InfoIcon weight="bold" />
          </Tip>
        </span>
      )}
    </>
  );
};
