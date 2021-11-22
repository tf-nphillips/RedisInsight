import { createSlice } from '@reduxjs/toolkit'
import { first } from 'lodash'

import { cliTexts } from 'uiSrc/constants/cliOutput'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { cliCommandOutput, cliParseTextResponseWithOffset } from 'uiSrc/utils/cli'
import { getUrl, getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import {
  SendClusterCommandDto,
  SendClusterCommandResponse,
  SendCommandResponse,
} from 'apiSrc/modules/cli/dto/cli.dto'

import { AppDispatch, RootState } from '../store'
import { CommandExecutionStatus, StateCliOutput } from '../interfaces/cli'

export const initialState: StateCliOutput = {
  data: [],
  loading: false,
  error: '',
  commandHistory: localStorageService?.get(BrowserStorageItem.cliInputHistory) ?? [],
}

// A slice for recipes
const outputSlice = createSlice({
  name: 'output',
  initialState,
  reducers: {
    setOutputInitialState: () => initialState,

    // Concat text to Output
    concatToOutput: (state, { payload }: { payload: any[] }) => {
      state.data = state.data.concat(payload)
    },

    // Update Cli command History
    updateCliCommandHistory: (state, { payload }: { payload: string[] }) => {
      state.commandHistory = payload
    },

    // Send CLI command to API
    sendCliCommand: (state) => {
      state.loading = true
      state.error = ''
    },
    sendCliCommandSuccess: (state) => {
      state.loading = false

      state.error = ''
    },
    sendCliCommandFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetOutput: (state) => {
      state.data = []
    },
  },
})

// Actions generated from the slice
export const {
  concatToOutput,
  setOutputInitialState,
  resetOutput,
  updateCliCommandHistory,
  sendCliCommand,
  sendCliCommandSuccess,
  sendCliCommandFailure,
} = outputSlice.actions

// A selector
export const outputSelector = (state: RootState) => state.cli.output

// The reducer
export default outputSlice.reducer

// Asynchronous thunk action
export function sendCliCommandAction(
  command: string = '',
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections?.instances?.connectedInstance

      dispatch(concatToOutput(cliCommandOutput(command)))
      if (command === '') {
        onSuccessAction?.()
        return
      }

      dispatch(sendCliCommand())

      const { data, status } = await apiService.post<SendCommandResponse>(
        getUrl(id, ApiEndpoints.CLI, state.cli.settings?.cliClientUuid, ApiEndpoints.SEND_COMMAND),
        { command }
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(sendCliCommandSuccess())
        dispatch(concatToOutput(cliParseTextResponseWithOffset(data.response, data.status)))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(sendCliCommandFailure(errorMessage))
      dispatch(
        concatToOutput(cliParseTextResponseWithOffset(errorMessage, CommandExecutionStatus.Fail))
      )
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendCliClusterCommandAction(
  command: string = '',
  options: SendClusterCommandDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances?.connectedInstance

      dispatch(concatToOutput(cliCommandOutput(command)))
      if (command === '') {
        onSuccessAction?.()
        return
      }

      dispatch(sendCliCommand())

      const { data, status } = await apiService.post<SendClusterCommandResponse[]>(
        getUrl(
          id,
          ApiEndpoints.CLI,
          state.cli.settings?.cliClientUuid,
          ApiEndpoints.SEND_CLUSTER_COMMAND
        ),
        { ...options, command }
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(sendCliCommandSuccess())
        dispatch(
          concatToOutput(cliParseTextResponseWithOffset(first(data)?.response, first(data)?.status))
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(sendCliCommandFailure(errorMessage))
      dispatch(
        concatToOutput(cliParseTextResponseWithOffset(errorMessage, CommandExecutionStatus.Fail))
      )
      onFailAction?.()
    }
  }
}

export function processUnsupportedCommand(
  command: string = '',
  unsupportedCommand: string = '',
  onSuccessAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { unsupportedCommands } = state.cli.settings

    dispatch(concatToOutput(cliCommandOutput(command)))

    dispatch(
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.CLI_UNSUPPORTED_COMMANDS(
            command.slice(0, unsupportedCommand.length),
            unsupportedCommands.join(', ')
          ),
          CommandExecutionStatus.Fail
        )
      )
    )

    onSuccessAction?.()
  }
}