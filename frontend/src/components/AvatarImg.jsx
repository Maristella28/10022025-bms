import React, { useState } from "react";

const AvatarImg = ({ avatarPath, alt = "avatar", className = "w-12 h-12 rounded-full object-cover" }) => {
  const [imgSrc, setImgSrc] = useState(
    avatarPath && avatarPath !== "" && avatarPath !== "avatar" && avatarPath !== "avatars/"
      ? `http://localhost:8000/storage/${avatarPath}`
      : "/default-avatar.png"
  );

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("/default-avatar.png")}
    />
  );
};

export default AvatarImg;
