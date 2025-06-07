import { HTMLMotionProps } from 'framer-motion';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'p' | 'b' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  secondary?: boolean;
  className?: string;
}



