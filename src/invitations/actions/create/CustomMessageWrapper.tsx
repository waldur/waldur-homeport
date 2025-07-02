import { useMemo } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { Field } from 'redux-form';
import { notificationMessagesTemplatesList } from 'waldur-js-client';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const CustomMessageWrapper = () => {
  const [{ loading, error, value }, loadTemplate] = useAsyncFn(() =>
    notificationMessagesTemplatesList({
      query: { name: 'invitation_created' },
    }),
  );

  useEffectOnce(() => {
    loadTemplate();
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
        component={TextField}
        placeholder={translate('Enter custom message') + '...'}
      />

      <p className="text-muted mb-0">
        {translate(
          'You can add a message to be attached to the invitation email the users receive.',
        )}
      </p>
    </div>
  );
};
