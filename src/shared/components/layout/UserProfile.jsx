import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../features/login/slices/loginSlice';
import { selectUser } from '../../../features/login/slices/loginSelectors';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  if (!user || !user.uid) return null;

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2',
        cancelButton: 'px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400',
      },
    });

    if (result.isConfirmed) {
      dispatch(logout());
      navigate('/login');
      Swal.fire({
        title: '¡Sesión cerrada!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="font-semibold text-sm">{user.name}</p>
        <p className="text-xs text-muted-light dark:text-muted-dark">{user.rol}</p>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-muted-light/20 dark:hover:bg-muted-dark/20 transition-colors"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
      </button>
    </div>
  );
}