
import { SendHorizontal } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
}

const PatientMessageInput = ({ value, onChange, onSend, loading }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <textarea
        className="flex-1 border rounded p-3 text-sm"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu mensaje para el terapeuta..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        onClick={onSend}
        disabled={loading || !value.trim()}
        className="bg-[#5f4b32] text-white px-4 py-2 rounded hover:bg-[#b89b71] disabled:opacity-50 flex items-center justify-center"
      >
        <SendHorizontal size={20} />
      </button>
    </div>
  );
};

export default PatientMessageInput;
