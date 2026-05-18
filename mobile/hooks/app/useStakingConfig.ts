import { RootState } from "@/src/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useStaking from "../api/useStaking";
import { useDispatch } from "react-redux";
import { setStakingConfig } from "@/src/features/asset/stakingSlice";

export function useStakingConfig() {
  const { config } = useSelector((state: RootState) => state.staking);
  const dispatch = useDispatch();
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loadSuccess, setLoadSuccess] = useState(false);

  async function syncConfig() {
    if (loadSuccess) return;
    let fetchedConfig = await useStaking.getConfig();
    setConfigLoaded(true);
    if (typeof fetchedConfig === "string") {
      console.log("error fetching config", fetchedConfig);
      return;
    }
    setLoadSuccess(true);
    dispatch(setStakingConfig(fetchedConfig));
  }
  useEffect(() => {
    syncConfig();
  }, [configLoaded]);

  return {
    config,
    configLoaded,
  };
}
