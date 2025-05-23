import React from "react";
import { Sparkles } from "lucide-react";

interface TicketAssistantAnimationProps {
  className?: string;
}

const TicketAssistantAnimation: React.FC<TicketAssistantAnimationProps> = ({
  className = "",
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute animate-out opacity-75">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
    </div>
  );
};

export default TicketAssistantAnimation;
