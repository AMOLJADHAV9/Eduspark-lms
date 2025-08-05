import React from 'react';
import { Box, Flex, Text, Link, HStack } from '@chakra-ui/react';

const Footer = () => (
  <Box bg="gray.800" color="white" py={8} mt={16}>
    <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" maxW="6xl" mx="auto" px={8}>
      <Text fontWeight="bold" fontSize="lg">PW LMS</Text>
      <HStack spacing={8} mt={{ base: 4, md: 0 }}>
        <Link href="#about" color="teal.200" _hover={{ color: 'white' }}>About</Link>
        <Link href="#contact" color="teal.200" _hover={{ color: 'white' }}>Contact</Link>
        <Link href="#privacy" color="teal.200" _hover={{ color: 'white' }}>Privacy Policy</Link>
      </HStack>
      <Text fontSize="sm" mt={{ base: 4, md: 0 }}>&copy; {new Date().getFullYear()} PW LMS. All rights reserved.</Text>
    </Flex>
  </Box>
);

export default Footer; 