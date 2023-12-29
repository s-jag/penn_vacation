import { Route, Routes } from "react-router-dom"
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useResolvedPath } from 'react-router-dom'
import {
  Heading, useColorMode, useToast, Grid, Box, VStack, Flex, HStack
  , Stack, useColorModeValue, Text,
} from '@chakra-ui/react'
import { useAuth0 } from "@auth0/auth0-react"
import NavBar from '../components/navbar.jsx';
import { CartOrderSummary } from '../components/cartOrderSummary.jsx'
import { CartItem } from "../components/cartitem.jsx"
import { cartData } from '../sample data/_data.js'
const config = require('../config.js');

export default function Cart() {
  const toast = useToast();
  const { user, isAuthenticated } = useAuth0();
  const [cartItems, setCartItems] = useState([]);
  console.log(cartItems[0])
  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchCart = async () => {
      try {
        await fetch(`${config.server_host}:${config.server_port}/cart?user_id=${user.sub}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => res.json()).then(data => setCartItems(data));
      } catch (error) {
        toast({
          title: "Error fetching cart items",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };

    fetchCart();
  }, [user, toast]);

  const handleDelete = async (itemId) => {
    try {
      console.log(`${config.server_host}:${config.server_port}/cart/${itemId}`)
      await fetch(`${config.server_host}:${config.server_port}/cart/${itemId}`, { method: 'DELETE' });
      setCartItems(currentItems => currentItems.filter(i => i.entry_id !== itemId));
      toast({
        title: "Item removed",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return (
      <Box>
        <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
        Not logged in.
      </Box>
    )
  }

  return (
    <Box>
      <Box position="relative" w="100%" zIndex={10000}><NavBar /></Box>
      <Box
        maxW={{
          base: '3xl',
          lg: '7xl',
        }}
        mx="auto"
        px={{
          base: '4',
          md: '8',
          lg: '12',
        }}
        py={{
          base: '6',
          md: '8',
          lg: '12',
        }}
      >
        <Stack
          direction={{
            base: 'column',
            lg: 'row',
          }}
          align={{
            lg: 'flex-start',
          }}
          spacing={{
            base: '8',
            md: '16',
          }}
        >
          <Stack
            spacing={{
              base: '8',
              md: '10',
            }}
            flex="2"
          >
            <Heading fontSize="2xl" fontWeight="extrabold">
              My Trips ({cartItems.length} items)
            </Heading>

            <Stack spacing="6">
              {cartItems.map((i) => (
                <CartItem key={i.entry_id} {...i} onDelete={()=>handleDelete(i.entry_id)} />
              ))}
            </Stack>
          </Stack>

          <Flex direction="column" align="center" flex="1">
            <CartOrderSummary airbnb_price={
              cartItems.reduce((total, item) => total + item.airbnb_night_price, 0)
            } total_price= {
              cartItems.reduce((total, item) => total + item.price, 0)
            }/>
            <HStack mt="6" fontWeight="semibold">
              <Link color='teal.500' href='findtrip'>Or Find More Trips</Link>
            </HStack>
          </Flex>
        </Stack>
      </Box>
    </Box>

  )
}
