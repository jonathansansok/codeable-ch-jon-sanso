import { gql } from "@apollo/client";

export const GET_PLANTS = gql`
  query GetPlants {
    plants {
      id
      name
      code
    }
  }
`;

export const GET_PLANT_OPERATIONS = gql`
  query GetPlantOperations($plantId: ID!) {
    plantOperations(plantId: $plantId) {
      id
      plant {
        id
        name
        code
      }
      operation {
        id
        name
        basePriceUsd
        linkMode
      }
      margins {
        tier
        marginPercent
      }
    }
  }
`;

export const SET_MARGIN = gql`
  mutation SetMargin($plantId: ID!, $operationId: ID!, $input: SetMarginInput!) {
    setMargin(plantId: $plantId, operationId: $operationId, input: $input) {
      id
      margins {
        tier
        marginPercent
      }
    }
  }
`;
