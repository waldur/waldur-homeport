interface HeroSectionProps {
  title: string;
}

export const HeroSection = (props: HeroSectionProps) => (
  <>
    <div className="public-calls-hero__background"></div>
    <div className="public-calls-hero__table">
      <div className="public-calls-hero__cell">
        <div className="public-calls-hero__main">
          <h1>{props.title}</h1>
        </div>
      </div>
    </div>
  </>
);
