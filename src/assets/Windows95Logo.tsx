import React from 'react';

interface Windows95LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

// Authentic Windows 95 waving flag logo with trailing pixels
const Windows95Logo: React.FC<Windows95LogoProps> = ({
  width = 150,
  height = 150,
  className
}) => {
  // Colors from the original Windows 95 logo
  const red = '#C10000';
  const green = '#00A800';
  const blue = '#0000D4';
  const yellow = '#D4D400';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trailing pixels - Red section */}
      <rect x="5" y="8" width="3" height="3" fill={red} />
      <rect x="10" y="6" width="3" height="3" fill={red} />
      <rect x="10" y="10" width="3" height="3" fill={red} />
      <rect x="15" y="4" width="3" height="3" fill={red} />
      <rect x="15" y="8" width="3" height="3" fill={red} />
      <rect x="15" y="12" width="3" height="3" fill={red} />
      <rect x="20" y="6" width="3" height="3" fill={red} />
      <rect x="20" y="10" width="3" height="3" fill={red} />
      <rect x="20" y="14" width="3" height="3" fill={red} />
      <rect x="25" y="8" width="3" height="3" fill={red} />
      <rect x="25" y="12" width="3" height="3" fill={red} />
      <rect x="25" y="16" width="3" height="3" fill={red} />

      {/* Trailing pixels - Green section */}
      <rect x="58" y="4" width="3" height="3" fill={green} />
      <rect x="62" y="6" width="3" height="3" fill={green} />
      <rect x="66" y="8" width="3" height="3" fill={green} />
      <rect x="70" y="10" width="3" height="3" fill={green} />
      <rect x="74" y="12" width="3" height="3" fill={green} />
      <rect x="78" y="14" width="3" height="3" fill={green} />
      <rect x="82" y="16" width="3" height="3" fill={green} />
      <rect x="86" y="18" width="3" height="3" fill={green} />
      <rect x="90" y="20" width="3" height="3" fill={green} />

      {/* Trailing pixels - Blue section */}
      <rect x="5" y="52" width="3" height="3" fill={blue} />
      <rect x="10" y="54" width="3" height="3" fill={blue} />
      <rect x="15" y="56" width="3" height="3" fill={blue} />
      <rect x="20" y="58" width="3" height="3" fill={blue} />
      <rect x="25" y="60" width="3" height="3" fill={blue} />

      {/* Trailing pixels - Yellow section */}
      <rect x="58" y="52" width="3" height="3" fill={yellow} />
      <rect x="62" y="54" width="3" height="3" fill={yellow} />
      <rect x="66" y="56" width="3" height="3" fill={yellow} />
      <rect x="70" y="58" width="3" height="3" fill={yellow} />
      <rect x="74" y="60" width="3" height="3" fill={yellow} />
      <rect x="78" y="62" width="3" height="3" fill={yellow} />
      <rect x="82" y="64" width="3" height="3" fill={yellow} />
      <rect x="86" y="66" width="3" height="3" fill={yellow} />
      <rect x="90" y="68" width="3" height="3" fill={yellow} />

      {/* Main flag - Red quadrant (top-left) - with wave distortion */}
      <path
        d="M30 20
           Q35 15, 45 18
           L45 45
           L30 45
           Z"
        fill={red}
      />

      {/* Main flag - Green quadrant (top-right) - with wave distortion */}
      <path
        d="M45 18
           Q55 12, 70 22
           L70 45
           L45 45
           Z"
        fill={green}
      />

      {/* Main flag - Blue quadrant (bottom-left) - with wave distortion */}
      <path
        d="M30 45
           L45 45
           L45 72
           Q35 78, 30 70
           Z"
        fill={blue}
      />

      {/* Main flag - Yellow quadrant (bottom-right) - with wave distortion */}
      <path
        d="M45 45
           L70 45
           L70 78
           Q55 85, 45 72
           Z"
        fill={yellow}
      />
    </svg>
  );
};

export default Windows95Logo;
