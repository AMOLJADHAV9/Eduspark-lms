import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Button,
  Text,
  Badge,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  useColorModeValue,
  Icon,
  Flex,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes, FaSlidersH } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const CourseSearch = ({ onSearch, courses = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    duration: '',
    level: '',
    instructor: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Extract unique values for filter options
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
  const levels = [...new Set(courses.map(course => course.level).filter(Boolean))];
  const instructors = [...new Set(courses.map(course => course.createdBy?.name).filter(Boolean))];

  const durationOptions = [
    { value: '0-2', label: '0-2 hours' },
    { value: '2-5', label: '2-5 hours' },
    { value: '5-10', label: '5-10 hours' },
    { value: '10+', label: '10+ hours' },
  ];

  useEffect(() => {
    // Update active filters display
    const active = [];
    if (filters.category) active.push(`Category: ${filters.category}`);
    if (filters.level) active.push(`Level: ${filters.level}`);
    if (filters.duration) active.push(`Duration: ${filters.duration}`);
    if (filters.instructor) active.push(`Instructor: ${filters.instructor}`);
    if (filters.priceRange[1] < 10000) active.push(`Price: ₹0-₹${filters.priceRange[1]}`);
    
    setActiveFilters(active);
  }, [filters]);

  const handleSearch = () => {
    const searchData = {
      searchTerm,
      filters,
    };
    onSearch(searchData);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000],
      duration: '',
      level: '',
      instructor: '',
    });
    setSearchTerm('');
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: '',
    }));
  };

  return (
    <MotionCard
      variant="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      mb={8}
    >
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Search Bar */}
          <HStack spacing={4}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="glass"
                bg="glass.200"
                border="1px solid"
                borderColor="glass.300"
                _focus={{
                  borderColor: "neon.blue",
                  boxShadow: "0 0 0 1px var(--chakra-colors-neon-blue)",
                }}
                _placeholder={{ color: "gray.400" }}
              />
            </InputGroup>

            <Button
              variant="3d-primary"
              onClick={handleSearch}
              size="lg"
              minW="120px"
            >
              Search
            </Button>
          </HStack>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text color="white" fontWeight="medium">Active Filters:</Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="white"
                    onClick={clearFilters}
                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  >
                    Clear All
                  </Button>
                </HStack>
                <Flex wrap="wrap" gap={2}>
                  {activeFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      variant="neon"
                      colorScheme="teal"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {filter}
                    </Badge>
                  ))}
                </Flex>
              </VStack>
            </MotionBox>
          )}

          {/* Filter Panel */}
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showFilters ? 1 : 0, 
              height: showFilters ? "auto" : 0 
            }}
            transition={{ duration: 0.3 }}
            overflow="hidden"
          >
            <VStack spacing={6} align="stretch" pt={4}>
              <Divider borderColor="glass.300" />
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {/* Category Filter */}
                <VStack align="stretch" spacing={2}>
                  <Text color="white" fontWeight="medium">Category</Text>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    variant="glass"
                    bg="glass.200"
                    border="1px solid"
                    borderColor="glass.300"
                    _focus={{
                      borderColor: "neon.blue",
                      boxShadow: "0 0 0 1px var(--chakra-colors-neon-blue)",
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </VStack>

                {/* Level Filter */}
                <VStack align="stretch" spacing={2}>
                  <Text color="white" fontWeight="medium">Level</Text>
                  <Select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    variant="glass"
                    bg="glass.200"
                    border="1px solid"
                    borderColor="glass.300"
                    _focus={{
                      borderColor: "neon.blue",
                      boxShadow: "0 0 0 1px var(--chakra-colors-neon-blue)",
                    }}
                  >
                    <option value="">All Levels</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </VStack>

                {/* Duration Filter */}
                <VStack align="stretch" spacing={2}>
                  <Text color="white" fontWeight="medium">Duration</Text>
                  <Select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    variant="glass"
                    bg="glass.200"
                    border="1px solid"
                    borderColor="glass.300"
                    _focus={{
                      borderColor: "neon.blue",
                      boxShadow: "0 0 0 1px var(--chakra-colors-neon-blue)",
                    }}
                  >
                    <option value="">Any Duration</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </VStack>

                {/* Instructor Filter */}
                <VStack align="stretch" spacing={2}>
                  <Text color="white" fontWeight="medium">Instructor</Text>
                  <Select
                    value={filters.instructor}
                    onChange={(e) => handleFilterChange('instructor', e.target.value)}
                    variant="glass"
                    bg="glass.200"
                    border="1px solid"
                    borderColor="glass.300"
                    _focus={{
                      borderColor: "neon.blue",
                      boxShadow: "0 0 0 1px var(--chakra-colors-neon-blue)",
                    }}
                  >
                    <option value="">All Instructors</option>
                    {instructors.map(instructor => (
                      <option key={instructor} value={instructor}>{instructor}</option>
                    ))}
                  </Select>
                </VStack>

                {/* Price Range Filter */}
                <VStack align="stretch" spacing={2} gridColumn={{ base: 1, md: 2, lg: 1 }}>
                  <Text color="white" fontWeight="medium">
                    Price Range: ₹0 - ₹{filters.priceRange[1]}
                  </Text>
                  <Box px={2}>
                    <Slider
                      value={filters.priceRange}
                      onChange={(value) => handleFilterChange('priceRange', value)}
                      min={0}
                      max={10000}
                      step={100}
                      size="lg"
                    >
                      <SliderMark value={0} mt={4} fontSize="sm" color="white">
                        ₹0
                      </SliderMark>
                      <SliderMark value={5000} mt={4} fontSize="sm" color="white">
                        ₹5k
                      </SliderMark>
                      <SliderMark value={10000} mt={4} fontSize="sm" color="white">
                        ₹10k
                      </SliderMark>
                      <SliderTrack bg="glass.300">
                        <SliderFilledTrack bg="neon.blue" />
                      </SliderTrack>
                      <SliderThumb 
                        bg="neon.blue" 
                        boxShadow="0 0 10px rgba(59, 130, 246, 0.5)"
                      />
                    </Slider>
                  </Box>
                </VStack>
              </SimpleGrid>

              {/* Filter Actions */}
              <HStack justify="center" spacing={4} pt={4}>
                <Button
                  variant="3d"
                  onClick={clearFilters}
                  leftIcon={<FaTimes />}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="3d-primary"
                  onClick={handleSearch}
                  leftIcon={<FaSearch />}
                >
                  Apply Filters
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

export default CourseSearch; 