import React from "react";

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  className = "",
  color = "currentColor",
}) => {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span
        className="animate-bounce mx-0.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, animationDelay: "0ms" }}
      />
      <span
        className="animate-bounce mx-0.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, animationDelay: "150ms" }}
      />
      <span
        className="animate-bounce mx-0.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, animationDelay: "300ms" }}
      />
    </span>
  );
};

export default LoadingDots;
