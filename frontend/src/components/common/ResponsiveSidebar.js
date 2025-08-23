import React from 'react';
import { Box, VStack, Link, Text, Divider, IconButton, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useBreakpointValue } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const ResponsiveSidebar = ({ links, title, isOpen, onToggle, onClose, mobileButtonStyle }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const SidebarContent = () => (
    <VStack align="stretch" spacing={2}>
      {links.map(link => {
        const IconComponent = link.icon;
        return (
          <Link
            as={NavLink}
            to={link.to}
            key={link.to}
            px={4}
            py={3}
            rounded="md"
            _hover={{ bg: 'teal.50', color: 'teal.600' }}
            _activeLink={{ bg: 'teal.500', color: 'white' }}
            fontWeight="medium"
            display="flex"
            alignItems="center"
            gap={3}
            transition="all 0.2s"
            onClick={isMobile ? onClose : undefined}
          >
            {IconComponent && <IconComponent />}
            {link.label}
          </Link>
        );
      })}
    </VStack>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          icon={<FaBars />}
          onClick={onToggle}
          variant="ghost"
          colorScheme="teal"
          size="lg"
          display={{ base: 'flex', md: 'none' }}
          position="fixed"
          top={4}
          left={4}
          zIndex={1000}
          bg="white"
          boxShadow="lg"
          style={mobileButtonStyle}
        />
        
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px" color="teal.500" fontWeight="bold">
              {title}
            </DrawerHeader>
            <DrawerBody pt={6}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box 
      bg="white" 
      color="gray.800" 
      minH="100vh" 
      w={64} 
      p={6} 
      shadow="3d-lg" 
      borderRight="1px solid" 
      borderColor="gray.100"
      position="sticky"
      top={0}
      left={0}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={8} color="teal.500">
        {title}
      </Text>
      <SidebarContent />
    </Box>
  );
};

export default ResponsiveSidebar;
