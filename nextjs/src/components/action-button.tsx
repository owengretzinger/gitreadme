import { Button } from "./ui/button";
import { cn } from "~/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  text?: string;
}

export function ActionButton({
  onClick,
  icon,
  className,
  text,
}: ActionButtonProps) {
  const handleClick = () => {
    onClick();
  };

  return (
    <div className="group relative w-24 rounded-lg bg-gradient-to-br from-[#efc900] via-[#f59e0b] to-[#F5833F] p-[1px] shadow-lg shadow-[#f59e0b]/20">
      <Button
        variant="outline"
        onClick={handleClick}
        className={cn(
          "relative flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border-none bg-background px-4 hover:bg-background/80",
          "transition-all duration-200 ease-in-out",
          "hover:text-[#f59e0b]",
          className,
        )}
      >
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </Button>
    </div>
  );
}
