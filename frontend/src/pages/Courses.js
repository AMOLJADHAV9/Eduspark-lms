import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Image,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaEye, FaClock, FaUser, FaStar, FaPlay, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseSearch from '../components/CourseSearch';
import { courseApi, api } from '../utils/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async (searchData) => {
    try {
      const { searchTerm, filters } = searchData;
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.priceRange) {
        params.append('priceMin', filters.priceRange[0]);
        params.append('priceMax', filters.priceRange[1]);
      }
      let data = await api.get(`/api/courses/search?${params.toString()}`);
      // Apply duration filter on frontend since it's not in backend yet
      if (filters.duration) {
        const [min, max] = filters.duration.split('-').map(Number);
        data = data.filter(course => {
          const duration = course.duration || 3; // Default to 3 hours if no duration
          if (filters.duration === '10+') {
            return duration >= 10;
          }
          return duration >= min && duration <= max;
        });
      }
      setFilteredCourses(data);
      setSearchResults({
        searchTerm,
        filters,
        count: data.length,
      });
    } catch (error) {
      console.error('Error searching courses:', error);
    }
  };

  const handleSearch = (searchData) => {
    searchCourses(searchData);
  };

  const getCourseLevel = (course) => {
    // This is a placeholder - you'd need to add level field to your course model
    return course.level || 'Beginner';
  };

  const getCourseDuration = (course) => {
    // This is a placeholder - you'd need to add duration field to your course model
    return course.duration || '3 hours';
  };

  if (loading) {
    return (
      <Box bg="gradients.primary" minH="100vh">
        <Navbar />
        <Center h="60vh">
          <VStack spacing={6}>
            <Spinner size="xl" color="white" thickness="4px" />
            <Text color="white" fontSize="lg">Loading courses...</Text>
          </VStack>
        </Center>
        <Footer />
      </Box>
    );
  }

  return (
    <Box bg="gradients.primary" minH="100vh" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="300px"
        h="300px"
        bg="neon.blue"
        borderRadius="full"
        opacity="0.1"
        filter="blur(60px)"
        animation="pulse 6s infinite"
      />
      <Box
        position="absolute"
        top="60%"
        right="15%"
        w="250px"
        h="250px"
        bg="neon.purple"
        borderRadius="full"
        opacity="0.1"
        filter="blur(50px)"
        animation="pulse 8s infinite"
      />
      <Box
        position="absolute"
        bottom="20%"
        left="20%"
        w="200px"
        h="200px"
        bg="neon.pink"
        borderRadius="full"
        opacity="0.1"
        filter="blur(40px)"
        animation="pulse 7s infinite"
      />

      <Navbar />
      
      <Container maxW="7xl" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading 
            mb={6} 
            textAlign="center" 
            color="white" 
            className="gradient-text"
            fontSize={{ base: '3xl', md: '4xl' }}
            textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Explore Our Courses
          </Heading>
          <Text 
            textAlign="center" 
            color="white" 
            opacity="0.95" 
            fontSize="lg" 
            mb={8}
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
            fontWeight="medium"
          >
            Discover high-quality courses designed to help you succeed
          </Text>
        </MotionBox>

        <CourseSearch onSearch={handleSearch} />

        {searchResults && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            mb={6}
          >
            <Alert status="info" variant="glass" rounded="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Search Results</AlertTitle>
                <AlertDescription>
                  Found {searchResults.count} courses matching your criteria
                </AlertDescription>
              </Box>
            </Alert>
          </MotionBox>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {filteredCourses.map((course, index) => (
            <MotionCard
              key={course._id}
              variant="3d"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
              }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.1,
                type: 'spring', 
                stiffness: 300 
              }}
              viewport={{ once: true }}
              cursor="pointer"
              onClick={() => navigate(`/course/${course._id}`)}
            >
              <CardBody p={0}>
                <Box position="relative">
                  <Image 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'} 
                    alt={course.title} 
                    w="full" 
                    h="200px" 
                    objectFit="cover"
                    roundedTop="lg"
                  />
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    variant="neon"
                    colorScheme="teal"
                  >
                    {course.price ? `₹${course.price}` : 'Free'}
                  </Badge>
                  <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    variant="3d"
                    colorScheme="purple"
                  >
                    {getCourseLevel(course)}
                  </Badge>
                </Box>
                
                <Box p={6}>
                  <Heading fontSize="xl" mb={3} color="gray.800" noOfLines={2}>
                    {course.title}
                  </Heading>
                  <Text mb={4} color="gray.600" fontSize="sm" noOfLines={3}>
                    {course.description}
                  </Text>
                  
                  <VStack spacing={3} mb={4} align="stretch">
                    <HStack justify="space-between" color="gray.500" fontSize="sm">
                      <HStack spacing={2}>
                        <Icon as={FaClock} />
                        <Text>{getCourseDuration(course)}</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FaUser} />
                        <Text>{course.enrolledStudents || 0} students</Text>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between" color="gray.500" fontSize="sm">
                      <HStack spacing={2}>
                        <Icon as={FaGraduationCap} />
                        <Text>{course.lectures?.length || 0} lectures</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FaStar} color="yellow.400" />
                        <Text>{course.rating || 4.5}</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                  
                  <Button
                    variant="3d"
                    leftIcon={<FaEye />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course._id}`);
                    }}
                    w="full"
                    size="md"
                  >
                    View Course
                  </Button>
                </Box>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>

        {filteredCourses.length === 0 && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            textAlign="center"
            py={20}
          >
            <VStack spacing={6}>
              <Icon as={FaPlay} boxSize={16} color="gray.400" />
              <Heading color="white" size="lg">No courses found</Heading>
              <Text color="white" opacity="0.8">
                Try adjusting your search criteria or browse all courses
              </Text>
              <Button
                variant="3d-primary"
                onClick={() => {
                  setSearchResults(null);
                  setFilteredCourses(courses);
                }}
              >
                View All Courses
              </Button>
            </VStack>
          </MotionBox>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default Courses; 