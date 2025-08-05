import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  Center,
  Spinner
} from '@chakra-ui/react';
import { FaSearch, FaCheck, FaTimes, FaCertificate } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CertificateVerify = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  const toast = useToast();

  const verifyCertificate = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast({
        title: 'Please enter verification code',
        status: 'warning'
      });
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`/api/certificates/verify/${verificationCode}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      } else {
        setVerificationResult({ isValid: false, message: 'Invalid verification code' });
      }
    } catch (error) {
      setVerificationResult({ isValid: false, message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'green',
      'A': 'green',
      'B+': 'blue',
      'B': 'blue',
      'C+': 'yellow',
      'C': 'yellow',
      'D': 'orange',
      'F': 'red'
    };
    return colors[grade] || 'gray';
  };

  return (
    <Box>
      <Navbar />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Center>
            <VStack spacing={4}>
              <FaCertificate size={48} color="#319795" />
              <Heading>Certificate Verification</Heading>
              <Text color="gray.600" textAlign="center">
                Verify the authenticity of certificates issued by our platform
              </Text>
            </VStack>
          </Center>

          <Card>
            <CardHeader>
              <Heading size="md">Enter Verification Code</Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={verifyCertificate}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Verification Code</FormLabel>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter the verification code from the certificate"
                      size="lg"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    leftIcon={<FaSearch />}
                    isLoading={verifying}
                    loadingText="Verifying"
                    w="full"
                  >
                    Verify Certificate
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {verificationResult && (
            <Card>
              <CardHeader>
                <HStack>
                  <AlertIcon as={verificationResult.isValid ? FaCheck : FaTimes} />
                  <Heading size="md">
                    {verificationResult.isValid ? 'Certificate Verified!' : 'Verification Failed'}
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {verificationResult.isValid ? (
                  <VStack spacing={4} align="stretch">
                    <Alert status="success">
                      <AlertIcon />
                      This certificate is valid and has been verified by our system.
                    </Alert>

                    <Box>
                      <Text fontWeight="bold" mb={2}>Certificate Details:</Text>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Certificate Number:</Text>
                          <Text fontFamily="mono">{verificationResult.certificate.certificateNumber}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Student Name:</Text>
                          <Text>{verificationResult.certificate.studentName}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Course:</Text>
                          <Text>{verificationResult.certificate.courseTitle}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Grade:</Text>
                          <Badge colorScheme={getGradeColor(verificationResult.certificate.grade)}>
                            {verificationResult.certificate.grade}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Score:</Text>
                          <Text>{verificationResult.certificate.percentage}%</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Completed:</Text>
                          <Text>{formatDate(verificationResult.certificate.completedAt)}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Issued:</Text>
                          <Text>{formatDate(verificationResult.certificate.issuedAt)}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Instructor:</Text>
                          <Text>{verificationResult.certificate.instructorName}</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Divider />

                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      This certificate has been digitally verified and is authentic.
                      <br />
                      For any questions, please contact our support team.
                    </Text>
                  </VStack>
                ) : (
                  <Alert status="error">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Verification Failed</Text>
                      <Text>{verificationResult.message || 'The verification code is invalid or the certificate does not exist.'}</Text>
                    </VStack>
                  </Alert>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <Heading size="md">How to Verify a Certificate</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  To verify a certificate's authenticity, follow these steps:
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <Text fontWeight="bold">1.</Text>
                    <Text>Locate the verification code on the certificate (usually at the bottom)</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">2.</Text>
                    <Text>Enter the verification code in the field above</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">3.</Text>
                    <Text>Click "Verify Certificate" to check authenticity</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">4.</Text>
                    <Text>View the verification results and certificate details</Text>
                  </HStack>
                </VStack>
                
                <Alert status="info">
                  <AlertIcon />
                  <Text fontSize="sm">
                    <strong>Note:</strong> All certificates issued by our platform include a unique verification code 
                    that can be used to verify their authenticity at any time.
                  </Text>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default CertificateVerify; 