import { useContext } from 'react'
import { Context as FarmsContext } from '../contexts/Farms'

const useFarms = (isAdv:Boolean = false) => {
  const { farms } = useContext(FarmsContext)
  return [farms.filter((farm)=> farm.isAdv === isAdv)]
}

export default useFarms