import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { OfferingTabs } from '@waldur/marketplace/details/OfferingTabs';
import { Offering, Section } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface OfferingDetailsDialogProps {
  resolve: { offeringUuid: string };
}

interface OfferingDetailsDialogState {
  loading: boolean;
  erred: boolean;
  offering: Offering;
  sections: Section[];
}

class OfferingDetailsDialog extends React.Component<OfferingDetailsDialogProps, OfferingDetailsDialogState> {
  state: OfferingDetailsDialogState = {
    loading: true,
    erred: false,
    offering: undefined,
    sections: undefined,
  };

  async componentDidMount() {
    try {
      const offering = await getOffering(this.props.resolve.offeringUuid);
      const category = await getCategory(offering.category_uuid);
      this.setState({
        offering,
        sections: category.sections,
        loading: false,
        erred: false,
      });
    } catch {
      this.setState({
        loading: false,
        erred: true,
      });
    }
  }

  renderBody() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }
    if (this.state.erred) {
      return translate('Unable to load offering details');
    }
    const { offering, sections } = this.state;
    return (
      <>
        <h3>{offering.name}</h3>
        <p>
          {offering.description && (
            <div className="bs-callout bs-callout-success">
              {offering.description}
            </div>
          )}
        </p>
        <OfferingTabs offering={offering} sections={sections}/>
      </>
    );
  }

  render() {
    return (
      <ModalDialog title={translate('Offering details')} footer={<CloseDialogButton/>}>
        {this.renderBody()}
      </ModalDialog>
    );
  }
}

export default connectAngularComponent(OfferingDetailsDialog, ['resolve']);
