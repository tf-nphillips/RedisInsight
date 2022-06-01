import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiTextColor,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'

import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { addNewGroupAction } from 'uiSrc/slices/browser/stream'
import { consumerGroupIdRegex, validateConsumerGroupId } from 'uiSrc/utils'
import { CreateConsumerGroupsDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

export interface Props {
  onCancel: (isCancelled?: boolean) => void
}

const AddStreamGroup = (props: Props) => {
  const { onCancel } = props
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }

  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [id, setId] = useState<string>('$')
  const [idError, setIdError] = useState<string>('')
  const [isIdFocused, setIsIdFocused] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !!groupName.length && !idError
    setIsFormValid(isValid)
  }, [groupName, idError])

  useEffect(() => {
    if (!consumerGroupIdRegex.test(id)) {
      setIdError('ID format is not correct')
      return
    }
    setIdError('')
  }, [id])

  const submitData = () => {
    if (isFormValid) {
      const data: CreateConsumerGroupsDto = {
        keyName,
        consumerGroups: [{
          name: groupName,
          lastDeliveredId: id,
        }],
      }
      dispatch(addNewGroupAction(data, onCancel))
    }
  }

  const showIdError = !isIdFocused && idError

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <EuiFlexItem
          className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
          grow
        >
          <EuiFlexGroup gutterSize="none" responsive={false}>
            <EuiFlexItem grow>
              <EuiFlexGroup gutterSize="none" alignItems="flexStart" responsive={false}>
                <EuiFlexItem className={styles.groupNameWrapper} grow>
                  <EuiFormRow fullWidth>
                    <EuiFieldText
                      fullWidth
                      name="group-name"
                      id="group-name"
                      placeholder="Enter Group Name*"
                      value={groupName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                      autoComplete="off"
                      data-testid="group-name-field"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem className={styles.timestampWrapper} grow>
                  <EuiFormRow fullWidth>
                    <EuiFieldText
                      fullWidth
                      name="id"
                      id="id"
                      placeholder="ID*"
                      value={id}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setId(validateConsumerGroupId(e.target.value))}
                      onBlur={() => setIsIdFocused(false)}
                      onFocus={() => setIsIdFocused(true)}
                      append={(
                        <EuiToolTip
                          anchorClassName="inputAppendIcon"
                          className={styles.entryIdTooltip}
                          position="left"
                          title="Enter Valid ID, 0 or $"
                          content={lastDeliveredIDTooltipText}
                        >
                          <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
                        </EuiToolTip>
                      )}
                      autoComplete="off"
                      data-testid="id-field"
                    />
                  </EuiFormRow>
                  {!showIdError && <span className={styles.idText} data-testid="id-help-text">Timestamp - Sequence Number or $</span>}
                  {showIdError && <span className={styles.error} data-testid="id-error">{idError}</span>}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiPanel>
      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        className="flexItemNoFullWidth"
      >
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="l">
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton color="secondary" onClick={() => onCancel(true)} data-testid="cancel-stream-groups-btn">
                <EuiTextColor color="default">Cancel</EuiTextColor>
              </EuiButton>
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton
                fill
                size="m"
                color="secondary"
                onClick={submitData}
                disabled={!isFormValid}
                data-testid="save-groups-btn"
              >
                Save
              </EuiButton>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export default AddStreamGroup