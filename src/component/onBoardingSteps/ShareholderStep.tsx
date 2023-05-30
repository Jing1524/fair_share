import {
  Stack,
  useDisclosure,
  Text,
  StackDivider,
  Modal,
  ModalContent,
  Input,
  Select,
  Button,
  Badge,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { OnboardingContext } from '../../pages/Onboarding'
import React from 'react'
import { Shareholder } from '../../types'
import { Link, useNavigate } from 'react-router-dom'

export function ShareholdersStep() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { shareholders, companyName, dispatch } = useContext(OnboardingContext)
  const [newShareholder, setNewShareholder] = React.useState<Omit<Shareholder, 'id' | 'grants'>>({
    name: '',
    group: 'employee',
  })
  const navigate = useNavigate()
  type ShareholderGroup = 'investor' | 'founder' | 'employee'

  function submitNewShareholder(e: React.FormEvent) {
    e.preventDefault()
    dispatch({ type: 'addShareholder', payload: newShareholder })
    setNewShareholder({ name: '', group: 'employee' })
    onClose()
  }

  return (
    <Stack>
      <Text color="teal.400">
        {/* TODO: redirect to previous step if company name isn't there*/}
        {companyName ? (
          <>
            {' '}
            Who are <strong>{companyName}</strong>'s shareholders?
          </>
        ) : (
          <>
            {/* navigate function will invoke if no companyName  */}
            Redirecting to previous step...
            {navigate('/start/company')}
          </>
        )}
      </Text>
      <Stack divider={<StackDivider borderColor="teal-200" />}>
        {Object.values(shareholders).map((s, i) => (
          <Stack justify="space-between" direction="row" key={i}>
            <Text>{s.name}</Text>
            <Badge>{s.group}</Badge>
          </Stack>
        ))}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <Stack p="10" as="form" onSubmit={submitNewShareholder}>
              <Input
                value={newShareholder.name}
                placeholder="Shareholder Name"
                onChange={(e) => setNewShareholder((s) => ({ ...s, name: e.target.value }))}
              />
              {/* TODO: bad any */}
              <Select
                placeholder="Type of shareholder"
                value={newShareholder.group}
                onChange={(e) => {
                  console.log(e.target.value)
                  setNewShareholder((s) => ({
                    ...s,
                    group: e.target.value as ShareholderGroup, // type cast the shareholderGroup ?
                  }))
                }}
              >
                <option value="investor">Investor</option>
                <option value="founder">Founder</option>
                <option value="employee">Employee</option>
              </Select>
              <Button type="submit" colorScheme="teal">
                Create
              </Button>
            </Stack>
          </ModalContent>
        </Modal>
      </Stack>
      <Button colorScheme="teal" variant="outline" onClick={onOpen}>
        Add Shareholder
      </Button>
      <Button as={Link} to="/start/grants" colorScheme="teal">
        Next
      </Button>
    </Stack>
  )
}
