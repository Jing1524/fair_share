import React, { useContext } from 'react'
import { VictoryLabel, VictoryPie } from 'victory'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import {
  Text,
  Heading,
  Stack,
  Button,
  Input,
  StackDivider,
  Table,
  Thead,
  Tr,
  Tbody,
  Td,
  Modal,
  useDisclosure,
  ModalContent,
  Spinner,
  Alert,
  AlertTitle,
  AlertIcon,
  Select,
} from '@chakra-ui/react'
import { Grant, Shareholder } from '../types'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import produce from 'immer'
import { AuthContext } from '../App'

export function Dashboard() {
  const { authorize } = useContext(AuthContext)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const queryClient = useQueryClient()
  const [newShareholder, setNewShareholder] = React.useState<Omit<Shareholder, 'id' | 'grants'>>({
    name: '',
    group: 'employee',
  })
  const { mode } = useParams()
  const navigate = useNavigate()
  const shareholderMutation = useMutation<Shareholder, unknown, Omit<Shareholder, 'id' | 'grants'>>(
    (shareholder) =>
      fetch('/shareholder/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareholder),
      }).then((res) => res.json()),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<{ [id: number]: Shareholder } | undefined>('shareholders', (s) => {
          if (s) {
            return produce(s, (draft) => {
              draft[data.id] = data
            })
          }
        })
      },
    }
  )

  // TODO: using this dictionary thing a lot... hmmm
  // const grant = useQuery<{ [dataID: number]: Grant }, string>('grants', () => fetch('/grants').then((e) => e.json()))
  // const shareholder = useQuery<{ [dataID: number]: Shareholder }>('shareholders', () =>
  //   fetch('/shareholders').then((e) => e.json())
  // )

  // ANSWER: To avoid using the dictionary pattern, maybe I could utilize useDictionaryQuery like following?
  function useDictionaryQuery<T>(queryKey: string) {
    return useQuery<{ [dataID: number]: T }>(queryKey, () => fetch(`/${queryKey}`).then((response) => response.json()))
  }
  const grant = useDictionaryQuery<Grant>('grants')
  const shareholder = useDictionaryQuery<Shareholder>('shareholders')

  const company = useQuery('company', () => fetch('/company').then((res) => res.json()))

  if (grant.status === 'error') {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error: {grant.error as string}</AlertTitle>
      </Alert>
    )
  }
  if (grant.status !== 'success') {
    return <Spinner />
  }
  if (!grant.data || !shareholder.data) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Failed to get any data</AlertTitle>
      </Alert>
    )
  }

  // TODO: why are these inline?
  // ANSWER: To keep the code self-contained within the context of the array methods being used
  // It can improve readability and maintainability, especially for simple transformations and calculations.
  function getGroupData() {
    if (!shareholder.data || !grant.data) {
      return []
    }
    return ['investor', 'founder', 'employee'].map((group) => ({
      x: group,
      y: Object.values(shareholder?.data ?? {})
        .filter((s) => s.group === group)
        .flatMap((s) => s.grants)
        .reduce((acc, grantID) => acc + grant.data[grantID].amount, 0),
    }))
  }

  function getInvestorData() {
    if (!shareholder.data || !grant.data) {
      return []
    }
    return Object.values(shareholder.data)
      .map((s) => ({
        x: s.name,
        y: s.grants.reduce((acc, grantID) => acc + grant.data[grantID].amount, 0),
      }))
      .filter((e) => e.y > 0)
  }

  // share type comes in from grant.data
  function getShareTypeData() {
    if (!shareholder.data || !grant.data) {
      return []
    }
    // initialize empty object to store the aggregated data for each share type
    const shareTypeData: { [shareType: string]: number } = {}

    Object.values(grant.data).forEach((grant) => {
      const shareType = grant.type
      if (!shareTypeData[shareType]) {
        shareTypeData[shareType] = 0
      }
      shareTypeData[shareType] += grant.amount
    })
    return Object.entries(shareTypeData).map(([shareType, amount]) => ({
      x: `${shareType} ${amount} shares`, // add the number shares for each type to the label to show # of shares?
      y: amount,
    }))
  }

  function getMarketCapValue() {
    if (!grant.data || !company.data) {
      return
    }
    let marketCap = 0
    Object.values(grant.data).forEach((grant) => {
      const shareType = `${grant.type}`
      const shareValue = company.data.shareValues[shareType]
      const totalValue = shareValue * grant.amount
      marketCap += totalValue
    })
    return marketCap
  }

  async function submitNewShareholder(e: React.FormEvent) {
    e.preventDefault()
    await shareholderMutation.mutateAsync(newShareholder)
    onClose()
  }
  // need to view pieChart by equity value -> common: total value and preferred: total value
  function getEquityValueData() {
    if (!grant.data || !company.data) {
      return
    }

    const { common, preferred } = company.data.shareValues
    const commonSharesTotalValue = Object.values(grant.data)
      .filter((g) => g.type === 'common')
      .reduce((total, g) => total + g.amount * common, 0)

    const preferredSharesTotalValue = Object.values(grant.data)
      .filter((g) => g.type !== 'common')
      .reduce((total, g) => total + g.amount * preferred, 0)
    return [
      { x: `Common Shares value $${commonSharesTotalValue}`, y: commonSharesTotalValue },
      { x: `Preferred Shares value $${preferredSharesTotalValue}`, y: preferredSharesTotalValue },
    ]
  }

  const pieChartData = mode === 'group' ? getGroupData() : mode === 'investor' ? getInvestorData() : getShareTypeData()
  const pieChartData2 = getEquityValueData()

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <Stack>
      {company.data?.name && (
        <Button mb={2} onClick={logout}>
          Logout
        </Button>
      )}

      <Stack direction="row" justify="space-between" alignItems="baseline">
        <Heading size="md" bgGradient="linear(to-br, teal.400, teal.100)" bgClip="text">
          Fair Share
        </Heading>
        <Stack direction="column">
          <Stack direction="row">
            <Button
              colorScheme="teal"
              as={Link}
              to="/dashboard/investor"
              variant="ghost"
              isActive={mode === 'investor'}
            >
              By Investor
            </Button>
            <Button colorScheme="teal" as={Link} to="/dashboard/group" variant="ghost" isActive={mode === 'group'}>
              By Group
            </Button>
            <Button
              colorScheme="teal"
              as={Link}
              to="/dashboard/shareType"
              variant="ghost"
              isActive={mode === 'shareType'}
            >
              By share Type
            </Button>
          </Stack>
          <Button
            colorScheme="teal"
            as={Link}
            to="/dashboard/equityValue"
            variant="ghost"
            isActive={mode === 'equityValue'}
          >
            By Equity Value
          </Button>
        </Stack>
      </Stack>
      {mode === 'equityValue' ? (
        <VictoryPie
          colorScale="blue"
          data={pieChartData2} // render data based on mode
          labelComponent={<VictoryLabel style={{ fontSize: '8px', fill: '#fff' }} />}
          labelRadius={18} // Adjust the label radius to move labels closer to the pie
        />
      ) : (
        <VictoryPie
          colorScale="blue"
          data={pieChartData}
          labelComponent={<VictoryLabel style={{ fontSize: '10px', fill: '#fff' }} />}
          labelRadius={50}
        />
      )}

      <Stack divider={<StackDivider />}>
        <Heading>Shareholders</Heading>
        <Table>
          <Thead>
            <Tr>
              <Td>Name</Td>
              <Td>Group</Td>
              <Td>Grants</Td>
              <Td>Shares</Td>
            </Tr>
          </Thead>
          <Tbody>
            {Object.values(shareholder.data).map((s) => (
              <Tr key={s.id}>
                <Td>
                  <Link to={`/shareholder/${s.id}`}>
                    <Stack direction="row" alignItems="center">
                      <Text color="teal.600">{s.name}</Text>
                      <ArrowForwardIcon color="teal.600" />
                    </Stack>
                  </Link>
                </Td>
                <Td data-testid={`shareholder-${s.name}-group`}>{s.group}</Td>
                <Td data-testid={`shareholder-${s.name}-grants`}>{s.grants.length}</Td>
                <Td data-testid={`shareholder-${s.name}-shares`}>
                  {s.grants.reduce((acc, grantID) => acc + grant.data[grantID].amount, 0)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {/* Display the company's market cap (total shares of each type * value for each type) in the dashboard */}
        <Table>
          <Thead>
            <Tr>
              <Td textAlign="right">Market cap</Td>
              <Td textAlign="right">{`$${getMarketCapValue()}`}</Td>
            </Tr>
          </Thead>
        </Table>
        <Button onClick={onOpen}>Add Shareholder</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <Stack p="10" as="form" onSubmit={submitNewShareholder}>
              <Input
                value={newShareholder.name}
                placeholder="Shareholder Name"
                onChange={(e) => setNewShareholder((s) => ({ ...s, name: e.target.value }))}
              />
              <Select
                placeholder="Type of shareholder"
                value={newShareholder.group}
                onChange={(e) =>
                  setNewShareholder((s) => ({
                    ...s,
                    group: e.target.value as any,
                  }))
                }
              >
                <option value="investor">Investor</option>
                <option value="founder">Founder</option>
                <option value="employee">Employee</option>
              </Select>
              <Button type="submit" colorScheme="teal">
                Save
              </Button>
            </Stack>
          </ModalContent>
        </Modal>
      </Stack>
    </Stack>
  )
}
