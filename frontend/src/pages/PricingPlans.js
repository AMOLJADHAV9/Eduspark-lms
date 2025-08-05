import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  useToast,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  List,
  ListItem,
  ListIcon,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Stack,
  Flex,
  Tag,
  TagLabel,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaCheck, 
  FaTimes, 
  FaStar, 
  FaCrown, 
  FaRocket, 
  FaUsers, 
  FaVideo, 
  FaBook, 
  FaGraduationCap,
  FaCreditCard,
  FaPaypal,
  FaShieldAlt,
  FaClock,
  FaInfinity,
  FaGift,
  FaPercent,
  FaDollarSign
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { token, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/payment/plans?status=active');
      if (!res.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error loading plans',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/payment/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: selectedPlan?.pricing?.amount || 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCouponValidation(data);
        toast({
          title: 'Coupon applied!',
          description: `Discount: $${(data.discountAmount / 100).toFixed(2)}`,
          status: 'success'
        });
      } else {
        const error = await res.json();
        setCouponValidation(null);
        toast({
          title: 'Invalid coupon',
          description: error.message,
          status: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error validating coupon',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payment/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentMethod,
          couponCode: couponValidation?.coupon?.code || null
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      const subscription = await res.json();
      toast({
        title: 'Subscription created!',
        description: `Welcome to ${selectedPlan.name}`,
        status: 'success'
      });
      setIsModalOpen(false);
      setSelectedPlan(null);
      setCouponCode('');
      setCouponValidation(null);
    } catch (error) {
      toast({
        title: 'Error creating subscription',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      'Unlimited Courses': FaBook,
      'Live Classes': FaVideo,
      'Certificates': FaGraduationCap,
      'Quizzes': FaUsers,
      'Assignments': FaUsers,
      'Forums': FaUsers,
      'Personalized Learning': FaRocket,
      'Mobile Access': FaUsers,
      'Priority Support': FaStar,
      'Advanced Analytics': FaUsers,
      'API Access': FaUsers,
      'White Label': FaCrown
    };
    return icons[feature] || FaCheck;
  };

  const formatPrice = (amount, currency = 'USD') => {
    const price = amount / 100; // Convert cents to dollars
    return `${currency} ${price.toFixed(2)}`;
  };

  const getPlanBadgeColor = (plan) => {
    if (plan.isPopular) return 'orange';
    if (plan.isRecommended) return 'blue';
    return 'gray';
  };

  const getPlanBadgeText = (plan) => {
    if (plan.isPopular) return 'Most Popular';
    if (plan.isRecommended) return 'Recommended';
    return '';
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Center h="50vh">
            <Spinner size="xl" />
          </Center>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading>Choose Your Plan</Heading>
            <Text color="gray.600" fontSize="lg">
              Start your learning journey with our flexible pricing options
            </Text>
          </VStack>

          {/* Billing Toggle */}
          <Center>
            <HStack spacing={4}>
              <Text>Monthly</Text>
              <Switch 
                isChecked={billingInterval === 'yearly'} 
                onChange={(e) => setBillingInterval(e.target.checked ? 'yearly' : 'monthly')}
                colorScheme="teal"
              />
              <Text>Yearly (Save up to 20%)</Text>
            </HStack>
          </Center>

          {/* Plans Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {plans.map((plan) => (
              <Card 
                key={plan._id} 
                variant={plan.isPopular ? 'filled' : 'outline'}
                borderColor={plan.isPopular ? 'orange.500' : undefined}
                position="relative"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s"
              >
                {plan.isPopular && (
                  <Badge
                    position="absolute"
                    top={-3}
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme="orange"
                    borderRadius="full"
                    px={4}
                    py={1}
                  >
                    Most Popular
                  </Badge>
                )}

                <CardHeader textAlign="center">
                  <VStack spacing={2}>
                    <Heading size="md">{plan.name}</Heading>
                    <Text color="gray.600" noOfLines={2}>
                      {plan.description}
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="3xl" fontWeight="bold">
                        {formatPrice(plan.pricing.amount)}
                      </Text>
                      <Text color="gray.500">
                        /{plan.pricing.interval}
                      </Text>
                    </HStack>
                    {plan.pricing.trialDays > 0 && (
                      <Badge colorScheme="green">
                        {plan.pricing.trialDays} days free trial
                      </Badge>
                    )}
                  </VStack>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Features */}
                    <List spacing={3}>
                      {plan.features.map((feature, index) => {
                        const FeatureIcon = getFeatureIcon(feature.name);
                        return (
                          <ListItem key={index}>
                            <HStack>
                              <Icon as={FeatureIcon} color="green.500" />
                              <Text>{feature.name}</Text>
                              {feature.limit && feature.limit !== -1 && (
                                <Badge size="sm" colorScheme="blue">
                                  {feature.limit}
                                </Badge>
                              )}
                              {feature.limit === -1 && (
                                <Icon as={FaInfinity} color="blue.500" />
                              )}
                            </HStack>
                          </ListItem>
                        );
                      })}
                    </List>

                    <Divider />

                    {/* Limits */}
                    <VStack spacing={2} align="stretch">
                      <Text fontWeight="bold" fontSize="sm">Limits:</Text>
                      <SimpleGrid columns={2} spacing={2}>
                        {Object.entries(plan.limits).map(([key, value]) => (
                          <HStack key={key} fontSize="sm">
                            <Icon as={FaClock} color="gray.500" />
                            <Text>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
                            <Text fontWeight="bold">
                              {value === -1 ? 'Unlimited' : value}
                            </Text>
                          </HStack>
                        ))}
                      </SimpleGrid>
                    </VStack>

                    <Button
                      colorScheme={plan.isPopular ? 'orange' : 'teal'}
                      size="lg"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsModalOpen(true);
                      }}
                    >
                      Choose Plan
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <Heading size="md">Frequently Asked Questions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontWeight="bold">Can I cancel my subscription anytime?</Text>
                  <Text color="gray.600">Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Do you offer refunds?</Text>
                  <Text color="gray.600">We offer a 7-day money-back guarantee for all new subscriptions. Contact our support team for assistance.</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Can I change my plan?</Text>
                  <Text color="gray.600">Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">What payment methods do you accept?</Text>
                  <Text color="gray.600">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Subscription Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Subscribe to {selectedPlan?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPlan && (
              <VStack spacing={6} align="stretch">
                {/* Plan Summary */}
                <Card variant="outline">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Plan:</Text>
                        <Text>{selectedPlan.name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Price:</Text>
                        <Text>{formatPrice(selectedPlan.pricing.amount)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Billing:</Text>
                        <Text>{selectedPlan.pricing.interval}</Text>
                      </HStack>
                      {selectedPlan.pricing.trialDays > 0 && (
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Trial:</Text>
                          <Text>{selectedPlan.pricing.trialDays} days</Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Coupon Code */}
                <FormControl>
                  <FormLabel>Coupon Code (Optional)</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={validateCoupon} size="md">
                      Apply
                    </Button>
                  </HStack>
                  {couponValidation && (
                    <Alert status="success" mt={2}>
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">Coupon Applied!</Text>
                        <Text>Discount: {formatPrice(couponValidation.discountAmount)}</Text>
                        <Text>Final Price: {formatPrice(couponValidation.finalAmount)}</Text>
                      </VStack>
                    </Alert>
                  )}
                </FormControl>

                {/* Payment Method */}
                <FormControl>
                  <FormLabel>Payment Method</FormLabel>
                  <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                    <Stack direction="row">
                      <Radio value="stripe">
                        <HStack>
                          <Icon as={FaCreditCard} />
                          <Text>Credit Card</Text>
                        </HStack>
                      </Radio>
                      <Radio value="paypal">
                        <HStack>
                          <Icon as={FaPaypal} />
                          <Text>PayPal</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Terms */}
                <FormControl>
                  <Checkbox defaultChecked>
                    I agree to the Terms of Service and Privacy Policy
                  </Checkbox>
                </FormControl>

                {/* Action Buttons */}
                <HStack spacing={4}>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    flex={1}
                    onClick={handleSubscribe}
                    isLoading={isProcessing}
                    loadingText="Processing..."
                  >
                    Subscribe Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    flex={1}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default PricingPlans; 