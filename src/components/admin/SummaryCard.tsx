
import { JSX } from "react";

interface Props {
  icon: JSX.Element;
  title: string;
  count: number;
  color: string;
}

const SummaryCard = ({ icon, title, count, color }: Props) => (
  <div className="bg-[#fdf8f4] border border-[#e0d6ca] rounded-xl p-6 3xl:p-8 flex items-center gap-4 3xl:gap-6 shadow-md">
    {icon}
    <div>
      <p className="text-sm 3xl:text-base text-[#5f4b32]">{title}</p>
      <p className={`text-xl 3xl:text-2xl font-bold ${color}`}>{count}</p>
    </div>
  </div>
);

export default SummaryCard;
