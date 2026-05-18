import { supabase } from '../lib/supabase.js';

export async function listDocuments(req, res, next) {
  try {
    let query = supabase
      .from('document')
      .select('*')
      .order('publication_date', { ascending: false });

    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    const { titre, type } = req.body;
    if (!titre || !type) {
      return res.status(400).json({ error: 'Missing required fields: titre, type' });
    }

    const { publication_date, download_link, size_kb } = req.body;

    const { data, error } = await supabase
      .from('document')
      .insert({
        titre,
        type,
        publication_date: publication_date ?? null,
        download_link: download_link ?? null,
        size_kb: size_kb ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}
