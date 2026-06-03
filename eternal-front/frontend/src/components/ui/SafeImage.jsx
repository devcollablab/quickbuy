import { useState } from "react";
import { FALLBACK } from "../../data/images";

export default function SafeImage({
  src,
  fallback,
  alt = "",
  className = "",
  ...props
}) {
  const [current, setCurrent] = useState(src);

  const handleError = () => {
    if (fallback && current !== fallback) setCurrent(fallback);
  };

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}

export function resolveImage(localPath, fallbackKey) {
  return { src: localPath, fallback: FALLBACK[fallbackKey] };
}
