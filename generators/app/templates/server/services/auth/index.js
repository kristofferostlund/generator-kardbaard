'use strict'

import express from 'express';
import auth from './auth.service';
import controller from './auth.controller';
import path from 'path';

const router = express.Router();

router.put('/login', controller.login);

export default router;
