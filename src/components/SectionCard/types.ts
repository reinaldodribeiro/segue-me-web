import React from 'react';

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}
