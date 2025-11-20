import { Router } from 'express';
import {
  globalSearch,
  searchBlogs,
  searchGearItems,
  searchCampsitesOnly,
} from '../controllers/searchController';

const router = Router();

router.get('/', globalSearch);
router.get('/blogs', searchBlogs);
router.get('/gear', searchGearItems);
router.get('/campsites', searchCampsitesOnly);

export default router;













