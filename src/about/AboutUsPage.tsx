import { Card, CardContent } from 'waldur-ui';

import { ENV } from '@/core/config';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

export const AboutUsPage = () => {
  useTitle(translate('About us'));
  return (
    <Card bordered className="mb-5">
      <CardContent>
        <SafeMarkdown text={ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_CONTENT} />
      </CardContent>
    </Card>
  );
};
