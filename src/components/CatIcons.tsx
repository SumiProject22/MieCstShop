import React from 'react';

export function CatBrandMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 14.5L9.5 6.5C9.8 5.6 10.9 5.3 11.6 5.9L15.4 9.2C16.2 9 17.1 8.9 18 8.9C18.9 8.9 19.8 9 20.6 9.2L24.4 5.9C25.1 5.3 26.2 5.6 26.5 6.5L29 14.5C30.3 16.3 31 18.4 31 20.7C31 26.7 25.2 31 18 31C10.8 31 5 26.7 5 20.7C5 18.4 5.7 16.3 7 14.5Z"
        fill="#F9E0E9"
        stroke="#C83E6B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="13.5" cy="19.5" r="1.4" fill="#362029" />
      <circle cx="22.5" cy="19.5" r="1.4" fill="#362029" />
      <path
        d="M16.5 22.5C17 23.2 19 23.2 19.5 22.5"
        stroke="#C83E6B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 21.2L17.1 22.2H18.9L18 21.2Z"
        fill="#C83E6B"
      />
      <path
        d="M9 20.5H5.5M9.5 22.8H6.5M27 20.5H30.5M26.5 22.8H29.5"
        stroke="#C83E6B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CatPawIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="8.5" r="1.75" fill="currentColor" />
      <circle cx="12" cy="6.5" r="1.75" fill="currentColor" />
      <circle cx="17" cy="8.5" r="1.75" fill="currentColor" />
      <circle cx="4.5" cy="13" r="1.5" fill="currentColor" />
      <path
        d="M12 11.5C9.2 11.5 7 13.7 7 16.4C7 18.2 8.4 19.5 10.2 19.5C11 19.5 11.5 19.1 12 19.1C12.5 19.1 13 19.5 13.8 19.5C15.6 19.5 17 18.2 17 16.4C17 13.7 14.8 11.5 12 11.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
