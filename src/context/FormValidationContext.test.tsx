import { render } from '@testing-library/react'
import { FormValidationProvider, useFormValidation } from './FormValidationContext'

describe('FormValidationContext', () => {
  it('should provide the formValues and error objects along with validation functions', () => {
    const TestComponent = () => {
      const { formValues, error, setFormValues, validateName, validateEmail, validateCompanyName } = useFormValidation()

      // Assert that the formValues and error objects are available
      expect(formValues).toBeDefined()
      expect(error).toBeDefined()

      // Assert that the setFormValues function is available and can update the formValues object
      setFormValues({ name: 'John Doe', email: 'john@example.com', companyName: 'ABC Company' })
      expect(formValues).toEqual({ name: 'John Doe', email: 'john@example.com', companyName: 'ABC Company' })

      // Assert that the validation functions are available
      expect(validateName).toBeDefined()
      expect(validateEmail).toBeDefined()
      expect(validateCompanyName).toBeDefined()

      return null
    }

    render(
      <FormValidationProvider>
        <TestComponent />
      </FormValidationProvider>
    )
  })

  it('should validate the name field and update the error object accordingly', () => {
    const TestComponent = () => {
      const { formValues, error, setFormValues, validateName } = useFormValidation()

      // Set initial form values
      setFormValues({ name: '', email: '', companyName: '' })

      // Assert that the error object is initially empty
      expect(error.name).toBeUndefined()

      // Validate the name field
      validateName()

      // Assert that the error object is updated with the correct error message
      expect(error.name).toBe('Name is required')

      return null
    }

    render(
      <FormValidationProvider>
        <TestComponent />
      </FormValidationProvider>
    )
  })

  // Add more test cases for validating the email and companyName fields
})
