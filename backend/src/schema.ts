import { gql } from "graphql-tag";

export const typeDefs = gql`
  enum VolumeTier {
    KG_300
    KG_500
    T_1
    T_3
    T_5
    T_10
    T_20
    T_30
  }

  enum LinkMode {
    NONE
    BY_STRUCTURE
  }

  type Plant {
    id: ID!
    name: String!
    code: String
  }

  type Operation {
    id: ID!
    name: String!
    basePriceUsd: Float!
    linkMode: LinkMode!
  }

  type MarginByTier {
    tier: VolumeTier!
    marginPercent: Float!
  }

  type PlantOperationRow {
    id: ID!
    plant: Plant!
    operation: Operation!
    margins: [MarginByTier!]!
  }

  input UpsertPlantInput {
    id: ID
    name: String!
    code: String
  }

  input UpsertOperationInput {
    id: ID
    name: String!
    basePriceUsd: Float!
    linkMode: LinkMode!
  }

  input SetMarginInput {
    tier: VolumeTier!
    marginPercent: Float!
  }

  type Query {
    plants: [Plant!]!
    operations: [Operation!]!
    plantOperations(plantId: ID!): [PlantOperationRow!]!
    volumeTiers: [VolumeTier!]!
  }

  type Mutation {
    upsertPlant(input: UpsertPlantInput!): Plant!
    upsertOperation(input: UpsertOperationInput!): Operation!
    ensurePlantOperation(plantId: ID!, operationId: ID!): PlantOperationRow!
    setMargin(plantId: ID!, operationId: ID!, input: SetMarginInput!): PlantOperationRow!
    setMarginsBulk(plantOperationId: ID!, inputs: [SetMarginInput!]!): PlantOperationRow!
  }
`;
