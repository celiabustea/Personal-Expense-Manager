import React, { memo } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

const Heading = memo(({ level = 1, children, className = '' }: HeadingProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`heading heading-${level} ${className}`}>{children}</Tag>
  );
});

Heading.displayName = 'Heading';

export default Heading;
