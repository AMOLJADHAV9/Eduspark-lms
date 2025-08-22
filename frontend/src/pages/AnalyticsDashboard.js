import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Card, CardBody,
  CardHeader, Badge, useToast, SimpleGrid, Alert, AlertIcon, Spinner, Center,
  Stat, StatLabel, StatNumber, StatHelpText, Tabs, TabList, TabPanels, Tab, TabPanel,
  Select, Table, Thead, Tbody, Tr, Th, Td, Icon, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel
} from '@chakra-ui/react';
import { 
  FaChartLine, FaUsers, FaGraduationCap, FaDollarSign, FaDownload,
  FaTrendingUp, FaTrendingDown, FaMinus
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('user');
  const [reportPeriod, setReportPeriod] = useState('30d');
  
  const { token, apiBaseUrl } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview data
      try {
        const overviewRes = await fetch(`${apiBaseUrl}/api/analytics/dashboard?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setDashboardData(overviewData);
        } else {
          console.warn('Failed to fetch overview data:', overviewRes.status);
          setDashboardData({ overview: {} });
        }
      } catch (error) {
        console.warn('Error fetching overview data:', error);
        setDashboardData({ overview: {} });
      }

      // Fetch revenue data
      try {
        const revenueRes = await fetch(`${apiBaseUrl}/api/analytics/revenue?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (revenueRes.ok) {
          const revenueAnalytics = await revenueRes.json();
          setRevenueData(revenueAnalytics);
        } else {
          console.warn('Failed to fetch revenue data:', revenueRes.status);
          setRevenueData(null);
        }
      } catch (error) {
        console.warn('Error fetching revenue data:', error);
        setRevenueData(null);
      }

      // Fetch engagement data
      try {
        const engagementRes = await fetch(`${apiBaseUrl}/api/analytics/engagement?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (engagementRes.ok) {
          const engagementAnalytics = await engagementRes.json();
          setEngagementData(engagementAnalytics);
        } else {
          console.warn('Failed to fetch engagement data:', engagementRes.status);
          setEngagementData(null);
        }
      } catch (error) {
        console.warn('Error fetching engagement data:', error);
        setEngagementData(null);
      }

      // Fetch insights data
      try {
        const insightsRes = await fetch(`${apiBaseUrl}/api/analytics/insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData.insights || []);
        } else {
          console.warn('Failed to fetch insights data:', insightsRes.status);
          setInsights([]);
        }
      } catch (error) {
        console.warn('Error fetching insights data:', error);
        setInsights([]);
      }

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Some data may not be available',
        status: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/analytics/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: reportType,
          period: reportPeriod,
          format: 'json'
        })
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const report = await res.json();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_analytics_report_${reportPeriod}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report generated',
        description: 'Report downloaded successfully',
        status: 'success'
      });
      setIsReportModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error generating report',
        description: error.message,
        status: 'error'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <Box>
        <Container maxW="container.xl" py={8}>
          <Center h="50vh">
            <Spinner size="xl" />
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading>Analytics Dashboard</Heading>
              <Text color="gray.600">Comprehensive insights and metrics</Text>
            </VStack>
            <HStack spacing={4}>
              <Select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                size="sm"
                w="150px"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="teal"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
              >
                Generate Report
              </Button>
            </HStack>
          </HStack>

          {dashboardData?.overview && (
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Card bg="white" textColor="gray.800">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Users</StatLabel>
                    <StatNumber color="blue.500">
                      {formatNumber(dashboardData.overview.totalUsers)}
                    </StatNumber>
                    <StatHelpText>
                      +{formatNumber(dashboardData.overview.newUsers)} new this period
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="white" textColor="gray.800">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Active Courses</StatLabel>
                    <StatNumber color="green.500">
                      {formatNumber(dashboardData.overview.activeCourses)}
                    </StatNumber>
                    <StatHelpText>
                      {formatNumber(dashboardData.overview.totalEnrollments)} total enrollments
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="white" textColor="gray.800">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber color="purple.500">
                      {formatCurrency(dashboardData?.overview?.revenue?.totalRevenue ?? 0)}
                    </StatNumber>
                    <StatHelpText>
                      {formatNumber(dashboardData?.overview?.revenue?.totalPayments ?? 0)} transactions
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="white" textColor="gray.800">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Engagement Score</StatLabel>
                    <StatNumber color="orange.500">
                      {Math.round(dashboardData?.overview?.engagement?.averageCompletionRate ?? 0)}%
                    </StatNumber>
                    <StatHelpText>
                      {Math.round(dashboardData?.overview?.engagement?.averageSessionDuration ?? 0)} min avg session
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          <Card bg="white" textColor="gray.800">
            <CardBody>
              <Tabs value={selectedView} onChange={setSelectedView}>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Revenue</Tab>
                  <Tab>Engagement</Tab>
                  <Tab>Insights</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {revenueData && (
                        <Card bg="white" textColor="gray.800">
                          <CardHeader>
                            <HStack>
                              <Icon as={FaChartLine} color="green.500" />
                              <Heading size="md">Revenue Trends</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between">
                                <Text fontWeight="bold">Daily Revenue</Text>
                                <Badge colorScheme="green">
                                  {formatCurrency(revenueData?.summary?.totalRevenue ?? 0)}
                                </Badge>
                              </HStack>
                              <Box h="200px" bg="gray.50" borderRadius="md" p={4}>
                                <Text color="gray.500" textAlign="center">
                                  Chart visualization would go here
                                </Text>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>
                      )}

                      {engagementData && (
                        <Card bg="white" textColor="gray.800">
                          <CardHeader>
                            <HStack>
                              <Icon as={FaUsers} color="blue.500" />
                              <Heading size="md">User Activity</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              <VStack align="start" spacing={3}>
                                <Text fontWeight="bold">Session Metrics</Text>
                                <HStack justify="space-between" w="full">
                                  <Text>Average Session Duration</Text>
                                  <Text fontWeight="bold">
                                    {Math.round(engagementData?.userEngagement?.averageSessionDuration ?? 0)} min
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>Total Sessions</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.userEngagement?.totalSessions ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>Completion Rate</Text>
                                  <Text fontWeight="bold">
                                    {Math.round(engagementData?.userEngagement?.averageCompletionRate ?? 0)}%
                                  </Text>
                                </HStack>
                              </VStack>
                              <VStack align="start" spacing={3}>
                                <Text fontWeight="bold">Feature Usage</Text>
                                <HStack justify="space-between" w="full">
                                  <Text>Live Classes</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.featureUsage?.liveClasses ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>Quizzes Taken</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.featureUsage?.quizzes ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>Forum Posts</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.socialEngagement?.forumPosts ?? 0)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {revenueData && (
                        <>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            <Card bg="white" textColor="gray.800">
                              <CardBody textAlign="center">
                                <Stat>
                                  <StatLabel>Total Revenue</StatLabel>
                                  <StatNumber color="green.500">
                                    {formatCurrency(revenueData?.summary?.totalRevenue ?? 0)}
                                  </StatNumber>
                                  <StatHelpText>
                                    {formatNumber(revenueData?.summary?.totalTransactions ?? 0)} transactions
                                  </StatHelpText>
                                </Stat>
                              </CardBody>
                            </Card>
                            <Card bg="white" textColor="gray.800">
                              <CardBody textAlign="center">
                                <Stat>
                                  <StatLabel>Average Order Value</StatLabel>
                                  <StatNumber color="blue.500">
                                    {formatCurrency(revenueData?.summary?.averageOrderValue ?? 0)}
                                  </StatNumber>
                                  <StatHelpText>Per transaction</StatHelpText>
                                </Stat>
                              </CardBody>
                            </Card>
                            <Card bg="white" textColor="gray.800">
                              <CardBody textAlign="center">
                                <Stat>
                                  <StatLabel>Monthly Recurring Revenue</StatLabel>
                                  <StatNumber color="purple.500">
                                    {formatCurrency(revenueData?.mrr ?? 0)}
                                  </StatNumber>
                                  <StatHelpText>Active subscriptions</StatHelpText>
                                </Stat>
                              </CardBody>
                            </Card>
                          </SimpleGrid>

                          <Card bg="white" textColor="gray.800">
                            <CardHeader>
                              <Heading size="md">Revenue by Payment Method</Heading>
                            </CardHeader>
                            <CardBody>
                              <Table variant="simple">
                                <Thead>
                                  <Tr>
                                    <Th>Payment Method</Th>
                                    <Th>Revenue</Th>
                                    <Th>Transactions</Th>
                                    <Th>Percentage</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {revenueData?.revenueByMethod?.map((method, index) => (
                                    <Tr key={index}>
                                      <Td>{method._id}</Td>
                                      <Td>{formatCurrency(method.revenue)}</Td>
                                      <Td>{formatNumber(method.count)}</Td>
                                      <Td>
                                        {Math.round(
                                          revenueData?.summary?.totalRevenue
                                            ? (method.revenue / revenueData.summary.totalRevenue) * 100
                                            : 0
                                        )}%
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        </>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {engagementData && (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg="white" textColor="gray.800">
                            <CardHeader>
                              <Heading size="md">User Engagement</Heading>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text>Average Session Duration</Text>
                                  <Text fontWeight="bold">
                                    {Math.round(engagementData?.userEngagement?.averageSessionDuration ?? 0)} min
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Pages per Session</Text>
                                  <Text fontWeight="bold">
                                    {Math.round(engagementData?.userEngagement?.averagePagesPerSession ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Total Page Views</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.userEngagement?.totalPageViews ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Completion Rate</Text>
                                  <Text fontWeight="bold">
                                    {Math.round(engagementData?.userEngagement?.averageCompletionRate ?? 0)}%
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg="white" textColor="gray.800">
                            <CardHeader>
                              <Heading size="md">Social Engagement</Heading>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text>Forum Posts</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.socialEngagement?.forumPosts ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Forum Replies</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.socialEngagement?.forumReplies ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Live Class Participations</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.socialEngagement?.liveClassParticipations ?? 0)}
                                  </Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Peer Reviews</Text>
                                  <Text fontWeight="bold">
                                    {formatNumber(engagementData?.socialEngagement?.peerReviews ?? 0)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Insights & Recommendations</Heading>
                      
                      {insights.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {insights.map((insight, index) => (
                            <Card key={index}>
                              <CardBody>
                                <VStack align="start" spacing={3}>
                                  <HStack justify="space-between" w="full">
                                    <Badge colorScheme={insight.insights.severity === 'critical' ? 'red' : 
                                                       insight.insights.severity === 'high' ? 'orange' : 
                                                       insight.insights.severity === 'medium' ? 'yellow' : 'green'}>
                                      {insight.insights.severity}
                                    </Badge>
                                    <Badge colorScheme="blue">
                                      {insight.insights.type}
                                    </Badge>
                                  </HStack>
                                  <Text fontWeight="bold">{insight.insights.title}</Text>
                                  <Text color="gray.600" fontSize="sm">
                                    {insight.insights.description}
                                  </Text>
                                  {insight.insights.recommendation && (
                                    <Alert status="info" size="sm">
                                      <AlertIcon />
                                      <Text fontSize="sm">{insight.insights.recommendation}</Text>
                                    </Alert>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Text>No insights available for the selected period.</Text>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Analytics Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Report Type</FormLabel>
                <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="user">User Analytics</option>
                  <option value="course">Course Analytics</option>
                  <option value="revenue">Revenue Analytics</option>
                  <option value="engagement">Engagement Analytics</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Time Period</FormLabel>
                <Select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </Select>
              </FormControl>

              <HStack spacing={4}>
                <Button colorScheme="teal" onClick={generateReport} flex={1}>
                  Generate Report
                </Button>
                <Button variant="outline" onClick={() => setIsReportModalOpen(false)} flex={1}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AnalyticsDashboard; 