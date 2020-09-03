import { useContext } from 'react'
import { Context as FarmsContext } from '../contexts/Farms'

const useFarms = (isActivate?:Boolean) => {
  const { farms } = useContext(FarmsContext)
  return [farms.filter((farm)=> (isActivate === undefined || farm.isActivate === isActivate))]
}

export default useFarms