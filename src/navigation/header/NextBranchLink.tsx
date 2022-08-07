import { translate } from '@waldur/i18n';

export const NextBranchLink = () => {
  return (
    <li>
      <a
        onClick={() => {
          window.location.pathname = '/next/';
        }}
      >
        <i className="fa fa-question-circle"></i>{' '}
        {translate('Try out new version')}
      </a>
    </li>
  );
};
