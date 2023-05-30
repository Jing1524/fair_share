import { useContext, useState } from 'react'
import { OnboardingContext } from '../../pages/Onboarding'
import { useFormValidation } from '../../context/FormValidationContext'
import { useNavigate } from 'react-router-dom'
import { Button, FormControl, FormHelperText, FormLabel, Input, Stack, Text } from '@chakra-ui/react'

export function UserStep() {
  const { userName, email, dispatch } = useContext(OnboardingContext)
  // validate form with formValidationContext
  const { formValues, error, setFormValues, validateName, validateEmail } = useFormValidation()
  const [nameInputBlurred, setNameInputBlurred] = useState(false)

  const navigate = useNavigate()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    validateName() // Validate the name
    validateEmail() // Validate the email
    const isFormValid = Object.values(error).every((errorMessage) => errorMessage === '') // Check if all error messages are empty strings

    if (isFormValid) {
      navigate('../company')
    }
  }

  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updateFormValues = { ...formValues, name: e.target.value }
    setFormValues(updateFormValues)
    dispatch({ type: 'updateUser', payload: e.target.value })
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updateFormValues = { ...formValues, email: e.target.value }
    setFormValues(updateFormValues)
    dispatch({ type: 'updateEmail', payload: e.target.value })
  }

  function handleUserNameBlur() {
    setNameInputBlurred(true)
    validateName() // Validate the name when the input field loses focus
  }

  function handleEmailBlur() {
    setNameInputBlurred(true)
    validateEmail() // Validate the email when the input field loses focus
  }

  return (
    <Stack as="form" onSubmit={onSubmit} spacing="4">
      <FormControl id="userName" size="lg" color="teal.400">
        <FormLabel>First, who is setting up this account?*</FormLabel>
        <Input
          type="text"
          placeholder="Your Name"
          onChange={handleUserNameChange}
          value={userName}
          onBlur={handleUserNameBlur}
        />
        {nameInputBlurred && formValues.name.length === 0 && <Text color="red">{error.name}</Text>}
      </FormControl>
      <FormControl id="email" size="lg" color="teal.400">
        <FormLabel>What email will you use to sign in?*</FormLabel>
        <Input
          type="email"
          placeholder="Your Email"
          onChange={handleEmailChange}
          value={email}
          onBlur={handleEmailBlur}
        />
        {error.email && <Text color="red">{error.email}</Text>}
        <FormHelperText>We only use this to create your account.</FormHelperText>
      </FormControl>
      <Button type="submit" colorScheme="teal" isDisabled={!userName.length || !email.length}>
        Next
      </Button>
    </Stack>
  )
}
