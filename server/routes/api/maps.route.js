const express = require('express');
const mapsCtr = require('../../controllers/maps.controller');
const createCan = require('../../middleware/createCan');

const router = express.Router();
const canDeleteMaps = createCan('deleteMaps');
const canReadMaps = createCan('readMaps');
const canUpdateMaps = createCan('updateMaps');
const canCreateMaps = createCan('createMaps');

// Preload map object on routes with ':mapId'
router.param('mapId', mapsCtr.preloadTargetMap);

router.get('/', canReadMaps, mapsCtr.getMaps);

router.post('/addMap', canCreateMaps, mapsCtr.createMap);

router.get('/:mapId', canReadMaps, mapsCtr.getMap);

router.post('/updateMap/:mapId', canUpdateMaps, mapsCtr.updateMap);

// router.delete('/:mapId', canDeleteMaps, mapsCtr.deleteMap);

module.exports = router;
