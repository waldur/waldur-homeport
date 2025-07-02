import { InfoIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ISSUE_CREATION_FORM_ID } from './constants';
import { IssueFormData } from './types';

export const IssueDetailsStepLabel = () => {
  const formValues = useSelector(
    getFormValues(ISSUE_CREATION_FORM_ID),
  ) as IssueFormData;

  return (
    <>
      {translate('Issue details')}
      {formValues && (
        <span className="mx-2">
          <Tip
            label={
              <>
                {ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && (
                  <div>
                    <strong>{translate('Request type')}</strong>:{' '}
                    {formValues.type.label}
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
            <InfoIcon />
          </Tip>
        </span>
      )}
    </>
  );
};
