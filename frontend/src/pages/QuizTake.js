import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Radio, RadioGroup, Input, Textarea, FormControl, FormLabel, useToast, Progress, Alert, AlertIcon, AlertTitle, AlertDescription, Divider, Badge
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const toast = useToast();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.timeLimit && !results) {
      setTimeLeft(quiz.timeLimit * 60);
      setStartTime(Date.now());
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0 && !results) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, results]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (!res.ok) throw new Error('Quiz not found');
      const data = await res.json();
      setQuiz(data);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const res = await fetch(`/api/quizzes/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers, timeTaken }),
      });
      if (!res.ok) throw new Error('Failed to submit quiz');
      const data = await res.json();
      setResults(data);
      toast({ title: 'Quiz submitted!', status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question, index) => {
    return (
      <Box key={question._id} p={6} bg="white" rounded="md" shadow="sm" border="1px solid #e2e8f0">
        <HStack justify="space-between" mb={4}>
          <Text fontWeight="bold" fontSize="lg">Question {index + 1}</Text>
          <Badge colorScheme={question.type === 'mcq' ? 'blue' : question.type === 'truefalse' ? 'green' : 'orange'}>
            {question.type.toUpperCase()}
          </Badge>
        </HStack>
        
        <Text mb={4} fontSize="md">{question.text}</Text>

        {question.type === 'mcq' && (
          <RadioGroup value={answers[question._id] || ''} onChange={(value) => handleAnswerChange(question._id, value)}>
            <VStack align="start" spacing={3}>
              {question.options.map((option, optIdx) => (
                <Radio key={optIdx} value={option}>
                  <Text>{option}</Text>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        )}

        {question.type === 'truefalse' && (
          <RadioGroup value={answers[question._id] || ''} onChange={(value) => handleAnswerChange(question._id, value)}>
            <VStack align="start" spacing={3}>
              <Radio value="true">True</Radio>
              <Radio value="false">False</Radio>
            </VStack>
          </RadioGroup>
        )}

        {question.type === 'short' && (
          <FormControl>
            <Input
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              placeholder="Enter your answer..."
            />
          </FormControl>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box bg="gray.50" minH="100vh">
        <Navbar />
        <Container maxW="4xl" py={8}>
          <Text>Loading quiz...</Text>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (results) {
    return (
      <Box bg="gray.50" minH="100vh">
        <Navbar />
        <Container maxW="4xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Heading color="teal.600">Quiz Results</Heading>
            
            <Alert status={results.passed ? 'success' : 'error'}>
              <AlertIcon />
              <Box>
                <AlertTitle>{results.passed ? 'Congratulations!' : 'Keep trying!'}</AlertTitle>
                <AlertDescription>
                  You scored {results.score} out of {results.total} ({Math.round((results.score / results.total) * 100)}%)
                </AlertDescription>
              </Box>
            </Alert>

            <Box p={6} bg="white" rounded="md" shadow="sm">
              <Heading size="md" mb={4}>Detailed Results</Heading>
              <VStack spacing={4} align="stretch">
                {results.results.map((result, idx) => {
                  const question = quiz.questions[idx];
                  return (
                    <Box key={idx} p={4} border="1px solid" borderColor={result.correct ? 'green.200' : 'red.200'} bg={result.correct ? 'green.50' : 'red.50'} rounded="md">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold">Question {idx + 1}</Text>
                        <Badge colorScheme={result.correct ? 'green' : 'red'}>
                          {result.correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </HStack>
                      <Text mb={2}>{question.text}</Text>
                      <Text fontSize="sm" color="gray.600">Your answer: {result.userAnswer || 'Not answered'}</Text>
                      <Text fontSize="sm" color="gray.600">Correct answer: {result.correctAnswer}</Text>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            <HStack spacing={4}>
              <Button colorScheme="teal" onClick={() => navigate('/user/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retake Quiz
              </Button>
            </HStack>
          </VStack>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box p={6} bg="white" rounded="md" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Heading size="lg" color="teal.600">{quiz.title}</Heading>
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Time Remaining</Text>
                <Text fontSize="2xl" fontWeight="bold" color={timeLeft < 300 ? 'red.500' : 'gray.700'}>
                  {formatTime(timeLeft)}
                </Text>
              </Box>
            </HStack>
            
            {quiz.description && <Text mb={4}>{quiz.description}</Text>}
            
            <Progress value={((quiz.timeLimit * 60 - timeLeft) / (quiz.timeLimit * 60)) * 100} colorScheme="teal" mb={4} />
            
            <HStack justify="space-between">
              <Text>Question {currentQuestion + 1} of {quiz.questions.length}</Text>
              <Text>Passing Score: {quiz.passingScore}</Text>
            </HStack>
          </Box>

          {renderQuestion(quiz.questions[currentQuestion], currentQuestion)}

          <HStack justify="space-between">
            <Button
              isDisabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
            >
              Previous
            </Button>
            
            <HStack>
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  colorScheme="teal"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  loadingText="Submitting..."
                >
                  Submit Quiz
                </Button>
              )}
            </HStack>
          </HStack>

          <Box p={4} bg="blue.50" rounded="md">
            <Text fontSize="sm" color="blue.700">
              <strong>Navigation:</strong> Use Previous/Next buttons to navigate between questions. 
              Your answers are automatically saved. You can review and change answers before submitting.
            </Text>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default QuizTake; 