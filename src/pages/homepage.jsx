// import { Route, Routes } from "react-router-dom"
// import React, { useEffect, useRef, useState } from 'react'
// import { Link, useNavigate, useResolvedPath } from 'react-router-dom'
// import {
//   Heading, useColorMode, useToast, Grid, Box, VStack, Button
//   , Card, CardHeader, SimpleGrid, Stack, Spinner, useColorModeValue, Avatar, Text, CardBody, Flex, HStack
// } from '@chakra-ui/react'
import NavBar from '../components/navbar.jsx';
// import Trip from '../components/Trip.jsx'
// import tripCard from '../components/tripCard.jsx'
import HomepageRecommendation from '../components/homepageRecommendation.jsx'

// export default function HomePage() {
//   const toast = useToast();
//   const navigate = useNavigate();

//   return (
//     <Box >
//       <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
//       <Box
//         maxW={{
//           base: '3xl',
//           lg: '7xl',
//         }}
//         mx="auto"
//         px={{
//           base: '4',
//           md: '8',
//           lg: '12',
//         }}
//         py={{
//           base: '6',
//           md: '8',
//           lg: '12',
//         }}
//         marginTop='12'
//         bg={'gray.50'}
//         padding='20px'
//       >
//         <Stack
//           direction={{
//             base: 'column',
//             lg: 'row',
//           }}
//           align={{
//             lg: 'flex-start',
//           }}
//           spacing={{
//             base: '8',
//             md: '16',
//           }}
//         ><Heading fontSize="3xl" fontWeight="extrabold">
//         Check out your trip of the day: 
//       </Heading>
//           <Stack
//             spacing={{
//               base: '8',
//               md: '10',
//             }}
//             flex="2"
//           >
//             <tripCard/>
//             {/* <HomepageRecommendation /> */}
//           </Stack>
//           <Flex direction="column" align="center" flex="1">
//             <HStack mt="6" fontWeight="semibold">
//               <Button color='teal.500' variant="outline" onClick={() => { navigate('findtrip') }}>
//                 Find More Trips!</Button>
//             </HStack>
//           </Flex>
//         </Stack>
//       </Box>
//     </Box>
//   )
// }

import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Container,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from '@chakra-ui/react';

function HomePage() {
  // Disclosures for managing the open state of each modal
  const { isOpen: isCountdownOpen, onOpen: onCountdownOpen, onClose: onCountdownClose } = useDisclosure();
  const { isOpen: isFindTripsOpen, onOpen: onFindTripsOpen, onClose: onFindTripsClose } = useDisclosure();
  const { isOpen: isGroupTripsOpen, onOpen: onGroupTripsOpen, onClose: onGroupTripsClose } = useDisclosure();

  return (
    <Box>
    <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
    <Container maxW="container.xl" p={4}>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6}>
      <HomepageRecommendation />
      </Box>

      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={10} mt={10}>
        {/* Countdown Modal Trigger */}
        {/* <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} role="button" onClick={onCountdownOpen} _hover={{ bg: "gray.200" }}>
          <Text fontSize="xl" color="blue.600">Countdown</Text>
        </Box> */}

        {/* Explain Find Trips Modal Trigger */}
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} role="button" onClick={onFindTripsOpen} _hover={{ bg: "gray.200" }}>
          <Text fontSize="xl" color="blue.600">What is Find Trips?</Text>
        </Box>

        {/* Explain Group Trips Modal Trigger */}
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} role="button" onClick={onGroupTripsOpen} _hover={{ bg: "gray.200" }}>
          <Text fontSize="xl" color="blue.600">What is Group Trips?</Text>
        </Box>
      </SimpleGrid>

      {/* Countdown Modal */}
      <Modal isOpen={isCountdownOpen} onClose={onCountdownClose}>
        <ModalOverlay />
        <ModalContent bg= "gray.100">
          <ModalHeader>Countdown</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Add your Countdown content here */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCountdownClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Explain Find Trips Modal */}
      <Modal isOpen={isFindTripsOpen} onClose={onFindTripsClose}>
        <ModalOverlay />
        <ModalContent bg= "gray.100">
          <ModalHeader>Explain Find Trips</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          The "Find Trips" feature allows you to discover exciting travel opportunities based on your preferences.
        You can set various criteria such as your budget, temperature range, starting location, and travel dates.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onFindTripsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Explain Group Trips Modal */}
      <Modal isOpen={isGroupTripsOpen} onClose={onGroupTripsClose} >
        <ModalOverlay />
        <ModalContent bg= "gray.100">
          <ModalHeader>Explain Group Trips</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          The "Group Trips" feature enables you to plan and coordinate travel experiences with friends, family, or fellow adventurers.
        Whether you're organizing a group vacation or a team-building retreat, this feature simplifies the process.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onGroupTripsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
    </Box>
  );
}

export default HomePage;
