import Axios from 'axios';
import { FunctionComponent } from 'react';
import { useQuery } from 'react-query';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';

import { LoadingSpinner } from './core/LoadingSpinner';
import { translate } from './i18n';

export const USER_AGREEMENT_TYPES = {
  privacy_policy: 'PP',
  terms_of_service: 'TOS',
};

interface TemplateComponentProps {
  agreement_type: string;
  title: string;
}

async function getUserAgreement(agreement_type) {
  const response = await Axios.get(`${ENV.apiEndpoint}api/user-agreements/`, {
    params: { agreement_type: agreement_type },
  });
  return response.data[0];
}

export const UserAgreementComponent: FunctionComponent<TemplateComponentProps> =
  (props) => {
    const {
      isLoading: loading,
      error,
      data: option,
    } = useQuery(
      'userAgreementData',
      async () => await getUserAgreement(props.agreement_type),
    );
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <>{translate('Unable to load page')}</>;
    }

    return (
      <div>
        <div className="mb-6 card">
          <div className="card-body">
            <p className="mb-10">
              <em className="fw-light ms-4">
                Published: {formatDateTime(option.created)}
              </em>
            </p>

            <h2 className="fw-bold">{props.title}</h2>
            <p>{option.content}</p>
          </div>
        </div>
      </div>
    );
  };
