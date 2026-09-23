import { ENV } from '@/core/config';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

export const AboutUsPage = () => {
  useTitle(translate('About us'));
  return (
    <div className="mb-6 card card-bordered">
      <div className="card-body">
        <SafeMarkdown text={ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_CONTENT} />
      </div>
    </div>
  );
};
