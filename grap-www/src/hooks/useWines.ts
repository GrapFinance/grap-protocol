import {useContext} from "react";
import {Context as WinesContext} from "../contexts/Wines";

const useWine = () => {
  const {wines} = useContext(WinesContext);
  return wines;
};

export default useWine;
