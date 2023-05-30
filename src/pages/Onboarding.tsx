import React from 'react'
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { Button, Heading, Stack } from '@chakra-ui/react'
import produce from 'immer'

import { Grant, Shareholder } from '../types'
import { FormValidationProvider } from '../context/FormValidationContext'
import { UserStep } from '../component/onBoardingSteps/UserStep'
import { CompanyStep } from '../component/onBoardingSteps/CompanyStep'
import { ShareholdersStep } from '../component/onBoardingSteps/ShareholderStep'
import { ShareholderGrantsStep } from '../component/onBoardingSteps/ShareholderGrantsStep'
import { DoneStep } from '../component/onBoardingSteps/DoneStep'

const initialShareValues: { [shareType: string]: number } = {
  common: 0, // Set initial value for "common"
  preferred: 0, // Set initial value for "preferred"
}

export const OnboardingContext = React.createContext<OnboardingFields & { dispatch: React.Dispatch<OnboardingAction> }>(
  {
    userName: '',
    email: '',
    companyName: '',
    shareholders: {},
    grants: {},
    shareValues: initialShareValues, // Add shareValues property

    dispatch: () => {},
  }
)

export interface OnboardingFields {
  companyName: string
  userName: string
  email: string
  shareholders: { [shareholderID: number]: Shareholder }
  grants: { [grantID: number]: Grant }
  // add missing share value
  shareValues: { [shareType: string]: number }
}
interface UpdateUserAction {
  type: 'updateUser'
  payload: string
}
interface UpdateEmail {
  type: 'updateEmail'
  payload: string
}
interface UpdateCompanyAction {
  type: 'updateCompany'
  payload: string
}
interface AddShareholderAction {
  type: 'addShareholder'
  payload: Omit<Shareholder, 'id' | 'grants'>
}
interface AddGrant {
  type: 'addGrant'
  payload: { shareholderID: number; grant: Omit<Grant, 'id'> }
}

interface UpdateShareValueAction {
  type: 'updateShareValue'
  payload: { shareType: string; value: number }
}

type OnboardingAction =
  | UpdateUserAction
  | UpdateEmail
  | UpdateCompanyAction
  | AddShareholderAction
  | AddGrant
  | UpdateShareValueAction

export function signupReducer(state: OnboardingFields, action: OnboardingAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'updateUser':
        draft.userName = action.payload
        if (draft.shareholders[0]) {
          draft.shareholders[0].name = action.payload
        } else {
          draft.shareholders[0] = {
            id: 0,
            name: action.payload,
            grants: [],
            group: 'founder',
          }
        }
        break
      case 'updateEmail':
        draft.email = action.payload
        break
      case 'updateCompany':
        draft.companyName = action.payload
        break
      case 'addShareholder':
        const nextShareholderID = Math.max(0, ...Object.keys(draft.shareholders).map((e) => parseInt(e, 10))) + 1
        draft.shareholders[nextShareholderID] = {
          id: nextShareholderID,
          grants: [],
          ...action.payload,
        }
        break
      case 'addGrant':
        const nextGrantID = Math.max(0, ...Object.keys(draft.grants).map((e) => parseInt(e, 10))) + 1
        draft.grants[nextGrantID] = {
          id: nextGrantID,
          ...action.payload.grant,
        }
        draft.shareholders[action.payload.shareholderID].grants.push(nextGrantID)
        break

      //add shareValues case
      case 'updateShareValue':
        console.log(action.payload)
        const { shareType, value } = action.payload
        draft.shareValues = {
          ...draft.shareValues,
          [shareType]: value,
        }
        console.log(draft.shareValues)
        break

      default:
        // Handle unknown action types
        throw new Error('Unhandled action type')
    }
  })
}
export function Start() {
  const [state, dispatch] = React.useReducer(signupReducer, {
    userName: '',
    email: '',
    companyName: '',
    shareholders: {},
    grants: {},
    shareValues: {
      common: 0, // Set initial value for "common"
      preferred: 0, // Set initial value for "preferred"
    },
  })
  const navigate = useNavigate()
  const handleBack = () => {
    // Navigate back to the previous step in the onboarding process
    navigate(-1)
  }

  return (
    <OnboardingContext.Provider value={{ ...state, dispatch }}>
      <FormValidationProvider>
        <Stack direction="column" alignItems="center" spacing="10">
          <Heading size="2x1" color="teal.400">
            Lets get started.
          </Heading>
          <Button onClick={handleBack}>Back</Button>
          <Routes>
            <Route path="/" element={<Navigate to="user" replace={true} />} />
            <Route path="user" element={<UserStep />} />
            <Route path="company" element={<CompanyStep />} />
            <Route path="shareholders" element={<ShareholdersStep />} />
            <Route path="grants" element={<Navigate to={`/start/grants/0`} replace={true} />} />
            <Route path="grants/:shareholderID" element={<ShareholderGrantsStep />} />
            <Route path="done" element={<DoneStep />} />
          </Routes>
        </Stack>
      </FormValidationProvider>
    </OnboardingContext.Provider>
  )
}
