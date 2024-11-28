import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api/authApi';
import { User, Camera, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [userData, setUserData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    try {
      // Si c'est déjà une URL complète
      if (avatarPath.startsWith('http')) {
        return avatarPath;
      }

      // Retirer le préfixe /api de VITE_API_URL
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

      // Nettoyer le chemin en retirant le slash initial s'il existe
      const cleanPath = avatarPath.startsWith('/')
        ? avatarPath.slice(1)
        : avatarPath;

      // Construire l'URL correcte
      return `${baseUrl}/${cleanPath}`;
    } catch (error) {
      console.error(
        "Erreur lors de la construction de l'URL de l'avatar:",
        error
      );
      return null;
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Avatar', file);
      formData.append('FullName', user.fullName);
      formData.append('Email', user.email);

      const response = await authApi.updateUser(user.id, formData);

      if (response?.value) {
        // Mise à jour correcte avec le nouveau chemin d'avatar
        const updatedUser = {
          ...user,
          avatar: response.value.avatarPath, // Utiliser avatarPath au lieu de avatar
        };
        updateUser(updatedUser);
        setAvatarPreview(null);
        setImgError(false);
        toast.success('Avatar mis à jour avec succès');
      }
    } catch (error) {
      console.error("Erreur de mise à jour de l'avatar:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'avatar"
      );
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('FullName', user.fullName);
      formData.append('Email', user.email);
      formData.append('AvatarPath', '');

      await authApi.updateUser(user.id, formData);
      setAvatarPreview(null);
      setImgError(false);
      const updatedUser = { ...user, avatar: null };
      updateUser(updatedUser);
      toast.success('Avatar supprimé avec succès');
    } catch (error) {
      console.error("Erreur de suppression de l'avatar:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'avatar"
      );
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!userData.email || !userData.fullName) {
      toast.error('Email et nom complet sont requis');
      return;
    }

    if (!userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Format d'email invalide");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Email', userData.email.trim());
      formData.append('FullName', userData.fullName.trim());

      const response = await authApi.updateUser(user.id, formData);

      if (response?.value) {
        setIsEditing(false);
        const updatedUser = { ...user, ...response.value };
        updateUser(updatedUser);
        toast.success('Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const isConfirmed = window.confirm(
        'Êtes-vous sûr de vouloir désactiver votre compte ? Cette action est irréversible.'
      );

      if (!isConfirmed) return;

      await authApi.deactivateUser(user.id);
      toast.success('Compte désactivé avec succès');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur de désactivation:', error);
      toast.error(error.message || 'Erreur lors de la désactivation du compte');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Profil</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {!imgError && (user?.avatar || avatarPreview) ? (
                <img
                  src={avatarPreview || getAvatarUrl(user.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {user?.avatar && !imgError && (
            <button
              onClick={handleDeleteAvatar}
              className="ml-4 p-2 text-red-600 hover:text-red-700"
              title="Supprimer l'avatar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={userData.fullName}
                onChange={(e) =>
                  setUserData({ ...userData, fullName: e.target.value })
                }
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setUserData({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                      });
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Zone de danger
        </h2>
        <p className="text-gray-600 mb-4">
          La désactivation de votre compte est irréversible. Toutes vos données
          seront supprimées.
        </p>
        <button
          onClick={handleDeactivateAccount}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Désactiver mon compte
        </button>
      </div>
    </div>
  );
};

export default Profile;
