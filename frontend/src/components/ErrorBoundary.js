import React from 'react';
import { Box, Text, Button, VStack, Heading } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          bg="gradients.primary"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <VStack spacing={6} textAlign="center" color="white">
            <Heading size="2xl">Oops! Something went wrong</Heading>
            <Text fontSize="lg">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            <Button
              onClick={() => window.location.reload()}
              variant="3d-primary"
              size="lg"
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={4}
                p={4}
                bg="rgba(0,0,0,0.3)"
                borderRadius="md"
                maxW="600px"
                textAlign="left"
              >
                <Text fontWeight="bold" mb={2}>Error Details (Development):</Text>
                <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                  {this.state.error.toString()}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
