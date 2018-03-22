import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface InvoiceItem {
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
      <tbody>
        {props.resolve.items.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(PriceEstimateDialog), ['resolve']);
