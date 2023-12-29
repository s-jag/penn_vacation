import { CloseButton, Flex, Link, Select, useColorModeValue } from '@chakra-ui/react'
import { PriceTag } from './PriceTag'
import { CartProductMeta } from './CartProductMeta'
const QuantitySelect = (props) => {
  return (
    <Select
      maxW="64px"
      aria-label="Select quantity"
      focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
      {...props}
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </Select>
  )
}

export const CartItem = (props) => {
  const {
    id,
    airbnb_city,
    airbnb_name,
    airbnb_night_price,
    airbnb_state,
    departing_from,
    departing_to,
    dest_temp,
    entry_id,
    origin_city,
    price,
    return_from,
    return_to,
    onDelete,
  } = props
  return (
    <Flex
      direction={{
        base: 'column',
        md: 'row',
      }}
      justify="space-between"
      align="center"
    >
      <CartProductMeta
        name={airbnb_city}
        description={airbnb_name}
        details={airbnb_name}
        image={`https://source.unsplash.com/random/?vacation,${airbnb_name}`}
      />

      {/* Desktop */}
      <Flex
        width="full"
        justify="space-between"
        display={{
          base: 'none',
          md: 'flex',
        }}
      >
        {/* <QuantitySelect
          value={quantity}
          onChange={(e) => {
            onChangeQuantity?.(+e.currentTarget.value)
          }}
        /> */}
        {/* <PriceTag price={price} currency={'dollars'} /> */}
        <CloseButton aria-label={`Delete ${airbnb_name} from cart`} onClick={onDelete} />
      </Flex>

      {/* Mobile */}
      <Flex
        mt="4"
        align="center"
        width="full"
        justify="space-between"
        display={{
          base: 'flex',
          md: 'none',
        }}
      >
        <Link fontSize="sm" textDecor="underline" onClick={onDelete}>
          Delete
        </Link>
        {/* <QuantitySelect
          value={quantity}
          onChange={(e) => {
            onChangeQuantity?.(+e.currentTarget.value)
          }}
        /> */}
        {/* <PriceTag price={price} currency={'dollars'} /> */}
      </Flex>
    </Flex>
  )
}