const express = require('express');
const prisma = require('../config/prisma');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Protect all routes below
router.use(authenticateJWT);

// GET /api/servicios - list services for current user
router.get('/', async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(servicios);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/servicios - create service
router.post('/', async (req, res) => {
  try {
    const { nombre, monto, vencimiento, periodicidad, estado } = req.body;
    if (!nombre || monto === undefined || !vencimiento || !periodicidad) {
      return res.status(400).json({ error: 'nombre, monto, vencimiento and periodicidad are required' });
    }

    // Prisma Decimal accepts string; ensure correct type
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        monto: String(monto),
        vencimiento: new Date(vencimiento),
        periodicidad,
        estado: estado || 'por_pagar',
        userId: req.user.id
      }
    });
    return res.status(201).json(servicio);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/servicios/:id - update service
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = await prisma.servicio.findUnique({ where: { id } });
    if (!service || service.userId !== req.user.id) {
      return res.status(404).json({ error: 'Servicio not found' });
    }

    const { nombre, monto, vencimiento, periodicidad, estado } = req.body;
    const updated = await prisma.servicio.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(monto !== undefined ? { monto: String(monto) } : {}),
        ...(vencimiento !== undefined ? { vencimiento: new Date(vencimiento) } : {}),
        ...(periodicidad !== undefined ? { periodicidad } : {}),
        ...(estado !== undefined ? { estado } : {})
      }
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/servicios/:id - delete service
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = await prisma.servicio.findUnique({ where: { id } });
    if (!service || service.userId !== req.user.id) {
      return res.status(404).json({ error: 'Servicio not found' });
    }

    await prisma.pago.deleteMany({ where: { servicioId: id } });
    await prisma.servicio.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/servicios/:id/estado - update status only
router.patch('/:id/estado', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado } = req.body; // 'por_pagar' | 'pagado' | 'vencido'
    if (!estado) {
      return res.status(400).json({ error: 'estado is required' });
    }
    const service = await prisma.servicio.findUnique({ where: { id } });
    if (!service || service.userId !== req.user.id) {
      return res.status(404).json({ error: 'Servicio not found' });
    }
    const updated = await prisma.servicio.update({ where: { id }, data: { estado } });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


