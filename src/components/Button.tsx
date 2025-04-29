interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
  }
    
    const Button = ({ children, href, onClick, type = "button", className = "" }: ButtonProps) => {
      const baseStyles = "inline-block bg-[#b89b71] text-white text-sm px-5 py-2 rounded hover:bg-[#9e855c] transition";
    
      if (href) {
        return (
          <a href={href} className={`${baseStyles} ${className}`}>
            {children}
          </a>
        );
      }
    
      return (
        <button type={type} onClick={onClick} className={`${baseStyles} ${className}`}>
          {children}
        </button>
      );
    };
    
    export default Button;
  