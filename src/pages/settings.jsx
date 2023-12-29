import { Route, Routes } from "react-router-dom"
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useResolvedPath } from 'react-router-dom'
import {
  Heading, useColorMode, useToast, Grid, Box, VStack
  , Card, CardHeader, SimpleGrid, Stack, Spinner, useColorModeValue, Avatar, Text, CardBody,
  Button,
} from '@chakra-ui/react'
import NavBar from '../components/navbar.jsx';
import Trip from '../components/Trip.jsx'
import HomepageRecommendation from '../components/homepageRecommendation.jsx'
import { useAuth0 } from "@auth0/auth0-react";

const config = require('../config.js');

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0();
  console.log(user)
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
      })
    })
      .then(res => console.log(res))
  }
  return (
    <Box>
      <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          {user &&
          <VStack spacing={8}>
            <Text>
              {
                user ? `User ID: ${user.sub}` : 'Welcome'
              }
            </Text>
            <Button onClick={() => {
              resetProfile()
            }}>
              Reset Profile
            </Button>
          </VStack>
}
        </Grid>
      </Box>
    </Box>


  )
}
