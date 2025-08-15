import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Center,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Icon,
  Flex,
  IconButton,
  Divider
} from '@chakra-ui/react';
import { FaBell, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Notifications = () => {
  const { token, apiBaseUrl } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        toast({
          title: 'Notification deleted',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error deleting notification',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
        toast({
          title: 'All notifications marked as read',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'live_class':
        return '🔴';
      case 'course_update':
        return '📚';
      case 'assignment':
        return '📝';
      case 'quiz':
        return '❓';
      default:
        return '📢';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Center h="calc(100vh - 200px)">
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text>Loading notifications...</Text>
          </VStack>
        </Center>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={FaBell} color="teal.500" />
                <Heading size="lg">Notifications</Heading>
                {unreadCount > 0 && (
                  <Badge colorScheme="red" borderRadius="full" px={2}>
                    {unreadCount} unread
                  </Badge>
                )}
              </HStack>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  leftIcon={<FaCheck />}
                >
                  Mark all read
                </Button>
              )}
            </HStack>
          </Box>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardBody>
                <Center p={8}>
                  <VStack spacing={4}>
                    <Icon as={FaBell} size="4xl" color="gray.400" />
                    <Text fontSize="lg" color="gray.500">No notifications</Text>
                    <Text color="gray.400">You're all caught up!</Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  bg={notification.isRead ? "white" : "blue.50"}
                  borderLeft={notification.isRead ? "none" : "4px solid"}
                  borderLeftColor="blue.500"
                >
                  <CardBody>
                    <HStack spacing={4} align="start">
                      <Text fontSize="xl">{getNotificationIcon(notification.type)}</Text>
                      
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="semibold" fontSize="md">
                            {notification.title}
                          </Text>
                          <HStack spacing={2}>
                            {notification.priority === 'high' && (
                              <Badge size="sm" colorScheme="red">High</Badge>
                            )}
                            <Text fontSize="xs" color="gray.500">
                              {formatTime(notification.createdAt)}
                            </Text>
                          </HStack>
                        </HStack>
                        
                        <Text color="gray.600" fontSize="sm">
                          {notification.message}
                        </Text>
                        
                        {notification.metadata?.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="teal"
                            onClick={() => window.location.href = notification.metadata.actionUrl}
                          >
                            View Details
                          </Button>
                        )}
                      </VStack>
                      
                      <VStack spacing={1}>
                        {!notification.isRead && (
                          <IconButton
                            size="sm"
                            icon={<FaCheck />}
                            variant="ghost"
                            onClick={() => markAsRead(notification._id)}
                            aria-label="Mark as read"
                            colorScheme="green"
                          />
                        )}
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          variant="ghost"
                          onClick={() => deleteNotification(notification._id)}
                          aria-label="Delete notification"
                          colorScheme="red"
                        />
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default Notifications;
