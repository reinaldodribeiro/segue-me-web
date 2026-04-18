export interface NavItemConfig {
  label: string;
  icon: React.ElementType;
  href: string;
}

export interface NavSection {
  /** Section label shown when sidebar is expanded. Hidden in collapsed mode. */
  label?: string;
  items: NavItemConfig[];
}
