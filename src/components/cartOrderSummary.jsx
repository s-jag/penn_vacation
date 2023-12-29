import {
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react'
import { FaArrowRight } from 'react-icons/fa'
import { formatPrice } from './PriceTag'
const OrderSummaryItem = (props) => {
  const { label, value, children } = props
  return (
    <Flex justify="space-between" fontSize="sm">
      <Text fontWeight="medium" color={mode('gray.600', 'gray.400')}>
        {label}
      </Text>
      {value ? <Text fontWeight="medium">{value}</Text> : children}
    </Flex>
  )
}

export const CartOrderSummary = (props) => {
  return (
    <Stack spacing="8" borderWidth="1px" rounded="lg" padding="8" width="full">
      <Heading size="md">Summary</Heading>

      <Stack spacing="6">
        <OrderSummaryItem label="Airbnb Subtotal (per night)" value={formatPrice(props.airbnb_price)} />
        <Flex justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">
            Total
          </Text>
          <Text fontSize="xl" fontWeight="extrabold">
            {formatPrice(props.total_price)}
          </Text>
        </Flex>
      </Stack>
      <Button colorScheme="blue" size="lg" fontSize="md" rightIcon={<FaArrowRight />}>
        Checkout
      </Button>
    </Stack>
  )
}