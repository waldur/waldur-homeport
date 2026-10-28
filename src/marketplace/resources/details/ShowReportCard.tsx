import { translate } from '@/i18n';

import { ShowReportComponent } from '../report/ShowReportComponent';

export const ShowReportCard = ({ resource }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{translate('Report')}</div>
      </div>
      <div className="card-body">
        <ShowReportComponent report={resource.report} />
      </div>
    </div>
  );
};
