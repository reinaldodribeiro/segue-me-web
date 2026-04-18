export default function EvaluationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
}
