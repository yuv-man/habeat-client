import { useState } from "react";
import { findMealImage } from "@/lib/mealImageHelper";

interface DishPictureProps {
  name: string;
  /** The dish's own picture, when one is stored for it. */
  imageUrl?: string;
  /** Shown when no picture loads. Nothing is shown when omitted. */
  icon?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * A dish's picture that never shows as broken. Tries the dish's own image,
 * then an app meal photo whose name covers every word of the dish's, then
 * falls back to the icon. The own images (public/images/dishes) are listed
 * on the server but not all shipped yet, so the first one can 404.
 */
const DishPicture = ({ name, imageUrl, icon, className, iconClassName }: DishPictureProps) => {
  const sources = [imageUrl, findMealImage(name, { exact: true })].filter(
    (src, i, all): src is string => !!src && all.indexOf(src) === i,
  );
  const [failed, setFailed] = useState(0);
  const src = sources[failed];

  if (!src) {
    return icon ? (
      <span className={iconClassName} aria-hidden="true">
        {icon}
      </span>
    ) : null;
  }
  return (
    <img
      key={src}
      src={src}
      alt=""
      loading="lazy"
      className={className}
      onError={() => setFailed((n) => n + 1)}
    />
  );
};

export default DishPicture;
