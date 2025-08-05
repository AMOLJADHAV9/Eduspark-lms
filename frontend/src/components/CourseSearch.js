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
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

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
    <Box bg={bg} p={6} rounded="lg" shadow="md" border="1px" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        {/* Search Bar */}
        <HStack spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search courses by title, description, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </InputGroup>
          <Button
            leftIcon={<FaFilter />}
            variant={showFilters ? "solid" : "outline"}
            colorScheme="teal"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            leftIcon={<FaTimes />}
            variant="outline"
            onClick={clearFilters}
            isDisabled={!searchTerm && activeFilters.length === 0}
          >
            Clear
          </Button>
        </HStack>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Active Filters:</Text>
            <HStack spacing={2} flexWrap="wrap">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  colorScheme="teal"
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {filter}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <Box borderTop="1px" borderColor={borderColor} pt={4}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg">Filters</Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Category Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Category</Text>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    placeholder="All Categories"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </Box>

                {/* Level Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Level</Text>
                  <Select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    placeholder="All Levels"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </Box>

                {/* Duration Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Duration</Text>
                  <Select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    placeholder="Any Duration"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Box>

                {/* Instructor Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Instructor</Text>
                  <Select
                    value={filters.instructor}
                    onChange={(e) => handleFilterChange('instructor', e.target.value)}
                    placeholder="All Instructors"
                  >
                    {instructors.map(instructor => (
                      <option key={instructor} value={instructor}>{instructor}</option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>

              {/* Price Range Filter */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </Text>
                <Slider
                  value={filters.priceRange}
                  onChange={(value) => handleFilterChange('priceRange', value)}
                  min={0}
                  max={10000}
                  step={500}
                >
                  <SliderMark value={0} mt={2} fontSize="sm">₹0</SliderMark>
                  <SliderMark value={5000} mt={2} fontSize="sm">₹5k</SliderMark>
                  <SliderMark value={10000} mt={2} fontSize="sm">₹10k</SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                  <SliderThumb boxSize={6} />
                </Slider>
              </Box>

              {/* Apply Filters Button */}
              <Button colorScheme="teal" onClick={handleSearch}>
                Apply Filters
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default CourseSearch; 