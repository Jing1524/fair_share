import { useContext, useState } from 'react'
import { OnboardingContext } from '../../pages/Onboarding'
import { useNavigate } from 'react-router-dom'
import { Button, FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react'
import { useFormValidation } from '../../context/FormValidationContext'

export function CompanyStep() {
  const { companyName, dispatch } = useContext(OnboardingContext)
  const { formValues, error, setFormValues, validateCompanyName } = useFormValidation()
  const [companyNameInputBlurred, setCompanyNameInputBlurred] = useState(false)

  const navigate = useNavigate()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    validateCompanyName()
    const isFormValid = Object.values(error).every((errorMessage) => errorMessage === '')
    if (isFormValid) {
      navigate('/start/shareholders')
    }
  }

  function handleCompanyNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updateFormValues = { ...formValues, companyName: e.target.value }
    setFormValues(updateFormValues)
    dispatch({ type: 'updateCompany', payload: e.target.value })
  }

  function handleCompanyNameBlur() {
    setCompanyNameInputBlurred(true)
    validateCompanyName() // Validate the company name when the input field loses focus
  }

  return (
    <Stack as="form" onSubmit={onSubmit} spacing="4">
      <FormControl id="companyName" size="lg" color="teal.400">
        <FormLabel>What company are we examining?</FormLabel>
        <Input
          type="text"
          placeholder="Company Name"
          onChange={handleCompanyNameChange}
          value={companyName}
          onBlur={handleCompanyNameBlur}
        />
        {companyNameInputBlurred && formValues.companyName.length === 0 && <Text color="red">{error.companyName}</Text>}
      </FormControl>
      <Button type="submit" colorScheme="teal" isDisabled={!companyName.length}>
        Next
      </Button>
    </Stack>
  )
}
