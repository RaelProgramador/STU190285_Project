const goalsService = require('./goals.service');
const { validateCreate, validateUpdate } = require('./goals.validator');
const { parseId } = require('../../utils/validation');

async function list(req, res) {
  res.json({ goals: await goalsService.list(req.user.id) });
}

async function create(req, res) {
  const goal = await goalsService.create(req.user.id, validateCreate(req.body));
  res.status(201).json({ goal });
}

async function update(req, res) {
  const existing = await goalsService.findOwned(parseId(req.params.id, 'goal id'), req.user.id);
  const goal = await goalsService.update(existing, req.user.id, validateUpdate(req.body, existing));
  res.json({ goal });
}

async function remove(req, res) {
  await goalsService.remove(parseId(req.params.id, 'goal id'), req.user.id);
  res.status(204).end();
}

module.exports = { list, create, update, remove };
