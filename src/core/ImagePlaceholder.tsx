interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  className?: string;
}

export const ImagePlaceholder = (props: ImagePlaceholderProps) => {
  return (
    <span
      style={{
        width: props.width,
        minWidth: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
        borderRadius: '7px',
        display: 'inline-block',
      }}
    />
  );
};

ImagePlaceholder.defaultProps = {
  width: '24px',
  height: '24px',
  backgroundColor: '#eee',
};
