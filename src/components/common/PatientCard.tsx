

import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  onClick?: () => void;
}

const PatientCard = ({ title, children, onClick }: Props) => {
    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg cursor-pointer transition duration-200 ${
          onClick ? "hover:bg-[#f8f1e7]" : ""
        }`}
      >
        <h2 className="text-lg font-semibold text-[#5f4b32] mb-4">{title}</h2>
        <div className="text-[#5f4b32] text-sm">{children}</div>
      </div>
    );
  };
  
export default PatientCard;
