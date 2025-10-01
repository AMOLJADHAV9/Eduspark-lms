import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Input, Textarea, Select, NumberInput, NumberInputField, FormControl, FormLabel, useToast, SimpleGrid, Radio, RadioGroup
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const defaultQuestion = {
  text: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: '',
};

const QuizCreate = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    lecture: '',
    timeLimit: 30,
    passingScore: 0,
  });
  const [questions, setQuestions] = useState([ { ...defaultQuestion } ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (form.course) fetchLectures(form.course);
  }, [form.course]);

  const fetchCourses = async () => {
    const res = await fetch('/api/courses');
    if (res.ok) setCourses(await res.json());
  };
  const fetchLectures = async (courseId) => {
    const res = await fetch(`/api/lectures/course/${courseId}`);
    if (res.ok) setLectures(await res.json());
  };

  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleQuestionChange = (idx, key, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [key]: value } : q));
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === optIdx ? value : o) } : q));
  };

  const addQuestion = () => setQuestions(qs => [...qs, { ...defaultQuestion }]);
  const removeQuestion = (idx) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create questions first
      const createdQuestions = [];
      for (const q of questions) {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(q),
        });
        if (!res.ok) throw new Error('Failed to create question');
        const data = await res.json();
        createdQuestions.push(data._id);
      }
      // Create quiz
      const quizRes = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, questions: createdQuestions }),
      });
      if (!quizRes.ok) throw new Error('Failed to create quiz');
      toast({ title: 'Quiz created!', status: 'success' });
      setForm({ title: '', description: '', course: '', lecture: '', timeLimit: 30, passingScore: 0 });
      setQuestions([ { ...defaultQuestion } ]);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <Heading mb={6} color="teal.600">Create Quiz</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={form.title} onChange={handleFormChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea name="description" value={form.description} onChange={handleFormChange} />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                <Select name="course" value={form.course} onChange={handleFormChange}>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Lecture</FormLabel>
                <Select name="lecture" value={form.lecture} onChange={handleFormChange}>
                  <option value="">(Optional)</option>
                  {lectures.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Time Limit (minutes)</FormLabel>
                <NumberInput min={1} max={180} value={form.timeLimit} onChange={v => setForm(f => ({ ...f, timeLimit: v }))}>
                  <NumberInputField name="timeLimit" />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Passing Score</FormLabel>
                <NumberInput min={0} max={questions.length} value={form.passingScore} onChange={v => setForm(f => ({ ...f, passingScore: v }))}>
                  <NumberInputField name="passingScore" />
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            <Box>
              <Heading size="md" mb={2}>Questions</Heading>
              <VStack spacing={6} align="stretch">
                {questions.map((q, idx) => (
                  <Box key={idx} p={4} bg="white" rounded="md" shadow="sm" border="1px solid #e2e8f0">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Question {idx + 1}</Text>
                      <Button size="xs" colorScheme="red" onClick={() => removeQuestion(idx)} isDisabled={questions.length === 1}>Remove</Button>
                    </HStack>
                    <FormControl mt={2} isRequired>
                      <FormLabel>Question Text</FormLabel>
                      <Input value={q.text} onChange={e => handleQuestionChange(idx, 'text', e.target.value)} />
                    </FormControl>
                    <FormControl mt={2} isRequired>
                      <FormLabel>Type</FormLabel>
                      <Select value={q.type} onChange={e => handleQuestionChange(idx, 'type', e.target.value)}>
                        <option value="mcq">Multiple Choice</option>
                        <option value="truefalse">True/False</option>
                        <option value="short">Short Answer</option>
                      </Select>
                    </FormControl>
                    {q.type === 'mcq' && (
                      <Box mt={2}>
                        <FormLabel>Options</FormLabel>
                        <VStack spacing={2} align="stretch">
                          {q.options.map((opt, optIdx) => (
                            <HStack key={optIdx}>
                              <Input value={opt} onChange={e => handleOptionChange(idx, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`} />
                              <RadioGroup value={q.correctAnswer} onChange={val => handleQuestionChange(idx, 'correctAnswer', val)}>
                                <Radio value={opt}>Correct</Radio>
                              </RadioGroup>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                    {q.type === 'truefalse' && (
                      <FormControl mt={2}>
                        <FormLabel>Correct Answer</FormLabel>
                        <Select value={q.correctAnswer} onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)}>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </Select>
                      </FormControl>
                    )}
                    {q.type === 'short' && (
                      <FormControl mt={2}>
                        <FormLabel>Correct Answer</FormLabel>
                        <Input value={q.correctAnswer} onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)} />
                      </FormControl>
                    )}
                    <FormControl mt={2}>
                      <FormLabel>Explanation (optional)</FormLabel>
                      <Textarea value={q.explanation || ''} onChange={e => handleQuestionChange(idx, 'explanation', e.target.value)} />
                    </FormControl>
                  </Box>
                ))}
                <Button colorScheme="teal" onClick={addQuestion}>Add Question</Button>
              </VStack>
            </Box>
            <Button colorScheme="teal" type="submit" isLoading={loading} loadingText="Saving...">Create Quiz</Button>
          </VStack>
        </form>
      </Container>
      <Footer />
    </Box>
  );
};

export default QuizCreate;