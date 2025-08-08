import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, useToast, Spinner, Flex } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Navbar from '../../components/Navbar';
import AnalyticsDashboard from '../AnalyticsDashboard';

const StatCard = ({ label, value, color }) => (
  <Stat p={6} shadow="md" rounded="lg" bg={color} color="white">
    <StatLabel fontSize="lg">{label}</StatLabel>
    <StatNumber fontSize="3xl">{value}</StatNumber>
  </Stat>
);

const AdminDashboard = () => {
  const { token, apiBaseUrl } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
        setStats(data);
      } catch (err) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, toast]);

  return (
    <>
      <Navbar />
      <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
        <AdminSidebar />
        <Box flex={1} p={8}>
          <Box
            bg="rgba(255, 255, 255, 0.15)"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            backdropFilter="blur(8px)"
            borderRadius="2xl"
            border="1px solid rgba(255, 255, 255, 0.18)"
            p={8}
            mt={4}
            mx="auto"
            maxW="5xl"
          >
            <Heading color="teal.600" mb={8} textAlign="center" fontWeight="extrabold" letterSpacing="wide" fontSize={{ base: '2xl', md: '3xl' }}>
              Admin Dashboard
            </Heading>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minH="40vh">
                <Spinner size="xl" color="teal.300" />
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                <StatCard label="Users" value={stats?.userCount || 0} color="teal.400" />
                <StatCard label="Courses" value={stats?.courseCount || 0} color="blue.400" />
                <StatCard label="Enrollments" value={stats?.enrollmentCount || 0} color="purple.400" />
              </SimpleGrid>
            )}
          </Box>
          {/* Embed AnalyticsDashboard below the stats */}
          <Box mt={10}>
            <AnalyticsDashboard />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default AdminDashboard; 