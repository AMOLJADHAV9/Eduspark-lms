import React from 'react';
import { Box, Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { FaDollarSign } from 'react-icons/fa';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherEarnings = () => {
  return (
    <>
      <Navbar />
      <Flex minH="100vh" bg="gray.50">
        <TeacherSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            <Box
              bg="white"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              p={8}
            >
              <VStack spacing={4}>
                <Icon as={FaDollarSign} boxSize={12} color="emerald.500" />
                <Heading color="emerald.600" fontSize="3xl" fontWeight="extrabold">
                  Earnings
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Track your teaching earnings and payments
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </>
  );
};

export default TeacherEarnings; 