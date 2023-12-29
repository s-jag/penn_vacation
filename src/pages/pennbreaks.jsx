import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField, useToast
} from '@chakra-ui/react';
import NavBar from '../components/navbar.jsx';
import { Itinerary } from '../components/itinerary.jsx';

const config = require('../config.js');

function PennBreaks() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeBreak, setActiveBreak] = React.useState(0);
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [budget, setBudget] = useState('');
  const [itineraries, setItineraries] = useState(null);
  const toast = useToast();
  const handleBreakClick = (breakName) => {
    setActiveBreak(breakName);
    onOpen();
  };

  const handleSubmit = async function (event, leaveDate, returnDate) {
    // event.preventDefault();
    const formData = {
      temp_min: tempMin,
      temp_max: tempMax,
      budget: budget,
      city: 'Philadelphia',
      state: 'PA',
      leave_date: leaveDate,
      return_date: returnDate,
    };
    if (tempMin === '' || tempMax === '' || budget === '') {
      return;
    }

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
      console.log(data);
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

  const breaks = [
    {
      id: 0,
      name: 'Fall Break',
      leave: '2021-10-15',
      return: '2021-10-17',
    },
    {
      id: 1,
      name: 'Thanksgiving Break',
      leave: '2021-11-24',
      return: '2021-11-28',
    },
    {
      id: 2,
      name: 'Spring Break',
      leave: '2022-03-05',
      return: '2022-03-13',
    },
    {
      id: 3,
      name: 'Winter Break',
      leave: '2021-12-20',
      return: '2022-01-17',
    }
  ]

  return (
    <Box>
      <Box position="relative" w="100%" zIndex={10000}><NavBar/></Box>
      <SimpleGrid columns={2} spacing={10} p={10}>
        {breaks.map((b) => (
          <Box
            p={6}
            borderRadius="md"
            borderWidth="1px"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
            onClick={() => handleBreakClick(b.id)}
          >
            <Heading size="md" textAlign="center">{b.name}</Heading>
          </Box>
        ))}
      </SimpleGrid>

      {/* Break Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{breaks[activeBreak].name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
            <FormLabel htmlFor="budget">Budget</FormLabel>
        <NumberInput value={budget} onChange={(value) => setBudget(value)}>
          <NumberInputField id="budget" placeholder="Enter your budget" />
        </NumberInput>
      </FormControl>

      {/* Temperature Range Inputs */}
      <FormControl isRequired>
        <FormLabel htmlFor="tempMin">Minimum Temperature</FormLabel>
        <NumberInput value={tempMin} onChange={(value) => setTempMin(value)}>
          <NumberInputField id="tempMin" placeholder="Minimum Temperature" />
        </NumberInput>
      </FormControl>

      <FormControl isRequired>
        <FormLabel htmlFor="tempMax">Maximum Temperature</FormLabel>
        <NumberInput value={tempMax} onChange={(value) => setTempMax(value)}>
          <NumberInputField id="tempMax" placeholder="Maximum Temperature" />
        </NumberInput>
      </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="teal" type="submit" onClick={(e)=>handleSubmit(e, breaks[activeBreak].leave, breaks[activeBreak].return)}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {itineraries && 
        itineraries.map((itinerary) => (
          <Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {itineraries.map((itinerary, index) => (
              <Itinerary key={index} itinerary={itinerary} />
            ))}
          </SimpleGrid>
        </Box>
        ))
      }
    </Box>
  );
}

export default PennBreaks;
