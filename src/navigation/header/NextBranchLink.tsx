import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const NextBranchLink = () => {
  if (!isFeatureVisible('support.next_branch')) {
    return null;
  }
  return (
    <li>
      <Link state="next">
        <i className="fa fa-question-circle"></i>{' '}
        {translate('Try out new interface')}
      </Link>
    </li>
  );
};
