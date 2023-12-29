import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { Link } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
import { config } from '../config';

export default function SongCard({ songId, handleClose }) {
  const [songData, setSongData] = useState({});
  const [albumData, setAlbumData] = useState({});

  const [barRadar, setBarRadar] = useState(true);

  useEffect(() => {
    // Fetch song data and album data here
    // You can use Chakra UI's fetch utility or any other method you prefer
  }, []);

  const chartData = [
    { name: 'Danceability', value: songData.danceability },
    { name: 'Energy', value: songData.energy },
    { name: 'Valence', value: songData.valence },
  ];

  const handleGraphChange = () => {
    setBarRadar(!barRadar);
  };

  return (
    <Modal isOpen={true} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>{songData.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <h2>
            Album:&nbsp;
            <Link to={`/albums/${albumData.album_id}`}>{albumData.title}</Link>
          </h2>
          <p>Duration: {formatDuration(songData.duration)}</p>
          <p>Tempo: {songData.tempo} bpm</p>
          <p>Key: {songData.key_mode}</p>
          <ButtonGroup>
            <Button disabled={barRadar} onClick={handleGraphChange}>
              Bar
            </Button>
            <Button disabled={!barRadar} onClick={handleGraphChange}>
              Radar
            </Button>
          </ButtonGroup>
          <Box mt={4}>
            {barRadar ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <Radar dataKey="value" fill="#8884d8" />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
