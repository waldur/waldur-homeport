import * as React from 'react';

import './HeroSection.scss';

interface HeroSectionProps {
  header: string;
  placeholder: string;
  buttonLabel: string;
}

export const HeroSection = (props: HeroSectionProps) => (
  <div className="marketplace-hero__background">
    <div className="marketplace-hero__table">
      <div className="marketplace-hero__main">
        <h1>{props.header}</h1>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={props.placeholder}/>
          <span className="input-group-btn">
            <button className="btn btn-primary">
              {props.buttonLabel}
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
);
