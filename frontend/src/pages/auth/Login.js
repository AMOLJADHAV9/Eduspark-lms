import React, { useState } from 'react';
import { Box, Button, Heading, Input, FormControl, FormLabel, VStack, HStack, Text, Link, useToast } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.user, data.token);
      toast({ title: 'Login successful', status: 'success', duration: 2000 });
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      toast({ title: 'Login failed', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear(to-br, teal.400, blue.500)">
      <Box bg="white" p={8} rounded="lg" shadow="xl" w="full" maxW="md">
        <Heading mb={6} textAlign="center" color="teal.600">LMS Login</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
            </FormControl>
            <Button colorScheme="teal" type="submit" isLoading={loading} w="full" size="lg">Login</Button>
                          <HStack pt={4}>
                <Text>Don't have an account?</Text>
                <Link as={RouterLink} to="/register" color="teal.500">
                  Register here
                </Link>
              </HStack>
              <HStack pt={2}>
                <Text fontSize="sm">Admin access?</Text>
                <Link as={RouterLink} to="/admin/login" color="red.500" fontSize="sm">
                  Admin Login
                </Link>
              </HStack>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Login; 