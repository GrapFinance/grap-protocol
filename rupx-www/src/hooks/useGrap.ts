import { useContext } from 'react'
import { Context } from '../contexts/GrapProvider'

const useGrap = () => {
  const { grap } = useContext(Context)
  return grap
}

export default useGrap