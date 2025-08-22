import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Input, Table, Thead, Tbody, Tr, Th, Td, Button, Select, IconButton, useToast, Flex, Spinner
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Users = () => {
  const { token, user, apiBaseUrl } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data);
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update role');
      toast({ title: 'Role updated', status: 'success' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');
      toast({ title: 'User deleted', status: 'success' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const filteredUsers = (users || []).filter(u =>
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Flex minH="100vh" bg="gray.50">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200" mb={6}>
          <Heading color="green.600" mb={4} textAlign="center" fontSize="3xl" fontWeight="extrabold">User Management</Heading>
          <Input
            placeholder="Search by name or email"
            mb={4}
            value={search}
            onChange={e => setSearch(e.target.value)}
            maxW="sm"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
          />
        </Box>
        <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="green.500" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="green">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map(u => (
                  <Tr key={u._id} bg={u._id === user?._id ? 'teal.50' : undefined}>
                    <Td>{u.name || 'N/A'}</Td>
                    <Td>{u.email || 'N/A'}</Td>
                    <Td>
                      <Select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        size="sm"
                        bg="gray.100"
                        isDisabled={u._id === user?._id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(u._id)}
                        isDisabled={u._id === user?._id}
                        aria-label="Delete user"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
                        transition="all 0.2s ease"
                      />
                    </Td>
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

export default Users; 