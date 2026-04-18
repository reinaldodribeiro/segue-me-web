export interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}
