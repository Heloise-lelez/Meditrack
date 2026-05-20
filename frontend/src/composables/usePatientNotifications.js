import { ref } from 'vue';
import { supabase } from '@/lib/supabase.js';

const notifications = ref([]);
let channels = [];

export function usePatientNotifications() {
  function init(patients) {
    cleanup();
    for (const patient of patients) {
      const patientId = patient.patient_id ?? patient.id;
      const profile = patient.profiles ?? patient;
      const patientName = `${profile.prenom} ${profile.nom}`;

      const channel = supabase
        .channel(`patient:${patientId}`)
        .on('broadcast', { event: 'doctor_notification' }, ({ payload }) => {
          notifications.value.unshift({
            id: `${Date.now()}-${Math.random()}`,
            message: payload.message,
            doctorName: payload.doctorName,
            patientId,
            patientName,
            timestamp: payload.timestamp ?? new Date().toISOString(),
          });
        })
        .on('broadcast', { event: 'surgery_step' }, ({ payload }) => {
          notifications.value.unshift({
            id: `${Date.now()}-${Math.random()}`,
            message: payload.message,
            doctorName: `Chirurgie : ${payload.chirurgieTitre}`,
            patientId,
            patientName,
            timestamp: payload.timestamp ?? new Date().toISOString(),
          });
        })
        .subscribe();

      channels.push(channel);
    }
  }

  function cleanup() {
    for (const ch of channels) {
      supabase.removeChannel(ch);
    }
    channels = [];
  }

  function dismiss(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  return { notifications, init, cleanup, dismiss };
}
