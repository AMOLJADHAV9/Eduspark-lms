import React, { useEffect, useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaGraduationCap,
  FaSchool,
  FaImage,
  FaHeart,
  FaLink,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
  const { token, apiBaseUrl, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response && err.response.status === 404) {
          // Profile doesn't exist, create a default one
          const defaultProfile = {
            fullName: user?.name || '',
            email: user?.email || '',
            age: '',
            bio: '',
            interests: [],
            profilePicture: '',
            specialization: '',
            institution: '',
            experience: '',
            socialLinks: []
          };
          setProfile(defaultProfile);
          setForm(defaultProfile);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, apiBaseUrl, user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addInterest = () => {
    if (newInterest.trim() && !form.interests?.includes(newInterest.trim())) {
      setForm({
        ...form,
        interests: [...(form.interests || []), newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setForm({
      ...form,
      interests: (form.interests || []).filter(i => i !== interest)
    });
  };

  const handleSocialChange = (idx, field, value) => {
    const updated = [...(form.socialLinks || [])];
    updated[idx][field] = value;
    setForm({ ...form, socialLinks: updated });
  };

  const addSocial = () => {
    setForm({
      ...form,
      socialLinks: [...(form.socialLinks || []), { platform: '', url: '' }]
    });
  };

  const removeSocial = idx => {
    setForm({
      ...form,
      socialLinks: (form.socialLinks || []).filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${apiBaseUrl}/api/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEdit(false);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase() || 'T';
  };

  const getSocialIcon = (platform) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('linkedin')) return FaLinkedin;
    if (platformLower.includes('github')) return FaGithub;
    if (platformLower.includes('twitter')) return FaTwitter;
    return FaGlobe;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Profile not found. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-teal-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-teal-200">
                {getInitials(profile.fullName)}
              </div>
            )}
            {edit && (
              <button className="absolute -bottom-1 -right-1 bg-teal-500 text-white rounded-full p-2 hover:bg-teal-600 transition-colors">
                <FaImage className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Name and Edit Button */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.fullName || 'Teacher Name'}
            </h1>
            {!edit && (
              <button
                onClick={() => setEdit(true)}
                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2 mx-auto"
              >
                <FaEdit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FaUser className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              {edit ? (
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-800">{profile.fullName || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaEnvelope className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              {edit ? (
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              ) : (
                <p className="text-gray-800">{profile.email || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaBirthdayCake className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
              {edit ? (
                <input
                  type="number"
                  name="age"
                  value={form.age || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your age"
                />
              ) : (
                <p className="text-gray-800">{profile.age || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaGraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
              {edit ? (
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics"
                />
              ) : (
                <p className="text-gray-800">{profile.specialization || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaSchool className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Institution</label>
              {edit ? (
                <input
                  type="text"
                  name="institution"
                  value={form.institution || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your institution"
                />
              ) : (
                <p className="text-gray-800">{profile.institution || 'Not specified'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaGraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Experience (Years)</label>
              {edit ? (
                <input
                  type="number"
                  name="experience"
                  value={form.experience || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter years of experience"
                />
              ) : (
                <p className="text-gray-800">{profile.experience || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Bio</h2>
        {edit ? (
          <textarea
            name="bio"
            value={form.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            placeholder="Tell us about yourself, your teaching philosophy, and expertise..."
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {profile.bio || 'No bio available. Click "Edit Profile" to add your bio.'}
          </p>
        )}
      </div>

      {/* Interests Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Interests & Expertise</h2>
        {edit ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add a new interest"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <button
                onClick={addInterest}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-1"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.interests || []).map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeInterest(interest)}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(profile.interests || []).map((interest, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
            {(!profile.interests || profile.interests.length === 0) && (
              <p className="text-gray-500 italic">No interests added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Social Links Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h2>
        {edit ? (
          <div className="space-y-4">
            {(form.socialLinks || []).map((link, idx) => (
              <div key={idx} className="flex space-x-2">
                <input
                  placeholder="Platform (e.g., LinkedIn, GitHub)"
                  value={link.platform}
                  onChange={e => handleSocialChange(idx, 'platform', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  placeholder="URL"
                  value={link.url}
                  onChange={e => handleSocialChange(idx, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeSocial(idx)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addSocial}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add Social Link</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(profile.socialLinks || []).map((link, idx) => {
              const IconComponent = getSocialIcon(link.platform);
              return (
                <div key={idx} className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{link.platform}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 text-sm break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
              );
            })}
            {(!profile.socialLinks || profile.socialLinks.length === 0) && (
              <p className="text-gray-500 italic">No social links added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {edit && (
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setEdit(false);
              setForm(profile);
            }}
            className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FaTimes className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FaSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;