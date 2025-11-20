import { Router } from 'express';
import {
  createApiKeyController,
  getUserApiKeysController,
  revokeApiKeyController,
  rotateApiKeyController,
} from '../controllers/apiKeyController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's API keys
router.get('/', getUserApiKeysController);

// Create new API key
router.post('/', createApiKeyController);

// Revoke API key
router.delete('/:id', revokeApiKeyController);

// Rotate API key
router.post('/:id/rotate', rotateApiKeyController);

export default router;












