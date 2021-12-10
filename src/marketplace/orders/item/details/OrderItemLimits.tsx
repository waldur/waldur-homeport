import { translate, TranslateProps, withTranslation } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

interface OfferingProps extends TranslateProps {
  components: OfferingComponent[];
  limits: Limits;
}

export const OrderItemLimits = withTranslation((props: OfferingProps) => {
  return (
    <>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="col-sm-1">{translate('Name')}</th>
            <th className="col-sm-1">{translate('Measured unit')}</th>
            <th className="col-sm-1">{translate('Limit')}</th>
          </tr>
        </thead>

        <tbody>
          {props.components.map((component, id) => (
            <tr key={id}>
              <td className="col-sm-1 text-capitalize">{component.name}</td>
              <td className="col-sm-1 text-capitalize">
                {component.measured_unit}
              </td>
              <td className="col-sm-1 text-capitalize">
                {props.limits[component.type]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});
