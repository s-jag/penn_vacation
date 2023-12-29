import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  Text,
  Link,
} from '@chakra-ui/react';

// You can replace the placeholders with actual data
const sampleTripData = {
  destination: 'Sample Destination',
  toFlight: 'Sample To Flight',
  airbnb: 'Sample Airbnb',
  fromFlight: 'Sample From Flight',
  totalCost: 1000,
};

export default function TripCard({ tripId }) {
  const [tripData, setTripData] = useState(sampleTripData);
  const [barRadar, setBarRadar] = useState(true);

  // You can fetch trip data here using the tripId

  const chartData = [
    { name: 'Feature 1', value: 0.8 },
    { name: 'Feature 2', value: 0.6 },
    { name: 'Feature 3', value: 0.7 },
  ];

  const handleGraphChange = () => {
    setBarRadar(!barRadar);
  };

  return (
    <Box p={4} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={2}>
        {tripData.destination}
      </Heading>
      <Text>
        <strong>To Flight:</strong> {tripData.toFlight}
      </Text>
      <Text>
        <strong>Stay:</strong> {tripData.airbnb}
      </Text>
      <Text>
        <strong>From Flight:</strong> {tripData.fromFlight}
      </Text>
      <Text>
        <strong>Total Cost:</strong> ${tripData.totalCost}
      </Text>
      <ButtonGroup mt={4}>
        <Button colorScheme="blue" onClick={handleGraphChange}>
          Bar
        </Button>
        <Button colorScheme="blue" onClick={handleGraphChange}>
          Radar
        </Button>
      </ButtonGroup>

      <Modal onClose={() => {}} isOpen={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{tripData.destination} Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              <strong>Destination:</strong> {tripData.destination}
            </Text>
            <Text>
              <strong>To Flight:</strong> {tripData.toFlight}
            </Text>
            <Text>
              <strong>Stay:</strong> {tripData.airbnb}
            </Text>
            <Text>
              <strong>From Flight:</strong> {tripData.fromFlight}
            </Text>
            <Text>
              <strong>Total Cost:</strong> ${tripData.totalCost}
            </Text>
            <Box mt={4}>
              {barRadar ? (
                // Replace with BarChart component using chartData
                <div>Bar Chart</div>
              ) : (
                // Replace with RadarChart component using chartData
                <div>Radar Chart</div>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Link color="blue.500" onClick={() => {}}>
              More Details
            </Link>
            <Button colorScheme="blue" onClick={() => {}}>
              Add to Cart
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
