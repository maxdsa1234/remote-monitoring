/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createHeartRateData = /* GraphQL */ `
  mutation CreateHeartRateData(
    $input: CreateHeartRateDataInput!
    $condition: ModelHeartRateDataConditionInput
  ) {
    createHeartRateData(input: $input, condition: $condition) {
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
export const updateHeartRateData = /* GraphQL */ `
  mutation UpdateHeartRateData(
    $input: UpdateHeartRateDataInput!
    $condition: ModelHeartRateDataConditionInput
  ) {
    updateHeartRateData(input: $input, condition: $condition) {
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
export const deleteHeartRateData = /* GraphQL */ `
  mutation DeleteHeartRateData(
    $input: DeleteHeartRateDataInput!
    $condition: ModelHeartRateDataConditionInput
  ) {
    deleteHeartRateData(input: $input, condition: $condition) {
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
export const createEcgData = /* GraphQL */ `
  mutation CreateEcgData(
    $input: CreateEcgDataInput!
    $condition: ModelEcgDataConditionInput
  ) {
    createEcgData(input: $input, condition: $condition) {
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
export const updateEcgData = /* GraphQL */ `
  mutation UpdateEcgData(
    $input: UpdateEcgDataInput!
    $condition: ModelEcgDataConditionInput
  ) {
    updateEcgData(input: $input, condition: $condition) {
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
export const deleteEcgData = /* GraphQL */ `
  mutation DeleteEcgData(
    $input: DeleteEcgDataInput!
    $condition: ModelEcgDataConditionInput
  ) {
    deleteEcgData(input: $input, condition: $condition) {
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
export const createDoctor = /* GraphQL */ `
  mutation CreateDoctor(
    $input: CreateDoctorInput!
    $condition: ModelDoctorConditionInput
  ) {
    createDoctor(input: $input, condition: $condition) {
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
export const updateDoctor = /* GraphQL */ `
  mutation UpdateDoctor(
    $input: UpdateDoctorInput!
    $condition: ModelDoctorConditionInput
  ) {
    updateDoctor(input: $input, condition: $condition) {
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
export const deleteDoctor = /* GraphQL */ `
  mutation DeleteDoctor(
    $input: DeleteDoctorInput!
    $condition: ModelDoctorConditionInput
  ) {
    deleteDoctor(input: $input, condition: $condition) {
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
export const createPatient = /* GraphQL */ `
  mutation CreatePatient(
    $input: CreatePatientInput!
    $condition: ModelPatientConditionInput
  ) {
    createPatient(input: $input, condition: $condition) {
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
export const updatePatient = /* GraphQL */ `
  mutation UpdatePatient(
    $input: UpdatePatientInput!
    $condition: ModelPatientConditionInput
  ) {
    updatePatient(input: $input, condition: $condition) {
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
export const deletePatient = /* GraphQL */ `
  mutation DeletePatient(
    $input: DeletePatientInput!
    $condition: ModelPatientConditionInput
  ) {
    deletePatient(input: $input, condition: $condition) {
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
