import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const FooterSection = () => {
  return (
    <div className="footer-section">
      <div className="left-side bg-gray-200">
        <div className="d-flex flex-column justify-content-between p-10 h-100 mw-700px ms-auto">
          <div>
            <h1 className="mb-8">{translate('Reach a new audience')}</h1>
            <p className="mw-400px">
              Magento server deployment is quick and easy so you don’t fret over
              the technicalities.
            </p>
          </div>
          <div>
            <Button variant="primary" className="min-w-250px">
              {translate('For vendors')}
            </Button>
          </div>
        </div>
      </div>
      <div className="right-side bg-gray-300">
        <div className="d-flex flex-column justify-content-between p-10 h-100 mw-700px me-auto">
          <div>
            <h1 className="mb-8">{translate('Deploy in seconds')}</h1>
            <p className="mw-400px ms-auto">
              Magento server deployment is quick and easy so you don’t fret over
              the technicalities.
            </p>
          </div>
          <div>
            <Button variant="primary" className="min-w-250px">
              {translate('See offerings')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
