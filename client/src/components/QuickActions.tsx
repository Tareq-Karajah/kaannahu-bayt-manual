import { quickActions } from "@/data/guideContent";

interface QuickActionsProps {
  onActionClick: (sectionId: string) => void;
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action.sectionId)}
          className={`${action.color} border border-border rounded-lg p-4 text-right hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1`}
        >
          <div className="text-3xl mb-2">{action.icon}</div>
          <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
          <p className="text-sm text-muted-foreground">{action.description}</p>
        </button>
      ))}
    </div>
  );
}
