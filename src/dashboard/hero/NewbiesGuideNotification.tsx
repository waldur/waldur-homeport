import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';

export const NewbiesGuideNotification = ({ message, guideState }) => (
  <div className="h-35px d-flex align-items-center justify-content-center bg-secondary">
    <p className="fs-5 fw-bold mb-0">
      {message}{' '}
      {translate(
        'See our {guide}.',
        {
          guide: (
            <Link state={guideState} className="text-link">
              {translate('getting started guide')}
            </Link>
          ),
        },
        formatJsxTemplate,
      )}
    </p>
  </div>
);
