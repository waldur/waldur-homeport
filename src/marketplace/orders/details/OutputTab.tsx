import { CodeBlockPreview } from '@/core/CodeBlockPreview';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

export const OutputTab = ({ order }) => {
  return (
    <div className="card card-bordered">
      <div className="card-header custom-card-header custom-padding-zero">
        <div className="card-title">
          <h3>{translate('Output')}</h3>
        </div>
      </div>
      {order.output ? (
        <div className="card-body">
          <CodeBlockPreview code={order.output} />
        </div>
      ) : (
        <NoResult
          title={translate('No outputs found for this order')}
          message={null}
          noAction
        />
      )}
    </div>
  );
};
