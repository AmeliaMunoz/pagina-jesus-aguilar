import { Menu, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const HamburgerButton = ({ isOpen, onToggle }: Props) => {
  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      <button
        onClick={onToggle}
        className="p-2 rounded bg-[#f5ede3] shadow"
      >
        {isOpen ? (
          <X className="text-[#b89b71] w-6 h-6" />
        ) : (
          <Menu className="text-[#b89b71] w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default HamburgerButton;
