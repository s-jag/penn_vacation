import React, { useState, useEffect } from 'react';
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
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from '../components/navbar.jsx';
import { Itinerary } from '../components/itinerary.jsx';
const config = require('../config.js');

const TripFinderPage = () => {
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [budget, setBudget] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [itineraries, setItineraries] = useState([]);
  const toast = useToast();

  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!user) {
      return;
    }
    const resetProfile = () => {
      fetch(`${config.server_host}:${config.server_port}/user_preferences/${user.sub}`, {
        method: 'PUT', headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({
          budget: 100,
          temp_min: 0,
          temp_max: 100,
          city: 'Philadelphia',
          state: 'PA',
          leave_date: '2022-08-01',
          return_date: '2022-08-03',
        })})}
    const fetchPrefs = async () => {
      try {
        console.log(`${config.server_host}:${config.server_port}/user_preferences/${user.sub}`);
        await fetch(`${config.server_host}:${config.server_port}/user_preferences/${user.sub}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => {
          const j = res.json()
          if (res.status === 404 || j.length === 0) {
            resetProfile()
            return [{ temp_min: 0, temp_max: 100, budget: 100, city: 'Philadelphia', state: 'PA', leave_date: '2022-08-01', return_date: '2021-08-03' }]
          }
          return j
        }).then(data => {
          setTempMin(data[0].temp_min)
          setTempMax(data[0].temp_max)
          setBudget(data[0].budget)
          setCity(data[0].city)
          setState(data[0].state)
          setLeaveDate(data[0].leave_date.toString().split('T')[0])
          setReturnDate(data[0].return_date.toString().split('T')[0])
        }
        );
      } catch (error) {
        toast({
          title: "Error fetching preferences",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };

    fetchPrefs();
  }, [user, toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = {
      temp_min: tempMin,
      temp_max: tempMax,
      budget: budget,
      city: city,
      state: state,
      leave_date: leaveDate,
      return_date: returnDate,
    };

    try {
      console.log(`${config.server_host}:${config.server_port}/find_featured_itinerary?`
        + new URLSearchParams(formData).toString())
      const response = await fetch(`${config.server_host}:${config.server_port}/find_featured_itinerary?`
        + new URLSearchParams(formData).toString(), {
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
      setItineraries(data);  // Assuming you have a state variable 'itineraries' to store the response
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
    const formData = {
      temp_min: tempMin,
      temp_max: tempMax,
      budget: budget,
      city: city,
      state: state,
      leave_date: leaveDate,
      return_date: returnDate,
    };

    try {
      console.log(`${config.server_host}:${config.server_port}/find_itinerary?`
        + new URLSearchParams(formData).toString())
      const response = await fetch(`${config.server_host}:${config.server_port}/find_itinerary?`
        + new URLSearchParams(formData).toString(), {
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

  const savePreferences = async (event) => {
    event.preventDefault();

    console.log(user.sub)

    try {
      const response = fetch(`${config.server_host}:${config.server_port}/user_preferences/${user.sub}`, {
        method: 'PUT', headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({
          budget: budget,
          temp_min: tempMin,
          temp_max: tempMax,
          city: city,
          state: state,
          leave_date: leaveDate,
          return_date: returnDate,
        })
      })
    } catch (error) {
      toast({
        title: 'Error updating preferences',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };



  return (
    <Box>
      <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
      <Container maxW="container.lg">
        <Heading as="h1" size="xl" textAlign="center" my={8}>Trip Finder</Heading>
        <p>
          Once you've entered your preferences and clicked the "Find Trips" button, our system will search for
          itineraries that match your criteria. You'll receive a list of travel options, including destination details,
          flight information, accommodation, and total cost.
        </p>
        <Box as="form" mb={10}>
          <Stack spacing={4}>
            {/* Budget Input */}
            <FormControl isRequired>
              <FormLabel htmlFor="budget">Budget</FormLabel>
              <NumberInput value={budget} min={0} max={10000} onChange={(value) => setBudget(value)}>
                <NumberInputField id="budget" placeholder="Enter your budget" />
              </NumberInput>
            </FormControl>

            {/* Temperature Range Inputs */}
            <FormControl isRequired>
              <FormLabel htmlFor="tempMin">Minimum Temperature</FormLabel>
              <NumberInput value={tempMin} min={-20} max={50} onChange={(value) => setTempMin(value)}>
                <NumberInputField id="tempMin" placeholder="Minimum Temperature" />
              </NumberInput>
            </FormControl>

            <FormControl isRequired isInvalid={tempMax < tempMin}>
              <FormLabel htmlFor="tempMax">Maximum Temperature</FormLabel>
              <NumberInput value={tempMax} min={0} max={80} onChange={(value) => setTempMax(value)}>
                <NumberInputField id="tempMax" placeholder="Maximum Temperature" />
              </NumberInput>
              <FormErrorMessage>Maximum temperature must be greater than minimum temperature.</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="city">Starting City</FormLabel>
              <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            </FormControl>

            {/* Coordinates Inputs */}
            <FormControl isRequired>
              <FormLabel htmlFor="state">Starting State</FormLabel>
              <Input id="state" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            </FormControl>

            {/* Dates Inputs */}
            <FormControl isRequired>
              <FormLabel htmlFor="leaveDate">Leave Date</FormLabel>
              <Input type="date" min="2022-01-01" max="2022-12-31" id="leaveDate" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
            </FormControl>

            <FormControl isRequired isInvalid={returnDate < leaveDate}>
              <FormLabel htmlFor="returnDate">Return Date</FormLabel>
              <Input type="date" min="2022-01-01" max="2022-12-31" id="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              <FormErrorMessage>Return date must be after leave date.</FormErrorMessage>
            </FormControl>

            <Button colorScheme="blue" type="submit" onClick={handleSubmit}>Find Trips (Sort by-- Featured)</Button>
            <Button colorScheme="blue" type="submit" onClick={handleSubmit1}>Find Trips (Sort by-- Cost)</Button>
            {isAuthenticated && <Button colorScheme="green" type="submit" onClick={savePreferences}>Save Preferences</Button>}
          </Stack>
        </Box>
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

export default TripFinderPage;