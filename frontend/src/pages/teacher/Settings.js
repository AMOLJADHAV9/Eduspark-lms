import React, { useState } from 'react';
import {
  Box, Flex, Heading, Text, VStack, Icon, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Input, Textarea, Button, Avatar, Select, useToast, HStack, Divider
} from '@chakra-ui/react';
import { FaCog, FaUser, FaLock, FaChalkboardTeacher, FaMoneyCheckAlt, FaTrash } from 'react-icons/fa';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherSettings = () => {
  const toast = useToast();
  // Dummy state for demonstration
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [preferences, setPreferences] = useState({
    subjects: [],
    availability: '',
  });
  const [payout, setPayout] = useState({ method: '', details: '' });

  // Dummy handlers
  const handleProfileSave = (e) => { e.preventDefault(); toast({ title: 'Profile updated', status: 'success' }); };
  const handlePasswordSave = (e) => { e.preventDefault(); toast({ title: 'Password changed', status: 'success' }); };
  const handlePreferencesSave = (e) => { e.preventDefault(); toast({ title: 'Preferences updated', status: 'success' }); };
  const handlePayoutSave = (e) => { e.preventDefault(); toast({ title: 'Payout details updated', status: 'success' }); };
  const handleDeleteAccount = () => { toast({ title: 'Account deletion requested', status: 'warning' }); };

  return (
    <>
      <Navbar />
      <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
        <TeacherSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            <Box
              bg="rgba(255, 255, 255, 0.15)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.18)"
              p={8}
            >
              <Tabs variant="enclosed" colorScheme="teal">
                <TabList>
                  <Tab><Icon as={FaUser} mr={2}/>Profile</Tab>
                  <Tab><Icon as={FaLock} mr={2}/>Password</Tab>
                  <Tab><Icon as={FaChalkboardTeacher} mr={2}/>Preferences</Tab>
                  <Tab><Icon as={FaMoneyCheckAlt} mr={2}/>Payout</Tab>
                  <Tab><Icon as={FaTrash} mr={2}/>Delete</Tab>
                </TabList>
                <TabPanels>
                  {/* Profile Tab */}
                  <TabPanel>
                    <Heading size="md" mb={4}>Profile</Heading>
                    <form onSubmit={handleProfileSave}>
                      <VStack spacing={4} align="stretch">
                        <HStack>
                          <Avatar size="xl" src={profile.avatar} name={profile.name} />
                          <Input
                            type="url"
                            placeholder="Avatar URL"
                            value={profile.avatar}
                            onChange={e => setProfile({ ...profile, avatar: e.target.value })}
                          />
                        </HStack>
                        <FormControl isRequired>
                          <FormLabel>Name</FormLabel>
                          <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                        </FormControl>
                        <Button colorScheme="teal" type="submit">Save Profile</Button>
                      </VStack>
                    </form>
                  </TabPanel>
                  {/* Password Tab */}
                  <TabPanel>
                    <Heading size="md" mb={4}>Change Password</Heading>
                    <form onSubmit={handlePasswordSave}>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Current Password</FormLabel>
                          <Input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>New Password</FormLabel>
                          <Input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Confirm New Password</FormLabel>
                          <Input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                        </FormControl>
                        <Button colorScheme="teal" type="submit">Change Password</Button>
                      </VStack>
                    </form>
                  </TabPanel>
                  {/* Preferences Tab */}
                  <TabPanel>
                    <Heading size="md" mb={4}>Teaching Preferences</Heading>
                    <form onSubmit={handlePreferencesSave}>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Subjects/Expertise</FormLabel>
                          <Select
                            multiple
                            value={preferences.subjects}
                            onChange={e => setPreferences({ ...preferences, subjects: Array.from(e.target.selectedOptions, option => option.value) })}
                          >
                            <option value="Programming">Programming</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Backend Development">Backend Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Design">Design</option>
                            <option value="Other">Other</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Availability</FormLabel>
                          <Input value={preferences.availability} onChange={e => setPreferences({ ...preferences, availability: e.target.value })} placeholder="e.g. Weekdays 6-9pm" />
                        </FormControl>
                        <Button colorScheme="teal" type="submit">Save Preferences</Button>
                      </VStack>
                    </form>
                  </TabPanel>
                  {/* Payout Tab */}
                  <TabPanel>
                    <Heading size="md" mb={4}>Payout / Bank Details</Heading>
                    <form onSubmit={handlePayoutSave}>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Method</FormLabel>
                          <Select value={payout.method} onChange={e => setPayout({ ...payout, method: e.target.value })}>
                            <option value="">Select method</option>
                            <option value="bank">Bank Account</option>
                            <option value="paypal">PayPal</option>
                          </Select>
                        </FormControl>
                        {payout.method === 'bank' && (
                          <FormControl isRequired>
                            <FormLabel>Bank Account Details</FormLabel>
                            <Textarea value={payout.details} onChange={e => setPayout({ ...payout, details: e.target.value })} placeholder="Account number, IFSC, etc." />
                          </FormControl>
                        )}
                        {payout.method === 'paypal' && (
                          <FormControl isRequired>
                            <FormLabel>PayPal Email</FormLabel>
                            <Input type="email" value={payout.details} onChange={e => setPayout({ ...payout, details: e.target.value })} placeholder="PayPal email" />
                          </FormControl>
                        )}
                        <Button colorScheme="teal" type="submit">Save Payout Details</Button>
                      </VStack>
                    </form>
                  </TabPanel>
                  {/* Delete Account Tab */}
                  <TabPanel>
                    <Heading size="md" mb={4} color="red.400">Delete Account</Heading>
                    <Text mb={4} color="red.300">Warning: This action is irreversible. All your courses, lectures, and data will be deleted.</Text>
                    <Button colorScheme="red" variant="solid" onClick={handleDeleteAccount}>Request Account Deletion</Button>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </>
  );
};

export default TeacherSettings; 