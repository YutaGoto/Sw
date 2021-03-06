import * as algoliasearch from 'algoliasearch';

import { config } from '../../config';
import { USERS } from '../../constants/index';
import { createUserObject } from './createUserObject';

export const updateUserObject = async (objectID, user) => {
  const object = createUserObject(objectID, user);

  const client = algoliasearch(config.algolia.appId, config.algolia.key);

  const index = client.initIndex(USERS);

  await index.saveObject(object);
};
