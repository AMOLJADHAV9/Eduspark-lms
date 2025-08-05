import React from 'react';
import { Box, Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { FaUsers } from 'react-icons/fa';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherStudents = () => {
  return (
    <>
      <Navbar />
      <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
        <TeacherSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            <Box
              bg="rgba(255, 255, 255, 0.15)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.18)"
              p={8}
            >
              <VStack spacing={4}>
                <Icon as={FaUsers} boxSize={12} color="teal.300" />
                <Heading color="teal.300" fontSize="3xl" fontWeight="extrabold">
                  Students
                </Heading>
                <Text color="gray.100" fontSize="lg">
                  View and manage your enrolled students
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </>
  );
};

export default TeacherStudents; 