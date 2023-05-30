import { useContext } from 'react'
import { OnboardingContext } from '../../pages/Onboarding'
import { Navigate, useParams, Link } from 'react-router-dom'
import {
  Stack,
  useDisclosure,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Modal,
  ModalContent,
  FormControl,
  Input,
  Select,
} from '@chakra-ui/react'
import React from 'react'
import { Grant } from '../../types'

export function ShareholderGrantsStep() {
  const { shareholders, grants, shareValues, dispatch } = useContext(OnboardingContext)
  const { shareholderID = '' } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const shareholder = shareholders[parseInt(shareholderID, 10)]
  const [draftGrant, setDraftGrant] = React.useState<Omit<Grant, 'id'>>({
    name: '',
    amount: 0,
    issued: '',
    type: 'common',
  })

  const [valuePerShare, setValuePerShare] = React.useState<number>(shareValues[draftGrant.type])

  if (!shareholder) {
    return <Navigate to="/start/shareholders" replace={true} />
  }
  const nextLink = !shareholders[shareholder.id + 1] ? `../done` : `../../grants/${shareholder.id + 1}`

  function submitGrant(e: React.FormEvent) {
    e.preventDefault()

    // Dispatch action to update the shareValues separately
    dispatch({
      type: 'updateShareValue',
      payload: {
        shareType: draftGrant.type,
        value: valuePerShare,
      },
    })

    dispatch({
      type: 'addGrant',
      payload: {
        shareholderID: parseInt(shareholderID, 10),
        grant: draftGrant,
      },
    })
    onClose()
    setDraftGrant({ name: '', amount: 0, issued: '', type: 'common' })
  }

  return (
    <Stack>
      <Text color="teal-400">
        What grants does <strong>{shareholder.name}</strong> have?
      </Text>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Occasion</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {shareholder.grants.map((gid) => (
            <Tr key={gid}>
              <Td>{grants[gid].name}</Td>
              <Td>{grants[gid].amount}</Td>
              <Td>{grants[gid].issued}</Td>
            </Tr>
          ))}
          {shareholder.grants.length === 0 && (
            <Tr>
              <Td colSpan={3} textAlign="center">
                No grants to show for <strong>{shareholder.name}</strong>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      <Button variant="outline" onClick={onOpen}>
        Add Grant
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <Stack p="10" as="form" onSubmit={submitGrant}>
            <Text>
              A <strong>Grant</strong> is any occasion where new shares are issued to a shareholder.
            </Text>

            <FormControl>
              <Input
                variant="flushed"
                placeholder="Name"
                data-testid="grant-name"
                value={draftGrant.name}
                onChange={(e) => setDraftGrant((g) => ({ ...g, name: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <Input
                variant="flushed"
                placeholder="Shares"
                data-testid="grant-amount"
                value={draftGrant.amount || ''}
                onChange={(e) =>
                  setDraftGrant((g) => ({
                    ...g,
                    amount: parseInt(e.target.value, 3),
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <Input
                variant="flushed"
                type="date"
                data-testid="grant-issued"
                value={draftGrant.issued}
                onChange={(e) => setDraftGrant((g) => ({ ...g, issued: e.target.value }))}
              />
            </FormControl>
            {/* give user options to chose share type */}
            <Stack direction="row">
              <FormControl>
                <Select
                  variant="flushed"
                  placeholder="Grant Type"
                  value={draftGrant.type}
                  onChange={(e) =>
                    // @ts-ignore
                    setDraftGrant((g) => ({ ...g, type: e.target.value }))
                  }
                >
                  <option value="common">Common</option>
                  <option value="preferred">Preferred</option>
                </Select>
              </FormControl>
              <FormControl>
                <Input
                  variant="flushed"
                  placeholder="Value per share"
                  data-testid="grant-share-value"
                  value={valuePerShare.toString() || ''}
                  onChange={(e) => {
                    console.log(e.target.value)
                    setValuePerShare(Number(e.target.value) ?? 0)
                  }}
                />
              </FormControl>
            </Stack>
            <Button type="submit">Save</Button>
          </Stack>
        </ModalContent>
      </Modal>
      <Button as={Link} to={nextLink} colorScheme="teal">
        Next
      </Button>
    </Stack>
  )
}
