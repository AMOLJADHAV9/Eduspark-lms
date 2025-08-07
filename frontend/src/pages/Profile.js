import React, { useEffect, useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Textarea, Button, VStack, Avatar, HStack, IconButton, useToast } from '@chakra-ui/react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { token, apiBaseUrl } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        toast({ title: 'Error loading profile', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, toast, apiBaseUrl]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInterestsChange = (idx, value) => {
    const updated = [...(form.interests || [])];
    updated[idx] = value;
    setForm({ ...form, interests: updated });
  };

  const addInterest = () => {
    setForm({ ...form, interests: [...(form.interests || []), ''] });
  };

  const removeInterest = idx => {
    setForm({ ...form, interests: (form.interests || []).filter((_, i) => i !== idx) });
  };

  const handleSocialChange = (idx, field, value) => {
    const updated = [...(form.socialLinks || [])];
    updated[idx][field] = value;
    setForm({ ...form, socialLinks: updated });
  };

  const addSocial = () => {
    setForm({ ...form, socialLinks: [...(form.socialLinks || []), { platform: '', url: '' }] });
  };

  const removeSocial = idx => {
    setForm({ ...form, socialLinks: (form.socialLinks || []).filter((_, i) => i !== idx) });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.put(`${apiBaseUrl}/api/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEdit(false);
      toast({ title: 'Profile updated', status: 'success' });
    } catch (err) {
      toast({ title: 'Error updating profile', status: 'error' });
    }
  };

  if (loading) return <Box p={8}>Loading...</Box>;
  if (!profile) return <Box p={8}>No profile data found.</Box>;

  return (
    <Box maxW="2xl" mx="auto" p={8}>
      <Heading mb={6}>Student Profile</Heading>
      <VStack spacing={6} align="stretch">
        <Avatar size="xl" name={profile?.fullName} src={profile?.profilePicture} mb={4} />
        {edit ? (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input name="fullName" value={form.fullName || ''} onChange={handleChange} required />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={form.email || ''} onChange={handleChange} required type="email" />
              </FormControl>
              <FormControl>
                <FormLabel>Age</FormLabel>
                <Input name="age" value={form.age || ''} onChange={handleChange} type="number" />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea name="bio" value={form.bio || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Grade Level</FormLabel>
                <Input name="gradeLevel" value={form.gradeLevel || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>School</FormLabel>
                <Input name="school" value={form.school || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Profile Picture URL</FormLabel>
                <Input name="profilePicture" value={form.profilePicture || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Interests</FormLabel>
                <VStack align="stretch">
                  {(form.interests || []).map((interest, idx) => (
                    <HStack key={idx}>
                      <Input value={interest} onChange={e => handleInterestsChange(idx, e.target.value)} />
                      <IconButton icon={<FaTrash />} onClick={() => removeInterest(idx)} aria-label="Remove" />
                    </HStack>
                  ))}
                  <Button leftIcon={<FaPlus />} onClick={addInterest} size="sm">Add Interest</Button>
                </VStack>
              </FormControl>
              <FormControl>
                <FormLabel>Social Links</FormLabel>
                <VStack align="stretch">
                  {(form.socialLinks || []).map((link, idx) => (
                    <HStack key={idx}>
                      <Input placeholder="Platform" value={link.platform} onChange={e => handleSocialChange(idx, 'platform', e.target.value)} />
                      <Input placeholder="URL" value={link.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} />
                      <IconButton icon={<FaTrash />} onClick={() => removeSocial(idx)} aria-label="Remove" />
                    </HStack>
                  ))}
                  <Button leftIcon={<FaPlus />} onClick={addSocial} size="sm">Add Social Link</Button>
                </VStack>
              </FormControl>
              <Button colorScheme="teal" type="submit">Save</Button>
              <Button variant="ghost" onClick={() => setEdit(false)}>Cancel</Button>
            </VStack>
          </form>
        ) : (
          <VStack spacing={4} align="stretch">
            <Box><b>Full Name:</b> {profile.fullName || 'Not set'}</Box>
            <Box><b>Email:</b> {profile.email || 'Not set'}</Box>
            <Box><b>Age:</b> {profile.age || 'Not set'}</Box>
            <Box><b>Bio:</b> {profile.bio || 'Not set'}</Box>
            <Box><b>Grade Level:</b> {profile.gradeLevel || 'Not set'}</Box>
            <Box><b>School:</b> {profile.school || 'Not set'}</Box>
            <Box><b>Interests:</b> <VStack align="start">{(profile.interests || []).map((interest, idx) => <span key={idx}>{interest}</span>)}</VStack></Box>
            <Box><b>Social Links:</b> <VStack align="start">{(profile.socialLinks || []).map((link, idx) => <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">{link.platform}</a>)}</VStack></Box>
            <Button colorScheme="teal" onClick={() => setEdit(true)}>Edit Profile</Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default StudentProfile;