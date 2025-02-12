import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { CloudJobStep } from 'uiSrc/electron/constants'

export enum InfiniteMessagesIds {
  oAuthProgress = 'oAuthProgress',
  oAuthSuccess = 'oAuthSuccess',
  autoCreateDb = 'autoCreateDb',
  databaseExists = 'databaseExists',
  subscriptionExists = 'subscriptionExists',
  appUpdateAvailable = 'appUpdateAvailable',
}

export const INFINITE_MESSAGES = {
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div
        role="presentation"
        data-testid="pending-create-db-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className="infiniteMessage__icon" />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                { (step === CloudJobStep.Credentials || !step) && 'Processing Cloud API keys…'}
                { step === CloudJobStep.Subscription && 'Processing Cloud subscriptions…'}
                { step === CloudJobStep.Database && 'Creating a free Cloud database…'}
                { step === CloudJobStep.Import && 'Importing a free Cloud database…'}
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
            <EuiSpacer size="m" />
            <EuiText size="xs">
              You can continue working in RedisInsight, and we will notify you once done.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  SUCCESS_CREATE_DB: (onSuccess: () => void) => ({
    id: InfiniteMessagesIds.oAuthSuccess,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="success-create-db-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>Congratulations!</span></EuiTitle>
        <EuiText size="xs">
          You can now use your Redis Stack database in Redis Cloud
          to start exploring all its developer capabilities via RedisInsight tutorials.
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess()}
              data-testid="notification-connect-db"
            >
              Get started
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="database-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>You already have a free Redis Cloud subscription.</span></EuiTitle>
        <EuiText size="xs">
          Do you want to import your existing database into RedisInsight?
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="import-db-sso-btn"
            >
              Import
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-import-db-sso-btn"
            >
              Cancel
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="subscription-exists-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>Your subscription does not have a free Redis Cloud database.</span></EuiTitle>
        <EuiText size="xs">
          Do you want to create a free database in your existing subscription?
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess?.()}
              data-testid="create-subscription-sso-btn"
            >
              Create
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-create-subscription-sso-btn"
            >
              Cancel
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    Inner: (
      <div
        role="presentation"
        data-testid="pending-create-db-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className="infiniteMessage__icon" />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                Connecting to your database
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="app-update-available-notification"
      >
        <EuiTitle className="infiniteMessage__title">
          <span>
            New version is now available
          </span>
        </EuiTitle>
        <EuiText size="s">
          <>
            With RedisInsight
            {` ${version} `}
            you have access to new useful features and optimizations.
            <br />
            Restart RedisInsight to install updates.
          </>
        </EuiText>
        <br />
        <EuiButton
          fill
          size="s"
          color="secondary"
          onClick={() => onSuccess?.()}
          data-testid="app-restart-btn"
        >
          Restart
        </EuiButton>
      </div>
    )
  }),
}
