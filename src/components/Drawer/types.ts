export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Tailwind width class. Default: 'w-80' */
  width?: string;
  side?: 'right' | 'left';
}
