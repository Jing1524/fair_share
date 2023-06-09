import { useContext } from 'react'
import { AuthContext } from '../../App'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { OnboardingContext } from '../../pages/Onboarding'
import { Grant, Shareholder, User } from '../../types'
import React from 'react'
import { Spinner, Stack, Text } from '@chakra-ui/react'

export function DoneStep() {
  const { authorize } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { email, userName, companyName, shareholders, grants, shareValues } = useContext(OnboardingContext)

  const grantMutation = useMutation<Grant, unknown, Grant>((grant) =>
    fetch('/grant/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant }),
    }).then((res) => res.json())
  )
  const shareholderMutation = useMutation<Shareholder, unknown, Shareholder>(
    (shareholder) =>
      fetch('/shareholder/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareholder),
      }).then((res) => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user')
      },
    }
  )
  const userMutation = useMutation<User, unknown, User>((user) =>
    fetch('/user/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).then((res) => res.json())
  )
  // @ts-ignore
  const companyMutation = useMutation<Company, unknown, Company>((company) => {
    console.log({ company })
    fetch('/company/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    }).then((res) => res.json())
  })

  React.useEffect(() => {
    async function SaveData() {
      const user = await userMutation.mutateAsync({ email, name: userName })
      await Promise.all([
        ...Object.values(grants).map((grant) => grantMutation.mutateAsync(grant)),
        ...Object.values(shareholders).map((shareholder) => shareholderMutation.mutateAsync(shareholder)),

        companyMutation.mutateAsync({ name: companyName, shareValues }),
      ])

      if (user) {
        authorize(user)
        navigate('/dashboard')
      } else {
        // Something bad happened.
      }
    }

    SaveData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack alignItems="center">
      <Spinner />
      <Text color="teal.400">...Wrapping up</Text>
    </Stack>
  )
}
