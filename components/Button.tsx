import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-sm font-medium rounded-md focus:outline-none transition-all duration-200";
  
  const variants = {
    primary: "border-transparent text-black bg-jap-gold hover:bg-jap-goldLight shadow-[0_0_15px_rgba(212,175,55,0.3)]",
    secondary: "border-transparent text-jap-gold bg-jap-subtle hover:bg-jap-card",
    outline: "border-jap-gold text-jap-gold bg-transparent hover:bg-jap-gold hover:text-black",
    ghost: "border-transparent text-gray-400 hover:text-white"
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;