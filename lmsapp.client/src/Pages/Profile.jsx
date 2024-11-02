import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Book, Calendar } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
 
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.');
      return;
    }

    const formData = new FormData();
    formData.append('Id', user.id);
    formData.append('Email', userData.email);
    formData.append('FullName', userData.fullName);
    formData.append('Avatar', file);
    formData.append('AvatarPath', user.avatarPath || '');

    try {
      const token = localStorage.getItem('token') || '';
      
      const response = await axios.put(`https://localhost:7001/api/Users/${user.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      if (response.status === 200) {
        setUserData(prevData => ({
          ...prevData,
          avatarPath: response.data.user.avatarPath
        }));
        
        const userResponse = await axios.get('https://localhost:7001/api/Users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
        
        setAvatarPreview(URL.createObjectURL(file));
        alert('Avatar mis à jour avec succès');
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Données de l\'erreur:', error.response?.data);
      alert('Erreur lors de la mise à jour de l\'avatar');
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `https://localhost:7001/api/Users/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setUserData(prevData => ({
          ...prevData,
          avatarPath: null
        }));
        
        setAvatarPreview(null);
        
        const userResponse = await axios.get('https://localhost:7001/api/Users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }

        alert('Avatar supprimé avec succès');
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'avatar');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('id', user.id);
      formData.append('email', userData.email);
      formData.append('fullName', userData.fullName);
      formData.append('avatar', null);
      formData.append('avatarPath', user.avatarPath || 'default-avatar.png');
      
      await axios.put(`https://localhost:7001/api/Users/${user.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsEditing(false);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data);
      alert('Erreur lors de la mise à jour du profil');
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
                        src={user.avatarPath} 
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`${
                      activeTab === 'courses'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    My Courses
                  </button>
                </nav>
              </div>

              {activeTab === 'profile' && (
                <div className="mt-6">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          value={userData.fullName}
                          onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
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
              )}

              {activeTab === 'courses' && (
                <div className="mt-6">
                  <p className="text-gray-500">No courses enrolled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;