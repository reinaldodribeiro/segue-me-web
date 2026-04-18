'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import Button from '@/components/Button';
import SectionCard from '@/components/SectionCard';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTutorialContext } from '@/context/TutorialContext';
import UserService from '@/services/api/UserService';

const TutorialSection: React.FC = () => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { resetTutorial } = useTutorialContext();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    try {
      await UserService.resetTutorial();
      resetTutorial();
      toast({ title: 'Tutorial reiniciado. Ele aparecerá novamente ao navegar pelas páginas.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleReset()');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Tutorial"
      action={<GraduationCap size={15} className="text-text-muted" />}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          Reinicie o tutorial para vê-lo novamente ao navegar pelas páginas do sistema.
        </p>
        <Button
          type="button"
          variant="secondary"
          loading={loading}
          onClick={handleReset}
        >
          Reiniciar tutorial
        </Button>
      </div>
    </SectionCard>
  );
};

export default TutorialSection;
