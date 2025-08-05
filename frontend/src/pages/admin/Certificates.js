import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaEye, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [form, setForm] = useState({
    customMessage: '',
    certificateTemplate: 'default'
  });
  const [filters, setFilters] = useState({
    course: '',
    user: '',
    grade: ''
  });
  
  const { token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch certificates
      const certificatesRes = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (certificatesRes.ok) {
        const certificatesData = await certificatesRes.json();
        setCertificates(certificatesData);
      }

      // Fetch statistics
      const statsRes = await fetch('/api/certificates/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading certificates',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openEditModal = (certificate) => {
    setEditingCertificate(certificate);
    setForm({
      customMessage: certificate.customMessage || '',
      certificateTemplate: certificate.certificateTemplate || 'default'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/certificates/${editingCertificate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update certificate');
      }

      toast({
        title: 'Certificate updated successfully!',
        status: 'success',
        duration: 3000
      });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error updating certificate',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleDelete = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/certificates/${certificateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete certificate');
      }

      toast({
        title: 'Certificate deleted successfully!',
        status: 'success',
        duration: 3000
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error deleting certificate',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'green',
      'A': 'green',
      'B+': 'blue',
      'B': 'blue',
      'C+': 'yellow',
      'C': 'yellow',
      'D': 'orange',
      'F': 'red'
    };
    return colors[grade] || 'gray';
  };

  const filteredCertificates = certificates.filter(certificate => {
    if (filters.course && !certificate.course.title.toLowerCase().includes(filters.course.toLowerCase())) {
      return false;
    }
    if (filters.user && !certificate.user.name.toLowerCase().includes(filters.user.toLowerCase())) {
      return false;
    }
    if (filters.grade && certificate.grade !== filters.grade) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Text>Loading certificates...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <HStack align="start" spacing={0}>
        <AdminSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            <Heading>Manage Certificates</Heading>

            {/* Statistics */}
            {stats && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel>Total Certificates</StatLabel>
                  <StatNumber>{stats.totalCertificates}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    All time
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Average Score</StatLabel>
                  <StatNumber>{stats.averagePercentage}%</StatNumber>
                  <StatHelpText>Overall performance</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Grade Distribution</StatLabel>
                  <StatNumber>
                    {Object.keys(stats.gradeDistribution || {}).length}
                  </StatNumber>
                  <StatHelpText>Different grades awarded</StatHelpText>
                </Stat>
              </SimpleGrid>
            )}

            {/* Filters */}
            <Box bg="gray.50" p={4} borderRadius="lg">
              <HStack spacing={4} wrap="wrap">
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Filter by Course</FormLabel>
                  <Input
                    value={filters.course}
                    onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                    placeholder="Course name"
                    size="sm"
                  />
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Filter by Student</FormLabel>
                  <Input
                    value={filters.user}
                    onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                    placeholder="Student name"
                    size="sm"
                  />
                </FormControl>
                <FormControl maxW="150px">
                  <FormLabel fontSize="sm">Filter by Grade</FormLabel>
                  <Select
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    size="sm"
                  >
                    <option value="">All Grades</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </Select>
                </FormControl>
              </HStack>
            </Box>

            {filteredCertificates.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No certificates found matching the filters.
              </Alert>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Course</Th>
                    <Th>Grade</Th>
                    <Th>Score</Th>
                    <Th>Issued</Th>
                    <Th>Certificate #</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCertificates.map(certificate => (
                    <Tr key={certificate._id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{certificate.studentName}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {certificate.user.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{certificate.courseTitle}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getGradeColor(certificate.grade)}>
                          {certificate.grade}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="bold">{certificate.percentage}%</Text>
                        <Text fontSize="sm" color="gray.600">
                          {certificate.totalScore}/{certificate.maxScore}
                        </Text>
                      </Td>
                      <Td>{formatDate(certificate.issuedAt)}</Td>
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {certificate.certificateNumber}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<FaEye />}
                            onClick={() => window.open(`/certificate/${certificate._id}`, '_blank')}
                            colorScheme="blue"
                            variant="ghost"
                          />
                          <IconButton
                            size="sm"
                            icon={<FaEdit />}
                            onClick={() => openEditModal(certificate)}
                            colorScheme="yellow"
                            variant="ghost"
                          />
                          <IconButton
                            size="sm"
                            icon={<FaTrash />}
                            onClick={() => handleDelete(certificate._id)}
                            colorScheme="red"
                            variant="ghost"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </VStack>
        </Box>
      </HStack>

      {/* Edit Certificate Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit Certificate - {editingCertificate?.courseTitle}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Custom Message</FormLabel>
                  <Textarea
                    value={form.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    placeholder="Add a custom message to the certificate..."
                    rows={4}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Certificate Template</FormLabel>
                  <Select
                    value={form.certificateTemplate}
                    onChange={(e) => handleInputChange('certificateTemplate', e.target.value)}
                  >
                    <option value="default">Default Template</option>
                    <option value="modern">Modern Template</option>
                    <option value="classic">Classic Template</option>
                    <option value="minimal">Minimal Template</option>
                  </Select>
                </FormControl>

                <HStack justify="flex-end" w="full">
                  <Button
                    type="submit"
                    colorScheme="blue"
                  >
                    Update Certificate
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminCertificates; 