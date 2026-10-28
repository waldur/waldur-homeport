import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const ErrorDetailsTab = ({ order }) => {
  return (
    <div className="card card-bordered">
      <div className="card-header custom-card-header custom-padding-zero">
        <div className="card-title">
          <h3>{translate('Error details')}</h3>
        </div>
      </div>
      {order.error_message ? (
        <div className="card-body">
          <div>
            <p>{translate('Error details')}:</p>
            <pre>{order.error_message}</pre>
          </div>
          <div>
            <p>{translate('Error trace')}:</p>
            <pre>{order.error_traceback}</pre>
          </div>
        </div>
      ) : (
        <NoResult
          title={translate('No errors found for this order')}
          message={null}
          noAction
        />
      )}
    </div>
  );
};
