/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getHeartRateData = /* GraphQL */ `
  query GetHeartRateData($id: ID!) {
    getHeartRateData(id: $id) {
      id
      patientId
      heartRate
      timestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listHeartRateData = /* GraphQL */ `
  query ListHeartRateData(
    $filter: ModelHeartRateDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHeartRateData(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        patientId
        heartRate
        timestamp
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEcgData = /* GraphQL */ `
  query GetEcgData($id: ID!) {
    getEcgData(id: $id) {
      id
      patientId
      ecgWaveform
      timestamp
      is_anomaly
      anomaly_score
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listEcgData = /* GraphQL */ `
  query ListEcgData(
    $filter: ModelEcgDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEcgData(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        patientId
        ecgWaveform
        timestamp
        is_anomaly
        anomaly_score
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDoctor = /* GraphQL */ `
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      name
      email
      specialization
      patients {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDoctors = /* GraphQL */ `
  query ListDoctors(
    $filter: ModelDoctorFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDoctors(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        specialization
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPatient = /* GraphQL */ `
  query GetPatient($id: ID!) {
    getPatient(id: $id) {
      id
      name
      email
      doctorId
      doctor {
        id
        name
        email
        specialization
        createdAt
        updatedAt
        __typename
      }
      heartRates {
        nextToken
        __typename
      }
      ecgData {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPatients = /* GraphQL */ `
  query ListPatients(
    $filter: ModelPatientFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPatients(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        doctorId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const heartRateDataByPatientIdAndTimestamp = /* GraphQL */ `
  query HeartRateDataByPatientIdAndTimestamp(
    $patientId: ID!
    $timestamp: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelHeartRateDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    heartRateDataByPatientIdAndTimestamp(
      patientId: $patientId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        patientId
        heartRate
        timestamp
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ecgDataByPatientIdAndTimestamp = /* GraphQL */ `
  query EcgDataByPatientIdAndTimestamp(
    $patientId: ID!
    $timestamp: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEcgDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ecgDataByPatientIdAndTimestamp(
      patientId: $patientId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        patientId
        ecgWaveform
        timestamp
        is_anomaly
        anomaly_score
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const patientsByDoctorId = /* GraphQL */ `
  query PatientsByDoctorId(
    $doctorId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPatientFilterInput
    $limit: Int
    $nextToken: String
  ) {
    patientsByDoctorId(
      doctorId: $doctorId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        email
        doctorId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
