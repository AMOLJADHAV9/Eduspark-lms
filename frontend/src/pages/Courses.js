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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaEye, FaClock, FaUser, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseSearch from '../components/CourseSearch';

const MotionBox = motion(Box);

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
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      }
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
      
      const response = await fetch(`/api/courses/search?${params.toString()}`);
      if (response.ok) {
        let data = await response.json();
        
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
      }
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
    if (course.duration) {
      if (course.duration < 1) return `${Math.round(course.duration * 60)} minutes`;
      if (course.duration < 2) return `${course.duration} hour`;
      return `${course.duration} hours`;
    }
    return '2-5 hours';
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="2xl" mb={4} color="teal.600">
              Browse Courses
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Discover the perfect course for your learning journey
            </Text>
          </Box>

          {/* Search Component */}
          <CourseSearch onSearch={handleSearch} courses={courses} />

          {/* Search Results Summary */}
          {searchResults && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Search Results</AlertTitle>
                <AlertDescription>
                  Found {searchResults.count} course{searchResults.count !== 1 ? 's' : ''}
                  {searchResults.searchTerm && ` for "${searchResults.searchTerm}"`}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Text fontSize="xl" color="gray.500">No courses found</Text>
                <Text color="gray.400">Try adjusting your search criteria</Text>
                <Button colorScheme="teal" onClick={() => {
                  setFilteredCourses(courses);
                  setSearchResults(null);
                }}>
                  Show All Courses
                </Button>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredCourses.map(course => (
                <MotionBox
                  key={course._id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  bg={cardBg}
                  rounded="xl"
                  shadow="lg"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => navigate(`/course/${course._id}`)}
                  _hover={{ shadow: 'xl' }}
                >
                  {/* Course Image */}
                  <Box
                    h="200px"
                    bg="gray.200"
                    bgImage={course.thumbnail ? `url(${course.thumbnail})` : 'none'}
                    bgSize="cover"
                    bgPosition="center"
                    position="relative"
                  >
                    {!course.thumbnail && (
                      <Center h="full">
                        <Text color="gray.500">No Image</Text>
                      </Center>
                    )}
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      colorScheme="teal"
                      variant="solid"
                    >
                      {course.price ? `₹${course.price}` : 'Free'}
                    </Badge>
                  </Box>

                  {/* Course Content */}
                  <Box p={6}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Heading size="md" mb={2} noOfLines={2}>
                          {course.title}
                        </Heading>
                        <Text color="gray.600" fontSize="sm" noOfLines={3}>
                          {course.description}
                        </Text>
                      </Box>

                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <HStack>
                          <FaUser />
                          <Text>{course.createdBy?.name || 'Admin'}</Text>
                        </HStack>
                        <HStack>
                          <FaClock />
                          <Text>{getCourseDuration(course)}</Text>
                        </HStack>
                      </HStack>

                      <HStack justify="space-between">
                        <Badge colorScheme="blue" variant="subtle">
                          {getCourseLevel(course)}
                        </Badge>
                        <Button
                          size="sm"
                          colorScheme="teal"
                          leftIcon={<FaEye />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${course._id}`);
                          }}
                        >
                          View Course
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          )}

          {/* Load More Button (if needed) */}
          {filteredCourses.length > 0 && filteredCourses.length < courses.length && (
            <Center>
              <Button
                colorScheme="teal"
                variant="outline"
                onClick={() => {
                  setFilteredCourses(courses);
                  setSearchResults(null);
                }}
              >
                Show All Courses
              </Button>
            </Center>
          )}
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default Courses; 