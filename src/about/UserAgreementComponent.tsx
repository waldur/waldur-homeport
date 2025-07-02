import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { userAgreementsList } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';

import { LoadingSpinner } from '../core/LoadingSpinner';
import { translate } from '../i18n';

interface TemplateComponentProps {
  agreement_type: 'PP' | 'TOS';
  title: string;
}

export const UserAgreementComponent: FunctionComponent<
  TemplateComponentProps
> = (props) => {
  const {
    isLoading: loading,
    error,
    data: option,
  } = useQuery({
    queryKey: ['userAgreementData'],

    queryFn: async () => {
      const response = await userAgreementsList({
        query: { agreement_type: props.agreement_type },
      });
      return response.data[0];
    },
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load page')}</>;
  }

  if (!option) {
    return (
      <h2>
        {props.title} {translate('is not defined.')}
      </h2>
    );
  }

  return (
    <div>
      <div className="mb-6 card card-bordered">
        <div className="card-body">
          <SafeMarkdown text={option.content} />
        </div>
      </div>
    </div>
  );
};
