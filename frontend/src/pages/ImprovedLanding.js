import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  Image, 
  VStack, 
  HStack, 
  Stack, 
  Icon, 
  Flex, 
  useColorModeValue, 
  Card, 
  CardBody, 
  Badge, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Stat, 
  StatLabel, 
  StatNumber,
  Container,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaCheckCircle, 
  FaRocket, 
  FaUserGraduate, 
  FaEye, 
  FaPlay, 
  FaUsers, 
  FaClock, 
  FaSearch, 
  FaChalkboardTeacher, 
  FaBook,
  FaArrowRight,
  FaMobile,
  FaLaptop,
  FaTabletAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ImprovedNavbar from '../components/ImprovedNavbar';
import Footer from '../components/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Aman Sharma',
    text: 'This LMS helped me crack NEET! The lectures and notes are top-notch.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    text: 'The best platform for affordable, quality education. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    text: 'I loved the interactive lectures and the support from teachers.',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    rating: 5,
  },
];

const whyChoose = [
  { 
    icon: FaRocket, 
    label: 'Expert Faculty',
    description: 'Learn from industry professionals and certified instructors'
  },
  { 
    icon: FaUserGraduate, 
    label: 'Proven Results',
    description: 'Thousands of successful students and high pass rates'
  },
  { 
    icon: FaCheckCircle, 
    label: 'Affordable Pricing',
    description: 'Quality education at competitive prices'
  },
  { 
    icon: FaStar, 
    label: 'Student-Centric Approach',
    description: 'Personalized learning paths and individual attention'
  },
];

const categories = [
  { label: 'Science', icon: FaRocket, color: 'blue.500' },
  { label: 'Mathematics', icon: FaUserGraduate, color: 'green.500' },
  { label: 'Language', icon: FaBook, color: 'purple.500' },
  { label: 'Technology', icon: FaChalkboardTeacher, color: 'orange.500' },
  { label: 'Commerce', icon: FaStar, color: 'teal.500' },
  { label: 'Arts', icon: FaCheckCircle, color: 'pink.500' },
];

const features = [
  {
    icon: FaMobile,
    title: 'Mobile Optimized',
    description: 'Learn on any device with our responsive design'
  },
  {
    icon: FaLaptop,
    title: 'Interactive Learning',
    description: 'Engage with live classes and real-time discussions'
  },
  {
    icon: FaTabletAlt,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics'
  }
];

const ImprovedLanding = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [hasPaidEnrollment, setHasPaidEnrollment] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  useEffect(() => {
    fetchCourses();
    fetchStories();
    checkPaidEnrollment();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/public/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(Array.isArray(data) ? data.slice(0, 6) : []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    }
  };

  const checkPaidEnrollment = async () => {
    try {
      if (!user) { 
        setHasPaidEnrollment(false); 
        return; 
      }
      const res = await fetch('/api/enrollments/user', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) { 
        setHasPaidEnrollment(false); 
        return; 
      }
      const data = await res.json();
      const paid = Array.isArray(data) ? data.some(e => e.isPaid) : (Array.isArray(data?.enrollments) ? data.enrollments.some(e => e.isPaid) : false);
      setHasPaidEnrollment(paid);
    } catch (error) {
      setHasPaidEnrollment(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      toast({
        title: "Please enter a search term",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Subtle animated background bubbles
  const bubbles = [
    { size: 140, top: '10%', left: '8%', delay: 0 },
    { size: 100, top: '20%', right: '12%', delay: 0.8 },
    { size: 160, bottom: '18%', left: '15%', delay: 0.4 },
    { size: 90, bottom: '10%', right: '20%', delay: 1.2 },
  ];

  return (
    <Box bg="white" minH="100vh" position="relative" overflow="hidden">
      {/* Animated bubbles background */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {bubbles.map((b, i) => (
          <MotionBox
            key={i}
            position="absolute"
            top={b.top}
            bottom={b.bottom}
            left={b.left}
            right={b.right}
            w={`${b.size}px`}
            h={`${b.size}px`}
            borderRadius="full"
            bg="brand.highlight"
            opacity={0.35}
            filter="blur(20px)"
            initial={{ y: 0, scale: 1 }}
            animate={{ y: [-12, 12, -12], scale: [1, 1.05, 1] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
          />
        ))}
      </Box>

      <ImprovedNavbar />
      
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        as="section"
        py={{ base: 12, md: 20, lg: 24 }}
        color="brand.text"
        position="relative"
        zIndex={1}
      >
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <Flex 
            direction={{ base: 'column', lg: 'row' }} 
            align="center" 
            justify="space-between" 
            gap={{ base: 8, lg: 12 }}
          >
            <VStack align="start" spacing={6} flex={1} maxW={{ base: '100%', lg: '600px' }}>
              <Heading 
                fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }} 
                fontWeight="extrabold" 
                lineHeight={1.2}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                Learn Anything,{' '}
                <Text as="span" className="gradient-text">
                  Anytime, Anywhere
                </Text>
              </Heading>
              
              <Text 
                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                color="gray.700"
                textAlign={{ base: 'center', lg: 'left' }}
                maxW="500px"
              >
                Explore high-quality courses crafted by expert instructors. Build skills that advance your career and transform your future.
              </Text>

              {/* Search Bar */}
              <Box w="full" maxW={{ base: '100%', md: '500px' }}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="What do you want to learn?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="white"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                  />
                  <Button 
                    ml={3} 
                    size="lg" 
                    colorScheme="teal" 
                    onClick={handleSearch}
                    rightIcon={<FaArrowRight />}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    Search
                  </Button>
                </InputGroup>
              </Box>

              {/* Stats */}
              <HStack 
                spacing={{ base: 6, md: 10 }} 
                pt={4} 
                color="gray.700"
                justify={{ base: 'center', lg: 'flex-start' }}
                w="full"
              >
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="teal.500">
                    10k+
                  </StatNumber>
                  <StatLabel fontSize="sm" fontWeight="medium">Students</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="teal.500">
                    {Math.max(courses.length, 120)}
                  </StatNumber>
                  <StatLabel fontSize="sm" fontWeight="medium">Courses</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="teal.500">
                    200+
                  </StatNumber>
                  <StatLabel fontSize="sm" fontWeight="medium">Instructors</StatLabel>
                </Stat>
              </HStack>

              {/* CTA Buttons */}
              <VStack 
                spacing={4} 
                pt={4} 
                w="full"
                align={{ base: 'stretch', md: 'center', lg: 'flex-start' }}
              >
                <HStack 
                  spacing={{ base: 3, md: 4 }} 
                  flexWrap="wrap" 
                  justify={{ base: 'center', lg: 'flex-start' }}
                  w="full"
                >
                  {!user ? (
                    <Button 
                      size={{ base: 'lg', md: 'xl' }} 
                      colorScheme="teal" 
                      onClick={() => navigate('/register')}
                      w={{ base: 'full', md: 'auto' }}
                      fontSize={{ base: 'lg', md: 'xl' }}
                      py={{ base: 6, md: 8 }}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                      transition="all 0.3s"
                      rightIcon={<FaArrowRight />}
                    >
                      Get Started Free
                    </Button>
                  ) : (
                    <Button 
                      size={{ base: 'lg', md: 'xl' }} 
                      colorScheme="teal" 
                      onClick={() => navigate('/user/dashboard')}
                      w={{ base: 'full', md: 'auto' }}
                      fontSize={{ base: 'lg', md: 'xl' }}
                      py={{ base: 6, md: 8 }}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                      transition="all 0.3s"
                      rightIcon={<FaArrowRight />}
                    >
                      Go to Dashboard
                    </Button>
                  )}
                  
                  <Button 
                    size={{ base: 'lg', md: 'xl' }} 
                    variant="outline" 
                    colorScheme="teal" 
                    onClick={() => navigate('/courses')}
                    w={{ base: 'full', md: 'auto' }}
                    fontSize={{ base: 'lg', md: 'xl' }}
                    py={{ base: 6, md: 8 }}
                    _hover={{ bg: 'teal.50', transform: 'translateY(-2px)' }}
                    transition="all 0.3s"
                  >
                    Browse Courses
                  </Button>
                </HStack>

                {!hasPaidEnrollment && user && (
                  <Button 
                    size={{ base: 'md', md: 'lg' }} 
                    colorScheme="green" 
                    onClick={() => navigate('/courses')}
                    w={{ base: 'full', md: 'auto' }}
                    variant="solid"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </VStack>
            </VStack>

            {/* Hero Image */}
            <Box 
              flex={1} 
              display={{ base: 'none', lg: 'block' }}
              maxW="500px"
            >
              <MotionBox
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop"
                  alt="Learning Hero"
                  rounded="2xl"
                  objectFit="cover"
                  w="100%"
                  h="400px"
                  shadow="2xl"
                  _hover={{ transform: 'scale(1.02)', transition: 'transform 0.3s' }}
                />
              </MotionBox>
            </Box>
          </Flex>
        </Container>
      </MotionBox>

      {/* Features Section */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <VStack spacing={8}>
            <Heading 
              textAlign="center" 
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
              className="gradient-text"
            >
              Why Choose SkillEdge?
            </Heading>
            
            <SimpleGrid 
              columns={{ base: 1, md: 3 }} 
              spacing={8} 
              w="full"
            >
              {features.map((feature, index) => (
                <MotionCard
                  key={index}
                  variant="3d"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CardBody textAlign="center" p={8}>
                    <VStack spacing={4}>
                      <Box
                        p={4}
                        bg="teal.500"
                        rounded="full"
                        color="white"
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                      >
                        <Icon as={feature.icon} boxSize={8} />
                      </Box>
                      <Heading size="md" color="gray.800">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Categories */}
      <Box as="section" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <VStack spacing={8}>
            <Heading 
              textAlign="center" 
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
              className="gradient-text"
            >
              Explore Categories
            </Heading>
            
            <SimpleGrid 
              columns={{ base: 2, md: 3, lg: 6 }} 
              spacing={6}
              w="full"
            >
              {categories.map((category, index) => (
                <MotionCard
                  key={category.label}
                  variant="outline"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ 
                    shadow: 'lg', 
                    transform: 'translateY(-4px)',
                    borderColor: category.color
                  }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  cursor="pointer"
                  onClick={() => navigate(`/courses?category=${category.label.toLowerCase()}`)}
                >
                  <CardBody textAlign="center" p={6}>
                    <VStack spacing={3}>
                      <Box 
                        p={3} 
                        rounded="full" 
                        bg={`${category.color}20`} 
                        color={category.color}
                      >
                        <Icon as={category.icon} boxSize={6} />
                      </Box>
                      <Text fontWeight="semibold" fontSize="sm">
                        {category.label}
                      </Text>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Popular Courses */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <VStack spacing={8}>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading 
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="extrabold"
                className="gradient-text"
                mb={4}
              >
                Popular Courses
              </Heading>
              <Text 
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.700" 
                maxW="600px"
                mx="auto"
              >
                Discover high-quality courses designed to help you succeed in your learning journey
              </Text>
            </MotionBox>

            {loading ? (
              <Box textAlign="center" py={12}>
                <Text>Loading courses...</Text>
              </Box>
            ) : (
              <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 4 }} 
                spacing={8}
                w="full"
              >
                {courses.map((course, index) => (
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
                    <CardBody p={6}>
                      <Box position="relative" mb={4}>
                        <Image 
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'} 
                          alt={course.title} 
                          rounded="lg" 
                          w="full" 
                          h="180px" 
                          objectFit="cover"
                          shadow="lg"
                        />
                        <Badge
                          position="absolute"
                          top={2}
                          right={2}
                          variant="solid"
                          colorScheme="teal"
                          fontSize="sm"
                        >
                          {course.price ? `₹${course.price}` : 'Free'}
                        </Badge>
                      </Box>
                      <Heading fontSize="xl" mb={2} color="gray.800" noOfLines={2}>
                        {course.title}
                      </Heading>
                      <Text mb={4} color="gray.600" fontSize="sm" noOfLines={2}>
                        {course.description}
                      </Text>
                      <HStack justify="space-between" align="center" mb={4}>
                        <HStack spacing={2} color="gray.500" fontSize="sm">
                          <Icon as={FaUsers} />
                          <Text>{course.enrolledStudents || 0}</Text>
                        </HStack>
                        <HStack spacing={2} color="gray.500" fontSize="sm">
                          <Icon as={FaClock} />
                          <Text>{course.duration || '10h'}</Text>
                        </HStack>
                      </HStack>
                      <Button
                        size="sm"
                        variant="3d"
                        leftIcon={<FaEye />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${course._id}`);
                        }}
                        w="full"
                        colorScheme="teal"
                      >
                        View Course
                      </Button>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}

            <Button
              size="lg"
              colorScheme="teal"
              variant="outline"
              onClick={() => navigate('/courses')}
              rightIcon={<FaArrowRight />}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.3s"
            >
              View All Courses
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box as="section" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <Card 
            bgGradient="linear(to-r, teal.500, teal.600)" 
            color="white"
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
              opacity="0.3"
            />
            <CardBody position="relative" zIndex={1}>
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                align="center" 
                justify="space-between" 
                gap={6}
              >
                <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                  <Heading size="lg" textAlign={{ base: 'center', md: 'left' }}>
                    Start learning today
                  </Heading>
                  <Text 
                    opacity={0.9} 
                    textAlign={{ base: 'center', md: 'left' }}
                    fontSize={{ base: 'md', md: 'lg' }}
                  >
                    Join thousands of students achieving their goals
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <Button 
                    colorScheme="whiteAlpha" 
                    variant="solid" 
                    size="lg" 
                    onClick={() => navigate('/courses')}
                    _hover={{ bg: 'white', color: 'teal.600' }}
                    transition="all 0.3s"
                  >
                    Browse Courses
                  </Button>
                  {!hasPaidEnrollment && user && (
                    <Button 
                      bg="white" 
                      color="teal.600" 
                      _hover={{ bg: 'whiteAlpha.900' }} 
                      size="lg" 
                      onClick={() => navigate('/courses')}
                      transition="all 0.3s"
                    >
                      Upgrade Now
                    </Button>
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        </Container>
      </Box>

      {/* Student Success Stories */}
      {stories.length > 0 && (
        <Box as="section" py={{ base: 12, md: 16 }}>
          <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
            <VStack spacing={8}>
              <Heading 
                textAlign="center" 
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="extrabold"
                className="gradient-text"
              >
                Student Success Stories
              </Heading>
              
              <SimpleGrid 
                columns={{ base: 1, md: 3 }} 
                spacing={8}
                w="full"
              >
                {stories.map((story, index) => (
                  <MotionCard
                    key={story._id}
                    variant="glass"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.04, rotateY: 3 }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.1,
                      type: 'spring', 
                      stiffness: 200 
                    }}
                    viewport={{ once: true }}
                  >
                    <CardBody>
                      <VStack spacing={3} align="start">
                        {story.imagePath && (
                          <Image 
                            src={story.imagePath} 
                            alt={story.name} 
                            w="100%" 
                            h="180px" 
                            objectFit="cover" 
                            rounded="md" 
                          />
                        )}
                        <Heading size="md" color="gray.800">
                          {story.name}
                        </Heading>
                        <Text color="gray.600" noOfLines={4}>
                          {story.story}
                        </Text>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}

      {/* Testimonials */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="brand.surface">
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <VStack spacing={8}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading 
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="extrabold"
                className="gradient-text"
                mb={4}
              >
                What Our Students Say
              </Heading>
            </MotionBox>
            
            <SimpleGrid 
              columns={{ base: 1, md: 3 }} 
              spacing={8}
              w="full"
            >
              {testimonials.map((testimonial, i) => (
                <MotionCard
                  key={i}
                  variant="glass"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.04, rotateY: 3 }}
                  transition={{ 
                    duration: 0.6,
                    delay: i * 0.1,
                    type: 'spring', 
                    stiffness: 200 
                  }}
                  viewport={{ once: true }}
                >
                  <CardBody p={8} textAlign="center">
                    <Box
                      position="relative"
                      mb={4}
                      display="inline-block"
                    >
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        rounded="full" 
                        boxSize="80px" 
                        mx="auto"
                        shadow="lg"
                        border="3px solid"
                        borderColor="teal.500"
                      />
                      <Box
                        position="absolute"
                        top="-2px"
                        left="-2px"
                        right="-2px"
                        bottom="-2px"
                        bg="teal.500"
                        rounded="full"
                        opacity="0.3"
                        filter="blur(8px)"
                        zIndex={-1}
                      />
                    </Box>
                    <Text fontSize="lg" mb={2} fontStyle="italic" color="gray.700">
                      "{testimonial.text}"
                    </Text>
                    <Text fontWeight="bold" color="teal.600">
                      {testimonial.name}
                    </Text>
                    <HStack justify="center" mt={2}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="yellow.400" />
                      ))}
                    </HStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Box as="section" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6, lg: 8 }}>
          <VStack spacing={8}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading 
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="extrabold"
                className="gradient-text"
                mb={4}
              >
                Why Choose Us?
              </Heading>
            </MotionBox>
            
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: 4 }} 
              spacing={8}
              w="full"
            >
              {whyChoose.map((item, i) => (
                <MotionBox
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, rotateY: 10 }}
                  transition={{ 
                    duration: 0.6,
                    delay: i * 0.1,
                    type: 'spring', 
                    stiffness: 300 
                  }}
                  viewport={{ once: true }}
                >
                  <VStack spacing={4} p={6} bg="white" rounded="xl" shadow="lg" h="full">
                    <Box
                      p={4}
                      bg="teal.500"
                      rounded="full"
                      color="white"
                      boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
                    >
                      <Icon as={item.icon} boxSize={8} />
                    </Box>
                    <Heading 
                      size="md" 
                      color="gray.800"
                      textAlign="center"
                    >
                      {item.label}
                    </Heading>
                    <Text 
                      color="gray.600" 
                      fontSize="sm"
                      textAlign="center"
                    >
                      {item.description}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default ImprovedLanding;
