import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { Field } from '@waldur/resource/summary';
import { connectAngularComponent } from '@waldur/store/connect';

import { ExpertRequestState } from '../ExpertRequestState';
import { ExpertRequest } from '../types';
import { ExpertRequestConfiguration } from './ExpertRequestConfiguration';
import { RequestConfiguration } from './types';

interface ExpertRequestGeneralInfoProps extends TranslateProps {
  expertRequest: ExpertRequest;
  config: RequestConfiguration;
}

const PureExpertRequestGeneralInfo = (
  { translate, expertRequest, config }: ExpertRequestGeneralInfoProps
) => (
  <dl className="dl-horizontal resource-details-table col-sm-12">
    <Field
      label={translate('State')}
      value={<ExpertRequestState model={expertRequest}/>}
    />
    <Field
      label={translate('Type')}
      value={expertRequest.type_label}
    />
    <Field
      label={translate('Organization')}
      value={<CustomerLink row={expertRequest}/>}
    />
    <Field
      label={translate('Project')}
      value={<ProjectLink row={expertRequest}/>}
    />
    <Field
      label={translate('Last updated')}
      value={formatDateTime(expertRequest.created)}
    />
    <Field
      label={translate('Created')}
      value={formatDateTime(expertRequest.modified)}
    />
    <Field
      label={translate('Description')}
      value={expertRequest.description}
    />
    <ExpertRequestConfiguration
      model={expertRequest}
      config={config}
    />
  </dl>
);

const ExpertRequestGeneralInfo = withTranslation(PureExpertRequestGeneralInfo);

export default connectAngularComponent(ExpertRequestGeneralInfo, ['expertRequest', 'config']);
