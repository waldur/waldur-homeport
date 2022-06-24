import './ImagePlaceholder.css';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  className?: string;
}

export const ImagePlaceholder = (props: ImagePlaceholderProps) => {
  return (
    <div
      className="image-placeholder"
      style={{
        width: props.width,
        minWidth: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
      }}
    />
  );
};

ImagePlaceholder.defaultProps = {
  width: '24px',
  height: '24px',
  backgroundColor: '#eee',
};
