import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useEffect } from 'react';

import { MenuComponent } from '../assets/ts/components';

import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { PageDataProvider } from './core';

const MasterLayout = () => {
  const { state } = useCurrentStateAndParams();
  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 500);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 500);
  }, [state]);

  return (
    <PageDataProvider>
      <div className="page d-flex flex-row flex-column-fluid">
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div
            id="kt_content"
            className="content d-flex flex-column flex-column-fluid"
          >
            <div className="post d-flex flex-column-fluid" id="kt_post">
              <Content>
                <UIView />
              </Content>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </PageDataProvider>
  );
};

export { MasterLayout };
