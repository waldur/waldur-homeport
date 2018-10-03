import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface InvoiceItem {
  scope_type: string;
  name: string;
  total: number;
}

interface PriceEstimateDialogProps extends TranslateProps {
  resolve: {
    items: InvoiceItem[];
  };
}

const PriceEstimateDialog = (props: PriceEstimateDialogProps) => (
  <ModalDialog
    title={props.translate('Price estimate details')}
    footer={<CloseDialogButton />}
>
    <table className="table table-bordered">
      <thead>
        <tr>
          <th className="col-md-3">{props.translate('Type')}</th>
          <th className="col-md-7">{props.translate('Name')}</th>
          <th className="col-md-2">{props.translate('Total')}</th>
        </tr>
      </thead>
      <tbody>
        {props.resolve.items.map((item, index) => (
          <tr key={index}>
            <td>{item.scope_type}</td>
            <td>{item.name}</td>
            <td>{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(PriceEstimateDialog), ['resolve']);
