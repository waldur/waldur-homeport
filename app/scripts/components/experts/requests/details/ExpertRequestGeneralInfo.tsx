import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { CustomerLink } from '@waldur/customer/CustomerLink';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { connectAngularComponent } from '@waldur/store/connect';

import { ExpertRequestState } from '../ExpertRequestState';
import { ExpertRequest } from '../types';

interface ExpertRequestGeneralInfoProps extends TranslateProps {
  expertRequest: ExpertRequest;
}

const PureExpertRequestGeneralInfo = ({ translate, expertRequest }: ExpertRequestGeneralInfoProps) => (
  <dl className="dl-horizontal">
    <dt>{translate('State')}</dt>
    <dd className="m-b-xs">
      <ExpertRequestState model={expertRequest}/>
    </dd>

    <div className="m-b-xs">
      <dt>{translate('Type')}</dt>
      <dd>{expertRequest.type_label}</dd>
    </div>

    <div className="m-b-xs">
      <dt>{translate('Organization')}</dt>
      <dd><CustomerLink row={expertRequest}/></dd>
    </div>

    <div className="m-b-xs">
      <dt>{translate('Project')}</dt>
      <dd><ProjectLink row={expertRequest}/></dd>
    </div>

    <div className="m-b-xs">
      <dt>{translate('Last updated')}</dt>
      <dd>{formatDateTime(expertRequest.created)}</dd>
    </div>

    <div className="m-b-xs">
      <dt>{translate('Created')}</dt>
      <dd>{formatDateTime(expertRequest.modified)}</dd>
    </div>

    {expertRequest.description && (
      <div className="m-b-xs">
        <dt>{translate('Description')}</dt>
        <dd>{expertRequest.description}</dd>
      </div>
    )}
  </dl>
);

const ExpertRequestGeneralInfo = withTranslation(PureExpertRequestGeneralInfo);

export default connectAngularComponent(ExpertRequestGeneralInfo, ['expertRequest']);
