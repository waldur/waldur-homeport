import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { notificationMessagesTemplatesList } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { validateMaxLength } from '@/core/validators';
import { TextGroup } from '@/form';
import { translate } from '@/i18n';

export const CustomMessageWrapper = () => {
  const {
    isLoading: loading,
    error,
    data: value,
    refetch: loadTemplate,
  } = useQuery({
    queryKey: ['CustomMessageWrapper', 'invitation_created'],
    queryFn: () =>
      notificationMessagesTemplatesList({
        query: { name: 'invitation_created' },
      }),
  });

  const htmlMessage = useMemo(() => {
    if (!value || !value.data.length) return '';
    return (
      value.data.find(
        (template) => template.path === 'users/invitation_created_message.html',
      )?.content || ''
    );
  }, [value]);

  return (
    <div className="custom-message pe-2">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={loadTemplate} />
      ) : (
        <FormattedHtml html={htmlMessage} />
      )}
      <TextGroup
        name="extra_invitation_text"
        placeholder={translate('Enter custom message...')}
        validate={validateMaxLength(2000)}
        label={translate('Custom message')}
        description={translate(
          'You can add a message to be attached to the invitation email the users receive.',
        )}
      />
    </div>
  );
};
