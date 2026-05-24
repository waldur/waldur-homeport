import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Field } from 'react-final-form';
import { notificationMessagesTemplatesList } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { validateMaxLength } from '@/core/validators';
import { TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
      <Field
        name="extra_invitation_text"
        placeholder={translate('Enter custom message...')}
        validate={validateMaxLength(2000)}
        render={({ input, meta }) => (
          <FormGroup
            label={translate('Custom message')}
            description={translate(
              'You can add a message to be attached to the invitation email the users receive.',
            )}
            meta={meta}
          >
            <TextField input={input} isInvalid={Boolean(meta.error)} />
          </FormGroup>
        )}
      />
    </div>
  );
};
