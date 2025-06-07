export interface ContainerProps {
  variant: 'main' | 'section' | 'article';
  color?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
