import React, { createContext, useContext, useState } from 'react'
import { OnboardingContext } from '../pages/Onboarding'

interface FormValidationContextType {
  formValues: {
    name: string
    email: string
    companyName: string
  }
  error: Partial<{
    name: string
    email: string
    companyName: string
  }>
  setFormValues: React.Dispatch<
    React.SetStateAction<{
      name: string
      email: string
      companyName: string
    }>
  >
  validateName: () => void
  validateEmail: () => void
  validateCompanyName: () => void
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined)

interface FormValidationProviderProps {
  children: React.ReactNode
}

const FormValidationProvider: React.FC<FormValidationProviderProps> = ({ children }) => {
  const { userName, email, companyName } = useContext(OnboardingContext)
  const [formValues, setFormValues] = useState({
    name: userName,
    email: email,
    companyName: companyName,
  })
  const [errors, setErrors] = useState<
    Partial<{
      name: string
      email: string
      companyName: string
    }>
  >({})

  // validate user name
  const validateName = (): void => {
    if (!formValues.name.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: 'Name is required',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: '',
      }))
    }
  }
  //  validate user email
  const validateEmail = (): void => {
    if (!formValues.email.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email is required',
      }))
    } else if (!isValidEmail(formValues.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Invalid email address',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }))
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    return emailRegex.test(email)
  }

  // validate companyName
  const validateCompanyName = (): void => {
    if (!formValues.companyName.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyName: 'Company name is required',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyName: '',
      }))
    }
  }

  const contextValue: FormValidationContextType = {
    formValues,
    error: errors,
    setFormValues,
    validateName,
    validateEmail,
    validateCompanyName,
  }

  return <FormValidationContext.Provider value={contextValue}>{children}</FormValidationContext.Provider>
}

const useFormValidation = (): FormValidationContextType => {
  const context = useContext(FormValidationContext)
  if (!context) {
    throw new Error('useFormValidation must be used within a provider')
  }
  return context
}

export { FormValidationProvider, useFormValidation }
