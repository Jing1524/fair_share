import React from 'react'
import { Link } from 'react-router-dom'
import { Text, Heading, Stack, Button } from '@chakra-ui/react'
import { ReactComponent as HoldDoc } from '../assets/hold-doc.svg'

export function Home() {
  return (
    <Stack direction="column" alignItems="center" spacing="10">
      <HoldDoc width="50%" height="auto" />
      <Heading size="4xl" bgGradient="linear(to-br, teal.400, teal.100)" bgClip="text">
        Fair Share
      </Heading>
      {/* set fontWeight to normla to make the text readable */}
      <Text fontSize="2xl" color="teal.600" align="center" fontWeight="normal">
        We make understanding equity easy–so everyone is on equal footing
      </Text>
      {/* center text, more visually pleasing */}
      <Text fontSize="md" color="teal.600" textAlign="center">
        Empower your employees and investors to understand and manage their equity all in one place, using the worlds{' '}
        <strong>first</strong> AI powered 🤖 equity management platform.
      </Text>
      <Stack direction="column">
        <Button as={Link} to="/start" colorScheme="teal">
          Get Started
        </Button>
        {/* Minor styling updates to give user clearer direction */}
        <Stack direction="row" alignItems="center">
          <Text fontSize="md" color="teal.600">
            Already have an account?
          </Text>
          <Button as={Link} to="/signin" colorScheme="teal" variant="ghost">
            Sign In
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
