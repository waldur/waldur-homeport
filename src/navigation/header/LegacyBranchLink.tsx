import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const LegacyBranchLink = () => {
  if (!isFeatureVisible('support.legacy_branch')) {
    return null;
  }
  return (
    <div className="d-flex align-items-center ms-1 ms-lg-3">
      <Link state="legacy" className="btn btn-light btn-active-color-primary">
        {translate('Go to old interface')}
      </Link>
    </div>
  );
};
