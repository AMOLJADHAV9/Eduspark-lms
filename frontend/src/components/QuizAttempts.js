import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Badge, useToast, Table, Thead, Tbody, Tr, Th, Td, Button, Select, Alert, AlertIcon
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const QuizAttempts = ({ courseId }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, [courseId]);

  const fetchAttempts = async () => {
    try {
      const url = courseId ? `/api/quizzes/user/attempts?course=${courseId}` : '/api/quizzes/user/attempts';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch attempts');
      const data = await res.json();
      setAttempts(data);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Text>Loading quiz attempts...</Text>;
  }

  if (attempts.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No quiz attempts found. Start taking quizzes to see your progress here!
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Quiz Attempts</Heading>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Quiz</Th>
              <Th>Course</Th>
              <Th>Score</Th>
              <Th>Status</Th>
              <Th>Time Taken</Th>
              <Th>Completed</Th>
            </Tr>
          </Thead>
          <Tbody>
            {attempts.map((attempt) => (
              <Tr key={attempt._id}>
                <Td>
                  <Text fontWeight="medium">{attempt.quiz.title}</Text>
                  {attempt.quiz.description && (
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                      {attempt.quiz.description}
                    </Text>
                  )}
                </Td>
                <Td>
                  <Text>{attempt.course.title}</Text>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">
                      {attempt.score}/{attempt.totalQuestions}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {attempt.percentage}%
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme={attempt.passed ? 'green' : 'red'}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </Td>
                <Td>
                  <Text>{formatTime(attempt.timeTaken)}</Text>
                </Td>
                <Td>
                  <Text fontSize="sm">{formatDate(attempt.completedAt)}</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default QuizAttempts; 