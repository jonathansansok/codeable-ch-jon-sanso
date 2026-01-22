import { gql } from "@apollo/client";

export const Q_PLANTS = gql`
  query Plants {
    plants { id name code }
  }
`;

export const Q_VOLUME_TIERS = gql`
  query VolumeTiers {
    volumeTiers
  }
`;

export const Q_PLANT_OPERATIONS = gql`
  query PlantOperations($plantId: ID!) {
    plantOperations(plantId: $plantId) {
      id
      plant { id name }
      operation { id name basePriceUsd linkMode }
      margins { tier marginPercent }
    }
  }
`;

export const M_SET_MARGIN = gql`
  mutation SetMargin($plantId: ID!, $operationId: ID!, $input: SetMarginInput!) {
    setMargin(plantId: $plantId, operationId: $operationId, input: $input) {
      id
      operation { id }
      margins { tier marginPercent }
    }
  }
`;
