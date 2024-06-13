import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const WelcomeView = () => {
  return (
    <div className="welcome-view-container">
      <div className="welcome-view d-flex flex-column align-items-center justify-content-center px-4">
        <h3 className="text-white">{translate('Welcome to marketplace')}</h3>
        <p className="text-white text-nowrap mb-10">
          {translate('Your source for everything as a service.')}
        </p>
        <span data-kt-menu-dismiss="true">
          <Link
            className="btn btn-white btn-hover-rise btn-active-light-primary"
            state="public.marketplace-landing"
          >
            {translate('Browse')}
          </Link>
        </span>
      </div>
      <div className="d-none d-md-flex align-items-center justify-content-center px-4 h-50 min-h-150px mh-500px">
        <p>{translate('Select root category')}</p>
      </div>
    </div>
  );
};
