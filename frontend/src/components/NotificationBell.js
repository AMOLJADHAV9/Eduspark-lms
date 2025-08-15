import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  useToast,
  Spinner,
  Center,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { FaBell, FaTimes, FaCheck, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { token, apiBaseUrl } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
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

  const markAsClicked = async (notificationId, actionUrl) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/click`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isClicked: true, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Navigate to the action URL if provided
        if (actionUrl) {
          navigate(actionUrl);
        }
      }
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
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

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            icon={<FaBell />}
            variant="ghost"
            size="md"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent width="400px" maxHeight="500px" overflow="hidden">
        <PopoverBody p={0}>
          <Box p={4} borderBottom="1px" borderColor="gray.200">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="lg">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  leftIcon={<FaCheck />}
                >
                  Mark all read
                </Button>
              )}
            </Flex>
          </Box>
          
          <Box maxHeight="400px" overflowY="auto">
            {loading ? (
              <Center p={8}>
                <Spinner />
              </Center>
            ) : notifications.length === 0 ? (
              <Center p={8}>
                <VStack spacing={2}>
                  <FaBell size="2xl" color="gray.400" />
                  <Text color="gray.500">No notifications</Text>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={0} align="stretch">
                {notifications.map((notification, index) => (
                  <Box
                    key={notification._id}
                    p={4}
                    borderBottom={index < notifications.length - 1 ? "1px" : "none"}
                    borderColor="gray.100"
                    bg={notification.isRead ? "white" : "blue.50"}
                    cursor="pointer"
                    _hover={{ bg: notification.isRead ? "gray.50" : "blue.100" }}
                    onClick={() => markAsClicked(notification._id, notification.metadata?.actionUrl)}
                  >
                    <HStack spacing={3} align="start">
                      <Text fontSize="lg">{getNotificationIcon(notification.type)}</Text>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {notification.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                          {notification.message}
                        </Text>
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Text>{formatTime(notification.createdAt)}</Text>
                          {notification.priority === 'high' && (
                            <Badge size="sm" colorScheme="red">High</Badge>
                          )}
                        </HStack>
                      </VStack>
                      <VStack spacing={1}>
                        <IconButton
                          size="xs"
                          icon={<FaTimes />}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          aria-label="Delete notification"
                        />
                        {!notification.isRead && (
                          <IconButton
                            size="xs"
                            icon={<FaCheck />}
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            aria-label="Mark as read"
                          />
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          
          {notifications.length > 0 && (
            <Box p={4} borderTop="1px" borderColor="gray.200">
              <Button
                size="sm"
                variant="outline"
                width="100%"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
              >
                View All Notifications
              </Button>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
