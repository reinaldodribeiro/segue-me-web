'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';

// Team templates are managed inline in the movement detail page
export default function MovementTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  redirect(`/app/movements/${id}`);
}
