import React from 'react';
import { img_path} from '../../environment'

interface Image {
  className?: string;
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  id?:string;
}
const getImagePath = (img_path: string, src: string) => {
  if (img_path.endsWith('/') && src.startsWith('/')) {
    return `${img_path}${src.substring(1)}`;
  } else if (!img_path.endsWith('/') && !src.startsWith('/')) {
    return `${img_path}/${src}`;
  } else {
    return `${img_path}${src}`;
  }
};

// Usage 
const ImageWithBasePath = (props: Image) => {
  // Combine the base path and the provided src to create the full image source URL
  const fullSrc = getImagePath(img_path, props.src);
  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
    />
  );
};

export default ImageWithBasePath;
