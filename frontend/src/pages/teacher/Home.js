import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useColorModeValue,
  Card,
  CardBody,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FaUser, FaDoorOpen, FaVideo, FaUsers } from 'react-icons/fa';

function Home() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Audience");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const navigateToRoom = () => {
    navigate(`/room/${roomId}`, {
      state: { name: name, role: role },
    });
  };

  return (
    <Box bg={bg} minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="md" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" py={4}>
            <Heading 
              size="xl" 
              color="teal.600" 
              mb={2}
              fontSize={{ base: '2xl', md: '3xl' }}
            >
              Join a Room
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Enter your details to join the live session
            </Text>
          </Box>

          {/* Form Card */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl">
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                {/* Name Input */}
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                    <HStack spacing={2}>
                      <Icon as={FaUser} color="teal.500" />
                      <Text>Your Name</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'teal.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
                    }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                {/* Room ID Input */}
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                    <HStack spacing={2}>
                      <Icon as={FaDoorOpen} color="teal.500" />
                      <Text>Room ID</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'teal.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
                    }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                {/* Role Selection */}
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                    <HStack spacing={2}>
                      <Icon as={FaVideo} color="teal.500" />
                      <Text>Role</Text>
                    </HStack>
                  </FormLabel>
                  <RadioGroup value={role} onChange={setRole}>
                    <VStack spacing={3} align="start">
                      <Radio 
                        value="Host" 
                        colorScheme="teal"
                        size={{ base: 'md', md: 'lg' }}
                      >
                        <HStack spacing={2}>
                          <Icon as={FaVideo} color="teal.500" />
                          <Text fontSize={{ base: 'sm', md: 'md' }}>Host</Text>
                        </HStack>
                      </Radio>
                      <Radio 
                        value="Audience" 
                        colorScheme="teal"
                        size={{ base: 'md', md: 'lg' }}
                      >
                        <HStack spacing={2}>
                          <Icon as={FaUsers} color="teal.500" />
                          <Text fontSize={{ base: 'sm', md: 'md' }}>Audience</Text>
                        </HStack>
                      </Radio>
                    </VStack>
                  </RadioGroup>
                </FormControl>

                {/* Join Button */}
                <Button
                  onClick={navigateToRoom}
                  colorScheme="teal"
                  size={{ base: 'lg', md: 'xl' }}
                  borderRadius="lg"
                  py={{ base: 6, md: 8 }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="semibold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.3s"
                  isDisabled={!name || !roomId}
                  opacity={!name || !roomId ? 0.6 : 1}
                >
                  <HStack spacing={2}>
                    <Icon as={FaDoorOpen} />
                    <Text>Join Room</Text>
                  </HStack>
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default Home;
