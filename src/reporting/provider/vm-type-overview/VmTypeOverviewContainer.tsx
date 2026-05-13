import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';

import { ReportingTitle } from '../../ReportingTitle';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  return (
    <Form
      onSubmit={() => {}}
      initialValues={{ shared: true }}
      render={() => (
        <>
          <ReportingTitle reportKey="vm-type-overview">
            <VmOverviewFilterContainer />
          </ReportingTitle>
          <VmTypeOverview />
        </>
      )}
    />
  );
};
