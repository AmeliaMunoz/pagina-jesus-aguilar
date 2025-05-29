import { PlusCircle } from "lucide-react";

interface Props {
  nombre: string;
}

const UserWelcomeCard = ({ nombre }: Props) => {
  return (
    <div className="relative bg-white border border-[#e0d6ca] shadow-xl rounded-2xl p-6 md:p-10 text-[#5f4b32]">
      <h1 className="text-3xl font-bold mb-2">¡Hola, {nombre}!</h1>
      <p className="text-base text-[#5f4b32]/90">
        Bienvenido a tu espacio personal. Aquí puedes gestionar tus sesiones, revisar tu progreso y mantener el contacto con tu psicólogo.
      </p>
      <div className="absolute top-4 right-4 opacity-10">
        <PlusCircle className="w-12 h-12 text-[#b89b71]" />
      </div>
    </div>
  );
};

export default UserWelcomeCard;
