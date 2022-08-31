import { FunctionComponent } from 'react';

interface HeroSectionProps {
  title: string;
}

export const HeroSection: FunctionComponent<HeroSectionProps> = (props) => (
  <>
    <div className="all-categories__background"></div>
    <div className="all-categories__table container-xxl">
      <div className="all-categories__cell">
        <div className="all-categories__main">
          <h1>{props.title}</h1>
        </div>
      </div>
    </div>
  </>
);
