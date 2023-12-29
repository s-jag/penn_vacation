import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDisclosure } from '@chakra-ui/react';
import { useToast, Button, Text, Modal, ModalBody, Box, Heading, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalFooter } from '@chakra-ui/react';

const config = require('../config.js');

export const Itinerary = ({ itinerary }) => {
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
