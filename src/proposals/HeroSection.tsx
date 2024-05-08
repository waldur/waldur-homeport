interface HeroSectionProps {
  title: string;
}

export const HeroSection = (props: HeroSectionProps) => (
  <>
    <div className="public-calls-hero__background">
      <div className="public-calls-hero__background-text">
        <h1>{props.title}</h1>
      </div>
    </div>
  </>
);
