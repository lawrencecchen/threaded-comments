import * as React from 'react';

function SvgComponent(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    // <svg
    //   viewBox="0 0 24 24"
    //   stroke="currentColor"
    //   strokeWidth={1}
    //   fill="none"
    //   strokeLinecap="round"
    //   strokeLinejoin="round"
    //   {...props}
    // >
    //   <circle cx={12} cy={12} r={10} />
    //   <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    // </svg>
  );
}

export default SvgComponent;
