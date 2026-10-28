import { translate } from '@/i18n';
import { QuotasTable } from '@/quotas/QuotasTable';

export const TenantMainComponent = ({ resourceScope }) => {
  return resourceScope ? (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <h3>{translate('Quotas')}</h3>
        </div>
      </div>
      <div className="card-body">
        <QuotasTable resource={resourceScope} />
      </div>
    </div>
  ) : null;
};
