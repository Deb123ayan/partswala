'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Save, X } from 'lucide-react';
import pb from '../lib/pocketbase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = pb.authStore.model;
        if (user) {
          setProfileData({
            email: user.email,
            name: user.name || '',
            phone: user.phone || ''
          });
          setFormData({
            name: user.name || '',
            phone: user.phone || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form submission
  const handleSave = async () => {
    // Validate phone number
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      setError('Phone number must be 10-15 digits');
      return;
    }

    try {
      await pb.collection('users').update(pb.authStore.model?.id, {
        name: formData.name,
        phone: formData.phone
      });
      setProfileData(prev => ({
        ...prev,
        name: formData.name,
        phone: formData.phone
      }));
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cancel editing
  const cancelEditing = () => {
    setFormData({
      name: profileData.name,
      phone: profileData.phone
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-blue-200 p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-blue-900">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-medium text-blue-900">{profileData.name || 'User'}</h2>
                <p className="text-blue-600">{profileData.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-blue-500">Email</p>
                  <p className="text-blue-900 font-medium">{profileData.email}</p>
                </div>
              </div>

              {isEditing ? (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-500">Name</p>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg text-blue-900 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-500">Phone</p>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg text-blue-900 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                        placeholder="Enter your phone number"
                        pattern="[0-9]{10,15}"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {profileData.name && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-500">Name</p>
                        <p className="text-blue-900 font-medium">{profileData.name}</p>
                      </div>
                    </div>
                  )}

                  {profileData.phone && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-500">Phone</p>
                        <p className="text-blue-900 font-medium">{profileData.phone}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}