import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Flex, Spinner, Select as ChakraSelect, Stat, StatLabel, StatNumber
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Enrollments = () => {
  const { token, apiBaseUrl } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
      setCourses(data);
      if (data.length && !selectedCourse) setSelectedCourse(data[0]._id);
    } catch {}
  };

  const fetchEnrollments = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/enrollments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch enrollments');
      setEnrollments(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchEnrollments(selectedCourse); }, [selectedCourse]);

  const paidCount = enrollments.filter(e => e.isPaid).length;
  const freeCount = enrollments.length - paidCount;

  return (
    <Flex minH="100vh" bg="white">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Heading color="gray.800" mb={8} textAlign="center">Enrollments & Analytics</Heading>
        <Box bg="white" p={6} rounded="lg" shadow="xl">
          <ChakraSelect mb={4} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} maxW="sm" bg="gray.50">
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </ChakraSelect>
          <Flex gap={6} mb={6}>
            <Stat p={4} bg="teal.500" color="white" rounded="lg" minW="36">
              <StatLabel>Total Enrollments</StatLabel>
              <StatNumber>{enrollments.length}</StatNumber>
            </Stat>
            <Stat p={4} bg="blue.500" color="white" rounded="lg" minW="36">
              <StatLabel>Paid</StatLabel>
              <StatNumber>{paidCount}</StatNumber>
            </Stat>
            <Stat p={4} bg="purple.500" color="white" rounded="lg" minW="36">
              <StatLabel>Free</StatLabel>
              <StatNumber>{freeCount}</StatNumber>
            </Stat>
          </Flex>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="teal.400" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>User Name</Th>
                  <Th>Email</Th>
                  <Th>Paid</Th>
                  <Th>Enrolled At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {enrollments.map(e => (
                  <Tr key={e._id}>
                    <Td>{e.user?.name}</Td>
                    <Td>{e.user?.email}</Td>
                    <Td>{e.isPaid ? 'Yes' : 'No'}</Td>
                    <Td>{new Date(e.enrolledAt).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default Enrollments; 