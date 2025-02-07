import { Button } from "./ui/button";

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
}

export function ActionButton({ onClick, icon }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="h-10 w-10"
    >
      {icon}
    </Button>
  );
} 