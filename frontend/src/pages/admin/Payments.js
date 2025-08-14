import React, { useEffect, useState } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Flex, Spinner, Select as ChakraSelect, Input, HStack, Badge } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Payments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [userId, setUserId] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      if (userId) params.append('userId', userId);
      const res = await fetch(`/api/payment/all/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');
      setPayments(data.payments || []);
    } catch (e) {
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  return (
    <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Heading color="white" mb={8} textAlign="center">Payments</Heading>
        <Box bg="white" p={6} rounded="lg" shadow="xl">
          <HStack mb={4} spacing={4}>
            <ChakraSelect placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} maxW="xs">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </ChakraSelect>
            <ChakraSelect placeholder="Type" value={type} onChange={e => setType(e.target.value)} maxW="xs">
              <option value="subscription">Subscription</option>
              <option value="one_time">One-time</option>
              <option value="refund">Refund</option>
            </ChakraSelect>
            <Input placeholder="Filter by User ID" value={userId} onChange={e => setUserId(e.target.value)} maxW="md" />
            <Box as="button" px={4} py={2} bg="teal.500" color="white" rounded="md" onClick={fetchPayments}>Filter</Box>
          </HStack>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="teal.400" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Description</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Type</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map(p => (
                  <Tr key={p._id}>
                    <Td>{p.user?.name} <br /> <Box as="span" color="gray.500" fontSize="sm">{p.user?.email}</Box></Td>
                    <Td>{p.description}</Td>
                    <Td>{p.currency} {(p.amount / 100).toFixed(2)}</Td>
                    <Td><Badge colorScheme={p.status === 'completed' ? 'green' : p.status === 'failed' ? 'red' : 'yellow'}>{p.status}</Badge></Td>
                    <Td><Badge>{p.type}</Badge></Td>
                    <Td>{new Date(p.createdAt).toLocaleString()}</Td>
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

export default Payments;


