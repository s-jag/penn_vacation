'use client'

import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
interface Props {
  children: React.ReactNode
}


const Links = ['Penn Vacation Planner', 'Find a trip', 'Plan a group trip', 'Cart']

const urls = ['/', 'findtrip', 'grouptrip', 'cart']

const NavLink = (props: Props) => {
  const { children } = props
  const index = Links.indexOf(children)
  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={urls[index]}>
      {index === 0 ?
        <Text fontSize='lg' as="b">
          {children} </Text>
        : <Text fontSize='md'>
          {children}
        </Text>}
    </Box>
  )
}

export default function Simple() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, isAuthenticated, isLoading, loginWithPopup, logout } = useAuth0();
  const navigate = useNavigate();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>

          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            {isAuthenticated ?
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={user.picture}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem>Trips</MenuItem>
                  <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => logout()}>Log Out</MenuItem>
                </MenuList>
              </Menu>
              : <Button onClick={() => loginWithPopup()}>
                Log In</Button>}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  )
}