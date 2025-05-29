
interface Props {
    value: string;
    onChange: (value: string) => void;
  }
  
  const UserSearchInput = ({ value, onChange }: Props) => {
    return (
      <div className="w-full max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded text-sm"
        />
      </div>
    );
  };
  
  export default UserSearchInput;
  