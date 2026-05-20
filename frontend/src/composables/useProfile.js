import { supabase } from '../lib/supabase';
import { usePatient } from '../composables/usePatient';
import { useDoctor } from '../composables/useDoctor';
import { useAssistant } from '../composables/useAssistant';
import { useAuth } from './useAuth';
import { ROLES } from '@/constants/roles';

const { user } = useAuth();

export let userPassword;

const patientUser = usePatient().getPatientPassword();
const doctorUser = useDoctor().getDoctorPassword();
const assistantUser = useAssistant().getAssistantPassword();

if(user.role === ROLES.PATIENT) {

  userPassword = patientUser;

} else if(user.role === ROLES.DOCTOR) {

  userPassword = doctorUser;

} else if(user.role === ROLES.ASSISTANT) {

  userPassword = assistantUser;

}

export function useProfile() {

  function getPassword() {

    return userPassword;

  }

  async function updatePassword(password) {

<<<<<<< HEAD
    const { error } =
=======
    const { data, error } =
>>>>>>> aa566a40a5863b764c3757f95e998c56aa8b1e34
      await supabase.auth.updateUser({
        password
      });

      if(!error) {

        userPassword = password;
<<<<<<< HEAD
=======
        return data;
>>>>>>> aa566a40a5863b764c3757f95e998c56aa8b1e34

      } else {

        throw error;

      }

  }

  return {
    getPassword,
    updatePassword
  };
}