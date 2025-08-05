import React from 'react';
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
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGraduationCap, FaUsers, FaBook, FaAward, FaGlobe, FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const features = [
    {
      icon: FaGraduationCap,
      title: 'Quality Education',
      description: 'Access to high-quality educational content from expert instructors.',
    },
    {
      icon: FaUsers,
      title: 'Expert Faculty',
      description: 'Learn from experienced educators and industry professionals.',
    },
    {
      icon: FaBook,
      title: 'Comprehensive Courses',
      description: 'Wide range of courses covering various subjects and skill levels.',
    },
    {
      icon: FaAward,
      title: 'Proven Results',
      description: 'Track record of helping students achieve their educational goals.',
    },
    {
      icon: FaGlobe,
      title: 'Accessible Learning',
      description: 'Learn anytime, anywhere with our flexible online platform.',
    },
    {
      icon: FaHeart,
      title: 'Student-Centric',
      description: 'Focused on providing the best learning experience for students.',
    },
  ];

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center" py={12}>
            <Heading size="2xl" mb={6} color="teal.600">
              About LMS
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
              We are dedicated to providing high-quality, affordable education to students across India. 
              Our mission is to make learning accessible to everyone through our innovative online platform.
            </Text>
          </Box>

          {/* Mission & Vision */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Heading size="lg" color="teal.600">Our Mission</Heading>
                  <Text color="gray.600">
                    To democratize education by providing affordable, high-quality learning resources 
                    to students across India. We believe that every student deserves access to 
                    excellent educational content regardless of their location or financial background.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Heading size="lg" color="teal.600">Our Vision</Heading>
                  <Text color="gray.600">
                    To become India's leading online learning platform, empowering millions of students 
                    to achieve their educational and career goals through innovative technology and 
                    expert-led instruction.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Features Grid */}
          <Box>
            <Heading size="lg" textAlign="center" mb={8} color="teal.600">
              Why Choose Our Platform
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {features.map((feature, index) => (
                <Card key={index} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
                  <CardBody>
                    <VStack spacing={4} align="center" textAlign="center">
                      <Icon as={feature.icon} boxSize={8} color="teal.500" />
                      <Heading size="md">{feature.title}</Heading>
                      <Text color="gray.600" fontSize="sm">
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Story Section */}
          <Card bg={cardBg} shadow="lg">
            <CardBody>
              <VStack spacing={6} align="start">
                <Heading size="lg" color="teal.600">Our Story</Heading>
                <Text color="gray.600" lineHeight="tall">
                  Founded with a vision to bridge the educational gap in India, our LMS platform 
                  was created by a team of educators and technologists who understood the challenges 
                  faced by students in accessing quality education. We recognized that traditional 
                  education models often left many students behind due to geographical, financial, 
                  or time constraints.
                </Text>
                <Text color="gray.600" lineHeight="tall">
                  Today, we serve thousands of students across India, providing them with access 
                  to expert-led courses, interactive learning materials, and a supportive community 
                  of learners. Our platform continues to evolve, incorporating the latest educational 
                  technologies and methodologies to ensure the best learning experience for our students.
                </Text>
                <Text color="gray.600" lineHeight="tall">
                  We are committed to maintaining the highest standards of educational quality while 
                  keeping our courses affordable and accessible. Our success is measured by the success 
                  of our students, and we take pride in the achievements of every learner who uses 
                  our platform.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Stats Section */}
          <Box textAlign="center" py={8}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
              <VStack>
                <Heading size="2xl" color="teal.500">1000+</Heading>
                <Text color="gray.600">Students Enrolled</Text>
              </VStack>
              <VStack>
                <Heading size="2xl" color="teal.500">50+</Heading>
                <Text color="gray.600">Expert Instructors</Text>
              </VStack>
              <VStack>
                <Heading size="2xl" color="teal.500">100+</Heading>
                <Text color="gray.600">Courses Available</Text>
              </VStack>
              <VStack>
                <Heading size="2xl" color="teal.500">95%</Heading>
                <Text color="gray.600">Success Rate</Text>
              </VStack>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default About; 