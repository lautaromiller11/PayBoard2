const express = require('express');
const prisma = require('../config/prisma');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// GET /api/preferences/cotizaciones
router.get('/cotizaciones', authenticateJWT, async (req, res) => {
  try {
    const pref = await prisma.userPreference.findUnique({ where: { userId: req.user.id } });
    const ids = pref?.cotizaciones ? safeParseArray(pref.cotizaciones) : [];
    return res.json({ ids });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/preferences/cotizaciones
router.put('/cotizaciones', authenticateJWT, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    const serialized = JSON.stringify(ids.map(String));
    const upserted = await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      update: { cotizaciones: serialized },
      create: { userId: req.user.id, cotizaciones: serialized },
    });
    return res.json({ ids: JSON.parse(upserted.cotizaciones) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

function safeParseArray(str) {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

module.exports = router;