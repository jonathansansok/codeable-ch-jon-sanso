import { useMutation, useQuery } from "@apollo/client/react";
import type { Plant, PlantOpRow } from "../../../types/domain";
import { GET_PLANTS, GET_PLANT_OPERATIONS, SET_MARGIN } from "./plantOperations.gql";

type GetPlantsData = { plants: Plant[] };
type GetPlantOperationsData = { plantOperations: PlantOpRow[] };

export function usePlants() {
  return useQuery<GetPlantsData>(GET_PLANTS, { fetchPolicy: "cache-and-network" });
}

export function usePlantOperations(plantId: string) {
  return useQuery<GetPlantOperationsData>(GET_PLANT_OPERATIONS, {
    variables: { plantId },
    skip: !plantId,
    fetchPolicy: "cache-and-network",
  });
}

export function useSetMargin() {
  return useMutation(SET_MARGIN);
}
