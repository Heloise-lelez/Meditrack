import { createUserClient } from '../lib/supabase.js';

export async function listEtapes(req, res, next) {
  try {
    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('etape')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date_debut', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateEtapeChecklist(req, res, next) {
  try {
    const { id } = req.params;
    const { checklist } = req.body;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: 'checklist doit être un tableau' });
    }

    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('etape')
      .update({ checklist })
      .eq('id_etape', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Étape introuvable' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
