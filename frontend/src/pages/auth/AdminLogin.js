import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../utils/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const data = await authApi.adminLogin({
        username: formData.username,
        password: formData.password,
      });

      login(data.user, data.token);
      toast({
        title: 'Success',
        description: 'Admin login successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg={bg} minH="100vh" py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              Admin Login
            </Heading>
            <Text color="gray.600">
              Access the admin dashboard
            </Text>
          </Box>

          <Box w="full" bg={cardBg} p={8} rounded="lg" shadow="md">
            <Alert status="info" mb={6}>
              <AlertIcon />
              Admin credentials are hardcoded for security
            </Alert>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter admin username"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter admin password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="red"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Logging In"
                >
                  Admin Login
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminLogin; 