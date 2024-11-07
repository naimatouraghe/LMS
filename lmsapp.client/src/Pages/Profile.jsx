import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '@/utils/axios';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const avatarUrl = user?.avatarPath
    ? `${import.meta.env.VITE_API_URL}${user.avatarPath}`
    : null;
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('Aucun fichier sélectionné');
      return;
    }

    console.log('Fichier sélectionné:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Vérifications
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('fullName', userData.fullName);
      formData.append('avatar', file);

      const response = await axiosInstance.put(
        `/Auth/users/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Réponse du serveur:', response.data);

      if (response.data?.value) {
        const updatedUser = {
          ...user,
          ...response.data.value,
        };

        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAvatarPreview(
          `${import.meta.env.VITE_API_URL}${updatedUser.avatarPath}`
        );
        alert('Avatar mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la mise à jour de l'avatar";
      alert(errorMessage);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      // Utilisation de la méthode DELETE pour supprimer l'avatar
      const response = await axiosInstance.delete(
        `/Auth/users/${user.id}/avatar`
      );

      if (response.data?.message) {
        setAvatarPreview(null);
        const updatedUser = { ...user, avatarPath: null };

        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Avatar supprimé avec succès');
      }
    } catch (error) {
      console.error(
        'Erreur lors de la suppression:',
        error.response?.data.errors
      );
      alert("Erreur lors de la suppression de l'avatar");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!userData.email || !userData.fullName) {
      alert('Email et nom complet sont requis');
      return;
    }

    if (!userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Format d'email invalide");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', userData.email.trim());
      formData.append('fullName', userData.fullName.trim());

      const response = await axiosInstance.put(
        `/Auth/users/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.value) {
        setIsEditing(false);
        const updatedUser = { ...user, ...response.data.value };

        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('API Error:', error.response?.data);
      console.error('Erreur lors de la mise à jour du profil:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Erreur lors de la mise à jour du profil';
      alert(errorMessage);
    }
  };

  const handleDeactivateAccount = async () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir désactiver votre compte ? Cette action ne peut pas être annulée.'
      )
    ) {
      try {
        const response = await axiosInstance.put(
          `/Auth/users/${user.id}/deactivate`
        );

        if (response.data?.message) {
          alert('Compte désactivé avec succès');
          logout();
        }
      } catch (error) {
        console.error('Erreur lors de la désactivation:', error);
        alert('Erreur lors de la désactivation du compte');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative">
                <div
                  onClick={handleAvatarClick}
                  className="relative h-24 w-24 cursor-pointer group"
                >
                  <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.avatarPath ? (
                      <img
                        src={avatarUrl}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>{user?.fullName?.[0]}</>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Changer</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                {user?.avatarPath && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Supprimer l'avatar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="sm:ml-6 text-center sm:text-left mt-4 sm:mt-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.fullName}
                </h1>
                <p className="text-gray-500 mt-1">{userData.email}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Student
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mt-6">
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={userData.fullName}
                        onChange={(e) =>
                          setUserData({ ...userData, fullName: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end space-x-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-red-600">
                  Zone dangereuse
                </h2>
                <p className="text-sm text-gray-500">
                  Une fois votre compte désactivé, toutes vos données seront
                  inaccessibles. Cette action ne peut pas être annulée.
                </p>
                <button
                  onClick={handleDeactivateAccount}
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Désactiver mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
