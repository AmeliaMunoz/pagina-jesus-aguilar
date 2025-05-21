import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout";
import { UserMinus, Mail } from "lucide-react";

interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  activo?: boolean;
}

const AdminDeleteUsersPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const cargarUsuarios = async () => {
    const snap = await getDocs(collection(db, "usuarios"));
    const data = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() })) as Usuario[];
    const ordenados = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
    setUsuarios(ordenados);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarEstadoUsuario = async (usuario: Usuario, estado: boolean) => {
    try {
      await updateDoc(doc(db, "usuarios", usuario.uid), { activo: estado });
      const mensaje = estado ? "✅ Usuario activado" : "🚫 Usuario desactivado";
      setMensajeExito(`${mensaje}: ${usuario.email}`);
      await cargarUsuarios();
      setTimeout(() => setMensajeExito(""), 4000);
    } catch (error) {
      console.error("❌ Error al cambiar estado de usuario:", error);
      setMensajeError("❌ No se pudo actualizar el estado del usuario.");
      setTimeout(() => setMensajeError(""), 4000);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const usuariosPorLetra = usuariosFiltrados.reduce((acc, usuario) => {
    const letra = usuario.nombre.charAt(0).toUpperCase();
    if (!acc[letra]) acc[letra] = [];
    acc[letra].push(usuario);
    return acc;
  }, {} as Record<string, Usuario[]>);

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#5f4b32] flex items-center gap-2">
            <UserMinus className="w-6 h-6" /> Gestión de usuarios
          </h2>

          {mensajeExito && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-6 text-sm text-center">
              {mensajeExito}
            </div>
          )}

          {mensajeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-6 text-sm text-center">
              {mensajeError}
            </div>
          )}

          <div className="w-full max-w-md mx-auto mb-10">
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
            />
          </div>

          {usuariosFiltrados.length === 0 ? (
            <p className="text-sm text-gray-600 text-center">No se encontraron usuarios.</p>
          ) : (
            Object.entries(usuariosPorLetra).map(([letra, grupo]) => (
              <div key={letra} className="mb-8">
                <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">{letra}</h3>
                <div className="space-y-4">
                  {grupo.map((usuario) => (
                    <div
                      key={usuario.uid}
                      className="border border-[#e0d6ca] rounded-xl p-6 bg-[#fdf8f4] shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                    >
                      <div>
                        <p className="font-medium text-[#5f4b32] text-base">
                          {usuario.nombre} {usuario.activo === false && <span className="text-red-500 text-sm">(desactivado)</span>}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <Mail size={14} /> {usuario.email}
                        </p>
                        {usuario.telefono && (
                          <p className="text-sm text-gray-700">{usuario.telefono}</p>
                        )}
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {usuario.activo === false ? (
                          <button
                            onClick={() => cambiarEstadoUsuario(usuario, true)}
                            className="text-sm text-green-700 hover:text-green-900 underline"
                          >
                            Activar
                          </button>
                        ) : (
                          <button
                            onClick={() => cambiarEstadoUsuario(usuario, false)}
                            className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDeleteUsersPage;

