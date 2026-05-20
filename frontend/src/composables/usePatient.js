let patientCurrentPassword;

export function usePatient() {
  function setPatientPassword(password) {
    patientCurrentPassword = password;
  }

  function getPatientPassword() {
    return patientCurrentPassword;
  }

  return {
    getPatientPassword,
    setPatientPassword,
  };
}
