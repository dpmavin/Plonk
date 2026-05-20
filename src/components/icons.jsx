// All icons: 20x20, stroke 1.8, color: currentColor

export const MemoryBookIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect x="3" y="2" width="11" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M14 2h1a2 2 0 012 2v12a2 2 0 01-2 2h-1" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M6 7h5M6 10h5M6 13h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const PenIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M14 3l3 3-9 9H5v-3l9-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M12 5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const CrayonIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M5 15l1.5-4L13 4.5 15.5 7l-6.5 6.5L5 15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M5 15l2-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M13 4.5l1-1a1 1 0 011.4 0l.6.6a1 1 0 010 1.4l-1 1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

export const TextIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M4 5h12M10 5v10M7 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const MarkerIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    {/* Chisel-tip marker body */}
    <path
      d="M6.5 13.5l7-7 2.5 2.5-7 7-3.5 1 1-3.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Cap line at top of stroke */}
    <path
      d="M13 7l3 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Highlight underline showing ink mark */}
    <path
      d="M4 17h6"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeOpacity="0.45"
    />
  </svg>
);

export const EraserIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M3.5 13.5l6-6a1.5 1.5 0 012.1 0l3.4 3.4a1.5 1.5 0 010 2.1L11 17H6l-2.5-2.5a1 1 0 010-1z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M8 9.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const SparkIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M10 2.5l1.6 4.2a3 3 0 001.7 1.7L17.5 10l-4.2 1.6a3 3 0 00-1.7 1.7L10 17.5l-1.6-4.2a3 3 0 00-1.7-1.7L2.5 10l4.2-1.6a3 3 0 001.7-1.7L10 2.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.15"
    />
  </svg>
);

export const ClearIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M4 6h12M8 6V4h4v2M15 6l-1 10H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SaveIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M5 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M7 3v5h6V3M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const PlayIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M6 4l12 6-12 6V4z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" strokeLinejoin="round"/>
  </svg>
);

export const PauseIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/>
    <rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/>
  </svg>
);

export const CloseIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const BackIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M12 4L5 10l7 6M5 10h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EyeIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

export const CanvasIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect
      x="2.5"
      y="4"
      width="15"
      height="10"
      rx="1.6"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M7 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const PlusCircleIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M10 6.5v7M6.5 10h7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const CameraIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect
      x="2"
      y="5.5"
      width="16"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M7 5.5l1.4-2h3.2L13 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const CameraOffIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect
      x="2"
      y="5.5"
      width="16"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M7 5.5l1.4-2h3.2L13 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
    {/* diagonal slash */}
    <path
      d="M3 3l14 14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const EyeOffIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8 5.5C8.6 5.4 9.3 5.3 10 5.3c5 0 8 4.7 8 4.7s-.8 1.3-2.3 2.6M5 7.5c-2 1.6-3 2.5-3 2.5s3 6 8 6c1.3 0 2.4-.3 3.4-.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PinIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M12 3l5 5-2 2-2-1-4 4 1 2-2 2-3-3-3 3-1-1 3-3-3-3 2-2 2 1 4-4-1-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

export const CheckIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DownloadIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M10 3v10m0 0l-4-4m4 4l4-4M3 16h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
