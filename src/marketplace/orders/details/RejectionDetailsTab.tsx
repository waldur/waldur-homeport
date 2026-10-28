import { translate } from '@/i18n';

export const RejectionDetailsTab = ({ order }) => {
  return (
    <div className="card card-bordered">
      <div className="card-header custom-card-header custom-padding-zero">
        <div className="card-title">
          <h3>{translate('Rejection details')}</h3>
        </div>
      </div>
      <div className="card-body">
        {order.consumer_rejection_comment && (
          <div>
            <p>{translate('Consumer rejection reason')}:</p>
            <pre>{order.consumer_rejection_comment}</pre>
          </div>
        )}
        {order.provider_rejection_comment && (
          <div>
            <p>{translate('Provider rejection reason')}:</p>
            <pre>{order.provider_rejection_comment}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
