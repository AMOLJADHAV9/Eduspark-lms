import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Avatar,
  HStack,
  IconButton,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Divider,
  Flex,
  Spacer,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FaPlus,
  FaTrash,
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
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { token, apiBaseUrl, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');

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
            gradeLevel: '',
            school: '',
            socialLinks: []
          };
          setProfile(defaultProfile);
          setForm(defaultProfile);
        } else {
          toast({
            title: 'Error loading profile',
            description: 'Please try again later',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, toast, apiBaseUrl, user]);

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
      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: 'Error updating profile',
        description: err.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <VStack spacing={4}>
          <Box className="loading-spinner" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Profile not found!</AlertTitle>
          <AlertDescription>
            We couldn't load your profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardHeader>
            <Flex align="center" justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg" color="teal.500">
                  Student Profile
                </Heading>
                <Text color="gray.500">
                  Manage your personal information and preferences
                </Text>
              </VStack>
              {!edit && (
                <Button
                  leftIcon={<FaEdit />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => setEdit(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Flex>
          </CardHeader>
        </Card>

        {/* Profile Content */}
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={8} align="stretch">
              {/* Profile Picture and Basic Info */}
              <HStack spacing={8} align="start">
                <VStack spacing={4}>
                  <Avatar
                    size="2xl"
                    name={profile?.fullName}
                    src={profile?.profilePicture}
                    border="4px solid"
                    borderColor="teal.200"
                  />
                  {edit && (
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Profile Picture URL
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FaImage color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="profilePicture"
                          value={form.profilePicture || ''}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                        />
                      </InputGroup>
                    </FormControl>
                  )}
                </VStack>

                <VStack spacing={4} align="stretch" flex={1}>
                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600">
                        Full Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FaUser color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="fullName"
                          value={form.fullName || ''}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          isReadOnly={!edit}
                          bg={edit ? 'white' : 'gray.50'}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600">
                        Email
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FaEnvelope color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="email"
                          value={form.email || ''}
                          onChange={handleChange}
                          type="email"
                          placeholder="your.email@example.com"
                          isReadOnly={!edit}
                          bg={edit ? 'white' : 'gray.50'}
                        />
                      </InputGroup>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Age
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FaBirthdayCake color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="age"
                          value={form.age || ''}
                          onChange={handleChange}
                          type="number"
                          placeholder="Enter your age"
                          isReadOnly={!edit}
                          bg={edit ? 'white' : 'gray.50'}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        Grade Level
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FaGraduationCap color="gray.400" />
                        </InputLeftElement>
                        <Select
                          name="gradeLevel"
                          value={form.gradeLevel || ''}
                          onChange={handleChange}
                          isReadOnly={!edit}
                          bg={edit ? 'white' : 'gray.50'}
                        >
                          <option value="">Select Grade</option>
                          <option value="9th Grade">9th Grade</option>
                          <option value="10th Grade">10th Grade</option>
                          <option value="11th Grade">11th Grade</option>
                          <option value="12th Grade">12th Grade</option>
                          <option value="College">College</option>
                          <option value="University">University</option>
                        </Select>
                      </InputGroup>
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">
                      School/Institution
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaSchool color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="school"
                        value={form.school || ''}
                        onChange={handleChange}
                        placeholder="Enter your school or institution"
                        isReadOnly={!edit}
                        bg={edit ? 'white' : 'gray.50'}
                      />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </HStack>

              <Divider />

              {/* Bio Section */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">
                  Bio
                </FormLabel>
                <Textarea
                  name="bio"
                  value={form.bio || ''}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your interests, and goals..."
                  rows={4}
                  isReadOnly={!edit}
                  bg={edit ? 'white' : 'gray.50'}
                />
              </FormControl>

              <Divider />

              {/* Interests Section */}
              <VStack align="stretch" spacing={4}>
                <FormLabel fontSize="sm" color="gray.600">
                  Interests & Hobbies
                </FormLabel>

                {edit ? (
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <InputGroup>
                        <InputLeftElement>
                          <FaHeart color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Add a new interest"
                          onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        />
                      </InputGroup>
                      <Button
                        leftIcon={<FaPlus />}
                        onClick={addInterest}
                        colorScheme="teal"
                        size="md"
                      >
                        Add
                      </Button>
                    </HStack>

                    <Wrap spacing={2}>
                      {(form.interests || []).map((interest, idx) => (
                        <WrapItem key={idx}>
                          <Tag size="lg" colorScheme="teal" borderRadius="full">
                            <TagLabel>{interest}</TagLabel>
                            <TagCloseButton onClick={() => removeInterest(interest)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </VStack>
                ) : (
                  <Wrap spacing={2}>
                    {(profile.interests || []).map((interest, idx) => (
                      <WrapItem key={idx}>
                        <Badge colorScheme="teal" variant="subtle" p={2} borderRadius="full">
                          {interest}
                        </Badge>
                      </WrapItem>
                    ))}
                    {(!profile.interests || profile.interests.length === 0) && (
                      <Text color="gray.500" fontStyle="italic">
                        No interests added yet
                      </Text>
                    )}
                  </Wrap>
                )}
              </VStack>

              <Divider />

              {/* Social Links Section */}
              <VStack align="stretch" spacing={4}>
                <FormLabel fontSize="sm" color="gray.600">
                  Social Links
                </FormLabel>

                {edit ? (
                  <VStack align="stretch" spacing={3}>
                    {(form.socialLinks || []).map((link, idx) => (
                      <HStack key={idx} spacing={3}>
                        <Input
                          placeholder="Platform (e.g., LinkedIn, GitHub)"
                          value={link.platform}
                          onChange={e => handleSocialChange(idx, 'platform', e.target.value)}
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={e => handleSocialChange(idx, 'url', e.target.value)}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => removeSocial(idx)}
                          aria-label="Remove social link"
                          colorScheme="red"
                          variant="outline"
                          size="md"
                        />
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<FaPlus />}
                      onClick={addSocial}
                      colorScheme="teal"
                      variant="outline"
                      size="sm"
                    >
                      Add Social Link
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="start" spacing={2}>
                    {(profile.socialLinks || []).map((link, idx) => (
                      <HStack key={idx} spacing={2}>
                        <FaLink color="gray.400" />
                        <Text fontWeight="medium">{link.platform}:</Text>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3182ce', textDecoration: 'underline' }}
                        >
                          {link.url}
                        </a>
                      </HStack>
                    ))}
                    {(!profile.socialLinks || profile.socialLinks.length === 0) && (
                      <Text color="gray.500" fontStyle="italic">
                        No social links added yet
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>

              {/* Action Buttons */}
              {edit && (
                <HStack spacing={4} justify="flex-end" pt={4}>
                  <Button
                    leftIcon={<FaTimes />}
                    onClick={() => {
                      setEdit(false);
                      setForm(profile); // Reset form to original data
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<FaSave />}
                    onClick={handleSubmit}
                    colorScheme="teal"
                    isLoading={saving}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default StudentProfile;