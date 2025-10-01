import React from 'react';
import { Box, Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherAnalytics = () => {
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
                <Icon as={FaChartLine} boxSize={12} color="cyan.500" />
                <Heading color="cyan.600" fontSize="3xl" fontWeight="extrabold">
                  Analytics
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  View your teaching performance and insights
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </>
  );
};

export default TeacherAnalytics; 