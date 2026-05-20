let doctorCurrentPassword;

export function useDoctor() {
  function setDoctorPassword(password) {
    doctorCurrentPassword = password;
  }

  function getDoctorPassword() {
    return doctorCurrentPassword;
  }

  return {
    getDoctorPassword,
    setDoctorPassword,
  };
}
