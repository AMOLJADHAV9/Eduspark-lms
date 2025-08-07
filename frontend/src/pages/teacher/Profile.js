import React, { useEffect, useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Textarea, Button, VStack, Avatar, HStack, IconButton, useToast } from '@chakra-ui/react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
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

  return (
    <Box maxW="2xl" mx="auto" p={8}>
      <Heading mb={6}>Teacher Profile</Heading>
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
                <FormLabel>Phone</FormLabel>
                <Input name="phone" value={form.phone || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea name="bio" value={form.bio || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Expertise</FormLabel>
                <Input name="expertise" value={form.expertise || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Experience</FormLabel>
                <Input name="experience" value={form.experience || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Education</FormLabel>
                <Input name="education" value={form.education || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Portfolio</FormLabel>
                <Input name="portfolio" value={form.portfolio || ''} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Profile Picture URL</FormLabel>
                <Input name="profilePicture" value={form.profilePicture || ''} onChange={handleChange} />
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
            <Box><b>Full Name:</b> {profile.fullName}</Box>
            <Box><b>Email:</b> {profile.email}</Box>
            <Box><b>Phone:</b> {profile.phone}</Box>
            <Box><b>Bio:</b> {profile.bio}</Box>
            <Box><b>Expertise:</b> {profile.expertise}</Box>
            <Box><b>Experience:</b> {profile.experience}</Box>
            <Box><b>Education:</b> {profile.education}</Box>
            <Box><b>Portfolio:</b> <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">{profile.portfolio}</a></Box>
            <Box><b>Social Links:</b> <VStack align="start">{(profile.socialLinks || []).map((link, idx) => <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">{link.platform}</a>)}</VStack></Box>
            <Button colorScheme="teal" onClick={() => setEdit(true)}>Edit Profile</Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default TeacherProfile;