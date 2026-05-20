import { supabase } from '../lib/supabase';
import { usePatient } from './usePatient';

const { setPatientPassword } = usePatient();

export function useNewPatient() {

  async function createPatient(email, { nom, prenom, tel }) {

    const res = await fetch(
      import.meta.env.VITE_SUPABASE_URL +
      '/functions/v1/create-new-patient',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          nom,
          prenom,
          tel
        })
      }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error);
    }

    return json;
  }

  // ----------------------------
  // CHECK SESSION (simple)
  // ----------------------------
  async function getSession() {

    const { data, error } =
      await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
  }

  // ----------------------------
  // CREATE PASSWORD
  // ----------------------------
  async function createFirstPassword(password) {

    const { data, error } =
      await supabase.auth.updateUser({
        password
      });

      if(!error) {

        setPatientPassword(password);
      
      }

    if (error) throw error;

    return data;
  }

  return {
    createPatient,
    getSession,
    createFirstPassword
  };
}