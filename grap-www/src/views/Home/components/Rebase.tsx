import React, {useCallback, useEffect, useState} from 'react'
import styled from 'styled-components'
import Countdown, { CountdownRenderProps} from 'react-countdown'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Dial from '../../../components/Dial'
import Label from '../../../components/Label'

import useGrap from '../../../hooks/useGrap'
import useRebase from '../../../hooks/useRebase'

import { getRebaseStatus } from '../../../grapUtils'

interface RebaseProps {
  nextRebase?: number
}

const Rebase: React.FC<RebaseProps> = ({ nextRebase }) => {
  const grap = useGrap()
  const { onRebase } = useRebase()
  const [canRebase, setStats] = useState(Boolean)

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span>{paddedHours}:{paddedMinutes}:{paddedSeconds}</span>
    )
  }
  const fetchStats = useCallback(async () => {
    const canRebase = await getRebaseStatus(grap)
    setStats(canRebase)
  }, [grap, setStats])

  useEffect(() => {
    if (grap) {
      fetchStats()
    }
  }, [fetchStats, grap])

  const dialValue = (nextRebase - Date.now()) / (1000 * 60 * 60 * 24) * 100

  return (
    <StyledRebase>
      <Card>
        <CardContent>
          <Dial disabled={!nextRebase} size={232} value={dialValue ? dialValue : 0}>
            <StyledCountdown>
              <StyledCountdownText>
                {!nextRebase ? '--' : (
                  <Countdown date={new Date(nextRebase)} renderer={renderer} />
                )}
              </StyledCountdownText>
              <Label text="Next rebase" />
            </StyledCountdown>
          </Dial>
          <StyledSpacer />
          <Button disabled={!canRebase} onClick={onRebase}  text="Rebase" />
        </CardContent>
      </Card>
    </StyledRebase>
  )
}

const StyledRebase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCountdownText = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
`


export default Rebase