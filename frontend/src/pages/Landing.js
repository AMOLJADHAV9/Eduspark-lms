import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Image, VStack, HStack, Stack, Icon, Flex, useColorModeValue, Card, CardBody, Badge, Input, InputGroup, InputLeftElement, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaCheckCircle, FaRocket, FaUserGraduate, FaEye, FaPlay, FaUsers, FaClock, FaSearch, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Aman Sharma',
    text: 'This LMS helped me crack NEET! The lectures and notes are top-notch.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Priya Singh',
    text: 'The best platform for affordable, quality education. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Rahul Verma',
    text: 'I loved the interactive lectures and the support from teachers.',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

const whyChoose = [
  { icon: FaRocket, label: 'Expert Faculty' },
  { icon: FaUserGraduate, label: 'Proven Results' },
  { icon: FaCheckCircle, label: 'Affordable Pricing' },
  { icon: FaStar, label: 'Student-Centric Approach' },
];

const categories = [
  { label: 'Science', icon: FaRocket },
  { label: 'Mathematics', icon: FaUserGraduate },
  { label: 'Language', icon: FaBook },
  { label: 'Technology', icon: FaChalkboardTeacher },
  { label: 'Commerce', icon: FaStar },
  { label: 'Arts', icon: FaCheckCircle },
];

const Landing = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [hasPaidEnrollment, setHasPaidEnrollment] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stories, setStories] = useState([]);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.slice(0, 4)))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    fetch('/api/public/stories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setStories(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setStories([]));
  }, []);

  useEffect(() => {
    const checkPaid = async () => {
      try {
        if (!user) { setHasPaidEnrollment(false); return; }
        const res = await fetch('/api/enrollments/user', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) { setHasPaidEnrollment(false); return; }
        const data = await res.json();
        const paid = Array.isArray(data) ? data.some(e => e.isPaid) : (Array.isArray(data?.enrollments) ? data.enrollments.some(e => e.isPaid) : false);
        setHasPaidEnrollment(paid);
      } catch {
        setHasPaidEnrollment(false);
      }
    };
    checkPaid();
  }, [user, token]);

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

      <Navbar />
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        as="section"
        py={{ base: 16, md: 24 }}
        color="brand.text"
        position="relative"
        zIndex={1}
      >
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" maxW="6xl" mx="auto" px={4} gap={10}>
          <VStack align="start" spacing={6} flex={1}>
            <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" lineHeight={1.2}>
              Learn Anything, Anytime, Anywhere
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
              Explore high-quality courses crafted by expert instructors. Build skills that advance your career.
            </Text>
            <InputGroup size="lg" maxW={{ base: '100%', md: 'lg' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="What do you want to learn?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                borderColor="gray.200"
              />
              <Button ml={3} size="lg" colorScheme="teal" onClick={() => navigate('/courses')}>
                Search
              </Button>
            </InputGroup>
            <HStack spacing={10} pt={4} color="gray.700">
              <Stat>
                <StatNumber>10k+</StatNumber>
                <StatLabel>Students</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>{Math.max(courses.length, 120)}</StatNumber>
                <StatLabel>Courses</StatLabel>
              </Stat>
              <Stat>
                <StatNumber>200+</StatNumber>
                <StatLabel>Instructors</StatLabel>
              </Stat>
            </HStack>
            <HStack spacing={{ base: 2, md: 4 }} pt={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              {!user ? (
                <Button 
                  size={{ base: 'lg', md: 'lg' }} 
                  colorScheme="teal" 
                  onClick={() => window.location.href = '/register'}
                  w={{ base: 'full', md: 'auto' }}
                  mb={{ base: 2, md: 0 }}
                  fontSize={{ base: 'lg', md: 'lg' }}
                  py={{ base: 6, md: 4 }}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                >
                  Get Started
                </Button>
              ) : (
                <Button 
                  size={{ base: 'lg', md: 'lg' }} 
                  colorScheme="teal" 
                  onClick={() => navigate('/user/dashboard')}
                  w={{ base: 'full', md: 'auto' }}
                  mb={{ base: 2, md: 0 }}
                >
                  Go to Dashboard
                </Button>
              )}
              <Button 
                size={{ base: 'md', md: 'lg' }} 
                variant="outline" 
                colorScheme="teal" 
                onClick={() => navigate('/courses')}
                w={{ base: 'full', md: 'auto' }}
                mb={{ base: 2, md: 0 }}
              >
                Browse Courses
              </Button>
              <Button 
                size={{ base: 'md', md: 'lg' }} 
                variant="ghost" 
                colorScheme="teal" 
                onClick={() => navigate('/quizzes')}
                w={{ base: 'full', md: 'auto' }}
                mb={{ base: 2, md: 0 }}
              >
                Practice Quizzes
              </Button>
              {!hasPaidEnrollment && user && (
                <Button 
                  size={{ base: 'md', md: 'lg' }} 
                  colorScheme="teal" 
                  onClick={() => navigate('/courses')}
                  w={{ base: 'full', md: 'auto' }}
                  mb={{ base: 2, md: 0 }}
                >
                  Buy Now
                </Button>
              )}
            </HStack>
          </VStack>
          <Box flex={1} display={{ base: 'none', md: 'block' }}>
            <Image
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop"
              alt="Learning Hero"
              rounded="lg"
              objectFit="cover"
              w="100%"
              h="360px"
              shadow="xl"
            />
          </Box>
        </Flex>
      </MotionBox>

      {/* Categories */}
      <Box as="section" py={10} maxW="6xl" mx="auto" px={4}>
        <Heading size="lg" mb={6} textAlign="center">Top Categories</Heading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
          {categories.map((c) => (
            <Card key={c.label} variant="outline" _hover={{ shadow: 'md', transform: 'translateY(-4px)' }} transition="all 0.2s">
              <CardBody textAlign="center">
                <VStack spacing={3}>
                  <Box p={3} rounded="full" bg="teal.50" color="teal.600">
                    <Icon as={c.icon} boxSize={6} />
                  </Box>
                  <Text fontWeight="medium">{c.label}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Popular Courses */}
      <Box as="section" id="featured" py={20} maxW="6xl" mx="auto" px={4}>
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading 
            mb={6} 
            textAlign="center" 
            color="brand.text" 
            className="gradient-text"
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Popular Courses
          </Heading>
          <Text 
            textAlign="center" 
            color="gray.700" 
            opacity="1" 
            fontSize="lg" 
            mb={8}
            fontWeight="medium"
          >
            Discover high-quality courses designed to help you succeed
          </Text>
        </MotionBox>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
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
                    variant="neon"
                    colorScheme="teal"
                  >
                    {course.price ? `₹${course.price}` : 'Free'}
                  </Badge>
                </Box>
                <Heading fontSize="xl" mb={2} color="gray.800">{course.title}</Heading>
                <Text mb={4} color="gray.600" fontSize="sm">{course.description.slice(0, 60)}...</Text>
                <HStack justify="space-between" align="center" mb={4}>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaUsers} />
                    <Text>{course.enrolledStudents || 0} students</Text>
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
                >
                  View Course
                </Button>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Box>

      {/* CTA Banner */}
      <Box as="section" py={14} px={4}>
        <Card maxW="6xl" mx="auto" bgGradient="linear(to-r, teal.500, teal.600)" color="white">
          <CardBody>
            <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" gap={4}>
              <VStack align="start" spacing={2}>
                <Heading size="lg">Start learning today</Heading>
                <Text opacity={0.9}>Join thousands of students achieving their goals</Text>
              </VStack>
              <HStack>
                <Button colorScheme="whiteAlpha" variant="solid" size="lg" onClick={() => navigate('/courses')}>
                  Browse Courses
                </Button>
                {!hasPaidEnrollment && (
                  <Button bg="white" color="teal.600" _hover={{ bg: 'whiteAlpha.900' }} size="lg" onClick={() => navigate('/courses')}>
                    Buy Now
                  </Button>
                )}
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </Box>

      {/* Student Success Stories (from admin-published) */}
      {stories.length > 0 && (
        <Box as="section" id="stories" py={16} maxW="6xl" mx="auto" px={4}>
          <Heading mb={6} textAlign="center" color="brand.text" className="gradient-text" fontWeight="extrabold" letterSpacing="wide">
            Student Success Stories
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {stories.map((s) => (
              <Card key={s._id} variant="glass">
                <CardBody>
                  <VStack spacing={3} align="start">
                    {s.imagePath && (
                      <Image src={s.imagePath} alt={s.name} w="100%" h="180px" objectFit="cover" rounded="md" />
                    )}
                    <Heading size="md" color="gray.800">{s.name}</Heading>
                    <Text color="gray.600" noOfLines={4}>{s.story}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Testimonials */}
      <Box as="section" id="testimonials" py={20} bg="brand.surface">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Heading 
            mb={8} 
            textAlign="center" 
            color="brand.text" 
            className="gradient-text"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Student Success Stories
          </Heading>
        </MotionBox>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="6xl" mx="auto" px={4}>
          {testimonials.map((t, i) => (
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
                    src={t.avatar} 
                    alt={t.name} 
                    rounded="full" 
                    boxSize="80px" 
                    mx="auto"
                    shadow="lg"
                    border="3px solid"
                    borderColor="neon.blue"
                  />
                  <Box
                    position="absolute"
                    top="-2px"
                    left="-2px"
                    right="-2px"
                    bottom="-2px"
                    bg="neon.blue"
                    rounded="full"
                    opacity="0.3"
                    filter="blur(8px)"
                    zIndex={-1}
                  />
                </Box>
                <Text fontSize="lg" mb={2} fontStyle="italic" color="gray.700">"{t.text}"</Text>
                <Text fontWeight="bold" color="neon.blue">{t.name}</Text>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Box>

      {/* Why Choose Us */}
      <Box as="section" id="why" py={20} maxW="5xl" mx="auto" px={4}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Heading 
            mb={8} 
            textAlign="center" 
            color="brand.text" 
            className="gradient-text"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Why Choose Us?
          </Heading>
        </MotionBox>
        <HStack spacing={8} justify="center" flexWrap="wrap">
          {whyChoose.map((item, i) => (
            <MotionBox
              key={i}
              className="why-choose-item"
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
              <VStack spacing={4} p={6} bg="brand.surface" rounded="xl">
                <Box
                  p={4}
                  bg="neon.blue"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 20px rgba(59, 130, 246, 0.5)"
                >
                  <Icon as={item.icon} boxSize={8} />
                </Box>
                <Text 
                  fontWeight="bold" 
                  fontSize="lg" 
                  color="brand.text"
                  letterSpacing="wide"
                >
                  {item.label}
                </Text>
              </VStack>
            </MotionBox>
          ))}
        </HStack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing; 