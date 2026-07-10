import { createUserClient } from '../lib/supabase.js';

export async function listTaches(req, res, next) {
  try {
    const db = createUserClient(req.userToken);
    let query = db
      .from('tachesjour')
      .select('id_tache, statut, heure, date_tache, nom_tache, commentaire')
      .eq('user_id', req.user.id)
      .order('heure', { ascending: true, nullsFirst: true });

    if (req.query.date) {
      query = query.eq('date_tache', req.query.date);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateTacheStatut(req, res, next) {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const VALID_STATUTS = ['a_faire', 'fait', 'ratee'];

    if (!statut || !VALID_STATUTS.includes(statut)) {
      return res
        .status(400)
        .json({ error: `statut doit être l'un de: ${VALID_STATUTS.join(', ')}` });
    }

    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('tachesjour')
      .update({ statut })
      .eq('id_tache', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
