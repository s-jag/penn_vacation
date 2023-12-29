import React from 'react';
import { Route, Routes } from "react-router-dom"
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Heading
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import Homepage from './pages/homepage.jsx';
import Cart from './pages/cart.jsx'
import FindTrip from './pages/findtrip.jsx'
import GroupTrip from './pages/grouptrip.jsx'
import SettingsPage from './pages/settings.jsx';
import PennBreaksPage from './pages/pennbreaks.jsx'

function App() {
  return (
  <Routes>
    <Route path="/" element={<Homepage />}></Route>
    <Route path="/findtrip" element={<FindTrip />}></Route>
    <Route path="/grouptrip" element={<GroupTrip />}></Route>
    <Route path="/cart" element={<Cart />}></Route>
    <Route path="/settings" element={<SettingsPage />}></Route>
    <Route path="/pennbreaks" element={<PennBreaksPage />}></Route>
  </Routes>);
}

export default App;
