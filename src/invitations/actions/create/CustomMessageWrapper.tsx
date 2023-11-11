import { useMemo } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getNotificationMessagesTemplates } from '@waldur/notifications/api';

export const CustomMessageWrapper = () => {
  const [{ loading, error, value }, loadTemplate] = useAsyncFn(() =>
    getNotificationMessagesTemplates({ name: 'invitation_created' }),
  );

  useEffectOnce(() => {
    loadTemplate();
  });

  const htmlMessage = useMemo(() => {
    if (!value || !value.length) return '';
    return (
      value.find(
        (template) => template.path === 'users/invitation_created_message.html',
      )?.content || ''
    );
  }, [value]);

  return (
    <>
      <h2 className="mb-10">{translate('Invite by email')}</h2>
      <div className="scroll-y mh-400px pb-6 pe-2">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={loadTemplate} />
        ) : (
          <FormattedHtml html={htmlMessage} />
        )}
        <div className="py-8 px-6 bg-secondary text-gray-700 rounded">
          {translate('Your custom message will appear here')}
        </div>
      </div>
    </>
  );
};
