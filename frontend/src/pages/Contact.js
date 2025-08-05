import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email',
      value: 'contact@lms.com',
      description: 'Send us an email anytime',
    },
    {
      icon: FaPhone,
      title: 'Phone',
      value: '+91 98765 43210',
      description: 'Mon-Fri from 8am to 6pm',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Office',
      value: 'Mumbai, Maharashtra',
      description: 'Main office location',
    },
    {
      icon: FaClock,
      title: 'Support Hours',
      value: '24/7 Online Support',
      description: 'Available round the clock',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will get back to you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center" py={8}>
            <Heading size="2xl" mb={6} color="teal.600">
              Contact Us
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Text>
          </Box>

          {/* Contact Information */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {contactInfo.map((info, index) => (
              <Card key={index} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
                <CardBody>
                  <VStack spacing={3} align="center" textAlign="center">
                    <Icon as={info.icon} boxSize={6} color="teal.500" />
                    <Heading size="sm">{info.title}</Heading>
                    <Text fontWeight="bold" color="teal.600">{info.value}</Text>
                    <Text fontSize="sm" color="gray.500">{info.description}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Contact Form and Info */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Contact Form */}
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color="teal.600">Send us a Message</Heading>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Subject</FormLabel>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What is this about?"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Your message..."
                          rows={6}
                        />
                      </FormControl>
                      
                      <Button
                        type="submit"
                        colorScheme="teal"
                        size="lg"
                        isLoading={isSubmitting}
                        loadingText="Sending..."
                        w="full"
                      >
                        Send Message
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>

            {/* Additional Info */}
            <VStack spacing={6} align="stretch">
              <Card bg={cardBg} shadow="lg">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="lg" color="teal.600">Get in Touch</Heading>
                    <Text color="gray.600">
                      We're here to help and answer any question you might have. 
                      We look forward to hearing from you.
                    </Text>
                    <Text color="gray.600">
                      Whether you have a question about our courses, need technical support, 
                      or want to partner with us, we're ready to answer all your questions.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="lg">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="lg" color="teal.600">Frequently Asked Questions</Heading>
                    <VStack spacing={3} align="start">
                      <Box>
                        <Text fontWeight="bold" color="teal.600">How do I enroll in a course?</Text>
                        <Text fontSize="sm" color="gray.600">
                          Simply browse our courses, click on the one you're interested in, and click "Enroll Now".
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="teal.600">What payment methods do you accept?</Text>
                        <Text fontSize="sm" color="gray.600">
                          We accept all major credit cards, debit cards, and UPI payments.
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="teal.600">Can I get a refund?</Text>
                        <Text fontSize="sm" color="gray.600">
                          Yes, we offer a 30-day money-back guarantee for all our courses.
                        </Text>
                      </Box>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default Contact; 