import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
  VStack,
  HStack,
  Container,
  Heading,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from '../components/navbar.jsx';
const config = require('../config.js');

const TripForm = ({ formIndex, formData, setFormData }) => {

  const { user, isAuthenticated } = useAuth0();
  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData };
    updatedFormData[formIndex] = { ...updatedFormData[formIndex], [field]: value };
    setFormData(updatedFormData);
  };

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
      <Heading size="lg" color="black" spacing = "10px">Friend {formIndex}</Heading>
      <FormControl >
        <FormLabel>Budget</FormLabel>
        <NumberInput value={formData[formIndex].budget} onChange={(value) => handleInputChange('budget', value)}>
          <NumberInputField placeholder="Enter your budget" />
        </NumberInput>
      </FormControl>

      <FormControl >
        <FormLabel>Minimum Temperature</FormLabel>
        <NumberInput value={formData[formIndex].tempMin} onChange={(value) => handleInputChange('tempMin', value)}>
          <NumberInputField placeholder="Enter minimum preferred temperature" />
        </NumberInput>
      </FormControl>

      <FormControl >
        <FormLabel>Maximum Temperature</FormLabel>
        <NumberInput value={formData[formIndex].tempMax} onChange={(value) => handleInputChange('tempMax', value)}>
          <NumberInputField placeholder="Enter maximum preferred temperature" />
        </NumberInput>
      </FormControl>
    </Box>
  );
};

const DateForm = ({ formIndex, formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData };
    updatedFormData[formIndex] = { ...updatedFormData[formIndex], [field]: value };
    setFormData(updatedFormData);
  };

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="lg" spacing = "20px">
     <FormControl isRequired>
        <FormLabel>Leave Date</FormLabel>
        <Input type="date" min="2022-01-01" max="2022-12-31" value={formData[formIndex].leaveDate} onChange={(event) => handleInputChange('leaveDate', event.target.value)} />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Return Date</FormLabel>
        <Input type="date" min="2022-01-01" max="2022-12-31" value={formData[formIndex].returnDate} onChange={(event) => handleInputChange('returnDate', event.target.value)} />
      </FormControl> 
    </Box>
  );
};

const GroupTripsPage = () => {
  const [itineraries, setItineraries] = useState([]);
  
  const toast = useToast();

  const initialFormData = {
    0: { leaveDate: '', returnDate: '' },
    1: { budget: '100000', tempMin: '0', tempMax: '100'},
    2: { budget: '100000', tempMin: '0', tempMax: '100'},
    3: { budget: '100000', tempMin: '0', tempMax: '100'},
    4: { budget: '100000', tempMin: '0', tempMax: '100'},
  };
  
  const [formData, setFormData] = useState(initialFormData);


  const Itinerary = ({ itinerary }) => {
    const { user, isAuthenticated } = useAuth0();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const handleAddToCart = async () => {
      const addToCartUrl = `${config.server_host}:${config.server_port}/cart`;
  
      try {
        const response = await fetch(addToCartUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.sub,
            origin_city: itinerary['Origin City'],
            departing_from: itinerary['Departing Flight - From'],
            departing_to: itinerary['Departing Flight - To'],
            dest_temp: itinerary['Destination Temperature'],
            airbnb_name: itinerary['Airbnb Name'],
            airbnb_city: itinerary['Airbnb City'],
            airbnb_state: itinerary['Airbnb State'],
            airbnb_night_price: itinerary['Airbnb Nightly Price'],
            return_from: itinerary['Returning Flight - From'],
            return_to: itinerary['Returning Flight - To'],
            price: itinerary.Cost,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        toast({
          title: 'Added to Cart',
          description: 'This itinerary has been added to your cart.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to add to cart: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
  
  
    return (
      <Box p={4} shadow="md" borderWidth="1px" borderRadius="md" onClick={onOpen} cursor="pointer">
        <Heading size="md" mb={2}>{itinerary['Airbnb City']}</Heading>
        <Text><strong>To Flight:</strong> {itinerary['Departing Flight - From']}</Text>
        <Text><strong>Stay:</strong> {itinerary['Airbnb City']}</Text>
        <Text><strong>From Flight:</strong> {itinerary['Returning Flight - From']}</Text>
        <Text><strong>Total Cost:</strong> ${itinerary.Cost}</Text>
        {isAuthenticated && <Button mt={4} colorScheme="blue" onClick={handleAddToCart}>
          Add to Cart
        </Button>}
  
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Itinerary Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text><strong>Origin City:</strong> {itinerary['Origin City']}</Text>
              <Text><strong>Origin State:</strong> {itinerary['Origin State']}</Text>
              <Text><strong>Departing Flight - From:</strong>{itinerary['Departing Flight - From']}</Text>
              <Text><strong>Departing Flight - To:</strong>{itinerary['Departing Flight - To']}</Text>
              <Text><strong>Destination Temperature:</strong> {itinerary['Destination Temperature']}</Text>
              <Text><strong>Airbnb Name:</strong> {itinerary['Airbnb Name']}</Text>
              <Text><strong>Airbnb City:</strong> {itinerary['Airbnb City']}</Text>
              <Text><strong>Airbnb State:</strong> {itinerary['Airbnb State']}</Text>
              <Text><strong>Airbnb Nightly Price:</strong> ${itinerary['Airbnb Nightly Price']}</Text>
              <Text><strong>Returning Flight - From:</strong> {itinerary['Returning Flight - From']}</Text>
              <Text><strong>Returning Flight - To:</strong> {itinerary['Returning Flight - To']}</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData);
    try {
      const response = await fetch(`${config.server_host}:${config.server_port}/find_group_itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItineraries(data);
      console.log(itineraries)
    } catch (error) {
      toast({
        title: 'Error fetching itineraries',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }

  };

  const handleSubmit1 = async (event) => {
    event.preventDefault();
    // Process formData for all four forms
    // Send data to backend or handle it as needed
  };

  return (
    <Box mb={10}>
    <Box position="relative" w="100%" zIndex={10000}><NavBar/></Box>
    <Container maxW="container.xl">
      <Heading as="h1" size="xl" textAlign="center" my={8}>Group Trips</Heading>
      <p>
        Here's how it works:
      </p>
      <ul>
        <li>Create a new group trip by specifying the trip's details, including the destination, dates, and activities.</li>
        <li>Invite participants to join your group trip by sharing a unique invitation link.</li>
        <li>Participants can view trip details, RSVP, and contribute to planning, such as suggesting activities or accommodations.</li>
        <li>Keep everyone in the loop with real-time updates and messages within the group trip dashboard.</li>
      </ul>
      <p>
        Enjoy a hassle-free experience when organizing memorable group adventures!
      </p>
      <form>
        <DateForm spacing={10} formIndex={0} formData={formData} setFormData={setFormData} />
        <SimpleGrid columns={2} spacing={10}>
          <TripForm formIndex={1} formData={formData} setFormData={setFormData} />
          <TripForm formIndex={2} formData={formData} setFormData={setFormData} />
          <TripForm formIndex={3} formData={formData} setFormData={setFormData} />
          <TripForm formIndex={4} formData={formData} setFormData={setFormData} />
        </SimpleGrid>

        <Box textAlign="center" mt={10}>
          <Button colorScheme="blue" type="submit" onClick={handleSubmit}>Find Group Trips (Budget)</Button>
          <text> or </text>
      <Button colorScheme="blue" type="submit" onClick={handleSubmit1}>Find Group Trips (Relevance)</Button>
        </Box>
      </form>
      <Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {itineraries.map((itinerary, index) => (
              <Itinerary key={index} itinerary={itinerary} />
            ))}
          </SimpleGrid>
        </Box>
    </Container>
    </Box>
  );
};

export default GroupTripsPage;
