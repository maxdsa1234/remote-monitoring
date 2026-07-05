/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateHeartRateData = /* GraphQL */ `
  subscription OnCreateHeartRateData(
    $filter: ModelSubscriptionHeartRateDataFilterInput
  ) {
    onCreateHeartRateData(filter: $filter) {
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
export const onUpdateHeartRateData = /* GraphQL */ `
  subscription OnUpdateHeartRateData(
    $filter: ModelSubscriptionHeartRateDataFilterInput
  ) {
    onUpdateHeartRateData(filter: $filter) {
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
export const onDeleteHeartRateData = /* GraphQL */ `
  subscription OnDeleteHeartRateData(
    $filter: ModelSubscriptionHeartRateDataFilterInput
  ) {
    onDeleteHeartRateData(filter: $filter) {
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
export const onCreateEcgData = /* GraphQL */ `
  subscription OnCreateEcgData($filter: ModelSubscriptionEcgDataFilterInput) {
    onCreateEcgData(filter: $filter) {
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
export const onUpdateEcgData = /* GraphQL */ `
  subscription OnUpdateEcgData($filter: ModelSubscriptionEcgDataFilterInput) {
    onUpdateEcgData(filter: $filter) {
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
export const onDeleteEcgData = /* GraphQL */ `
  subscription OnDeleteEcgData($filter: ModelSubscriptionEcgDataFilterInput) {
    onDeleteEcgData(filter: $filter) {
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
export const onCreateDoctor = /* GraphQL */ `
  subscription OnCreateDoctor($filter: ModelSubscriptionDoctorFilterInput) {
    onCreateDoctor(filter: $filter) {
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
export const onUpdateDoctor = /* GraphQL */ `
  subscription OnUpdateDoctor($filter: ModelSubscriptionDoctorFilterInput) {
    onUpdateDoctor(filter: $filter) {
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
export const onDeleteDoctor = /* GraphQL */ `
  subscription OnDeleteDoctor($filter: ModelSubscriptionDoctorFilterInput) {
    onDeleteDoctor(filter: $filter) {
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
export const onCreatePatient = /* GraphQL */ `
  subscription OnCreatePatient($filter: ModelSubscriptionPatientFilterInput) {
    onCreatePatient(filter: $filter) {
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
export const onUpdatePatient = /* GraphQL */ `
  subscription OnUpdatePatient($filter: ModelSubscriptionPatientFilterInput) {
    onUpdatePatient(filter: $filter) {
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
export const onDeletePatient = /* GraphQL */ `
  subscription OnDeletePatient($filter: ModelSubscriptionPatientFilterInput) {
    onDeletePatient(filter: $filter) {
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
