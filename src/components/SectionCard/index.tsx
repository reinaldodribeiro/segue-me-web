import { SectionCardProps } from './types';

const SectionCard: SafeFC<SectionCardProps> = ({ title, children, action, ...rest }) => {
  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden" {...rest}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default SectionCard;
