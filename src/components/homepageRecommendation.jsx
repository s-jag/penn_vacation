'use client'
import { useEffect, useState, } from 'react';
import Trip from '../components/Trip.jsx'
import {
    Box,
    Flex,
    Stack,
    VStack,
    Image,
    Text,
    Heading,
    Button,
    useDisclosure,
    Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  } from '@chakra-ui/react'

import {CartItem} from "../components/cartitem.jsx"
import { recommendedData } from '../sample data/_data.js'

const config = require('../config.js');


export default function Simple() {
  /*randomly generates a trip to display on the 
hompage, the random selection happens in this component need 
to add the functionalithy where it picks one randomly*/
const [itinerary, setitinerary] = useState([{
  origin_city: 'Philadelphia',
  origin_state: 'PA',
  departing_flight_from: 'PHL',
  departing_flight_to: 'LGB',
  destination_temperature: 14.2,
  airbnb_name: 'apartment',
  airbnb_city: 'Los Angeles',
  airbnb_state: 'CA',
  airbnb_nightly_price: 10,
  returning_flight_from: 'BUR',
  returning_flight_to: 'PHL',
  cost: 594
}]);
const { isOpen: isFeaturedTripOpen, onOpen: onFeaturedTripOpen, onClose: onFeaturedTripClose } = useDisclosure();

useEffect(() => {
  // Fetch request to get the trip of the day. Fetch runs asynchronously.
  // The .then() method is called when the fetch request is complete
  // and proceeds to convert the result to a JSON which is finally placed in state.
  fetch(`${config.server_host}:${config.server_port}/random`)
    .then(res => res.json())
    .then(resJson => setitinerary(resJson));


    console.log(itinerary)
}, []);
return (
  <Box >
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} borderColor="blue.500" 
             boxShadow="xl" role="button" _hover={{ bg: "gray.100" }} onClick={onFeaturedTripOpen}>
          <VStack spacing={4}>
            <Heading color="blue.600" size="md" >
              Trip of the Day
            </Heading>
            <Text fontSize="2xl" fontWeight="bold">
            {itinerary[0].airbnb_city}
            </Text>
            <Text fontSize="lg">
            ${itinerary[0].cost}
            </Text>
            <Box borderWidth="1px" borderRadius="lg" borderColor="blue.500" w="full" h="200px" object-fit= "cover">
            <Image
          src={`https://source.unsplash.com/random/?vacation,${itinerary[0].airbnb_city}`}
          alt={"city image"}
          draggable="false"
          loading="lazy"
          align="center"
          objectFit="cover" w="full" h="full"
        />
            </Box>
            <Button colorScheme="blue" onClick={onFeaturedTripOpen}>
              Learn More
            </Button>
          </VStack>
        </Box>



<Modal isOpen={isFeaturedTripOpen} onClose={onFeaturedTripClose}>
          <ModalOverlay />
          <ModalContent bg= "gray.200">
            <ModalHeader>Featured Trip</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Text><strong>Origin City:</strong> {itinerary[0].origin_city}</Text>
            <Text><strong>Origin State:</strong> {itinerary[0].origin_state}</Text>
            <Text><strong>Departing Flight - From:</strong>{itinerary[0].departing_flight_from}</Text>
            <Text><strong>Departing Flight - To:</strong>{itinerary[0].departing_flight_to}</Text>
            <Text><strong>Destination Temperature:</strong> {itinerary[0].destination_temperature}</Text>
            <Text><strong>Airbnb Name:</strong> {itinerary[0].airbnb_name}</Text>
            <Text><strong>Airbnb City:</strong> {itinerary[0].airbnb_city}</Text>
            <Text><strong>Airbnb State:</strong> {itinerary[0].airbnb_state}</Text>
            <Text><strong>Airbnb Nightly Price:</strong> ${itinerary[0].airbnb_nightly_price}</Text>
            <Text><strong>Returning Flight - From:</strong> {itinerary[0].returning_flight_from}</Text>
            <Text><strong>Returning Flight - To:</strong> {itinerary[0].returning_flight_to}</Text>
            <Text><strong>Cost:</strong> {itinerary[0].cost}</Text>
          </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onFeaturedTripClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>


</Box>
);
}