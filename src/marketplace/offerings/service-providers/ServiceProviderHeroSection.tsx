import { FunctionComponent } from 'react';

import { Category, ServiceProvider } from '@waldur/marketplace/types';

import { ServiceProviderEditorButton } from './ServiceProviderEditorButton';
import { Logo } from './shared/Logo';
import './ServiceProviderHeroSection.scss';

interface ServiceProviderHeroSectionProps {
  category: Category;
  serviceProvider: ServiceProvider;
  refreshServiceProvider(): void;
}

export const ServiceProviderHeroSection: FunctionComponent<ServiceProviderHeroSectionProps> =
  (props) => {
    return (
      <div className="serviceProvider-category-hero">
        <div className="category-hero__background-left">
          <div className="category-hero__table">
            <div className="category-hero__main">
              {props.category ? (
                <>
                  <h1>{props.category.title}</h1>
                  <p>{props.category.description}</p>
                </>
              ) : (
                <div className="serviceProvider__card">
                  <div className="serviceProvider__card__info">
                    <h2>
                      <ServiceProviderEditorButton
                        provider={props.serviceProvider}
                        refreshServiceProvider={props.refreshServiceProvider}
                      />
                      {props.serviceProvider.customer_abbreviation ||
                        props.serviceProvider.customer_name}
                    </h2>
                    {props.serviceProvider.description && (
                      <p>{props.serviceProvider.description}</p>
                    )}
                  </div>
                  <Logo
                    image={props.serviceProvider.customer_image}
                    placeholder={props.serviceProvider.customer_name[0]}
                    height={70}
                    width={120}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="category-hero__background-right"
          style={
            props.category && props.category.icon
              ? {
                  backgroundImage: `url(${props.category.icon})`,
                  backgroundSize: 'contain',
                }
              : {}
          }
        ></div>
      </div>
    );
  };
