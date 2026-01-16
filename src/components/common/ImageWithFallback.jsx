import React from 'react';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=60',
  ...rest
}) {
  const [imgSrc, setImgSrc] = React.useState(src);

  React.useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setImgSrc(fallbackSrc)}
      className={className}
      {...rest}
    />
  );
}