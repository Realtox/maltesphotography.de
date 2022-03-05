import { validate } from '$lib/api/middleware/validate';
import {
  Collection,
  UpdateCollection,
  UpdateCollectionSchema,
} from '$lib/api/schemas/collection';
import { prisma } from '$lib/prisma';
import { ApiResponseData, ApiResponseError, ensureQueryParam } from '$lib/util';

const schemaMap = {
  PATCH: UpdateCollectionSchema,
  DELETE: null,
};

export default validate(schemaMap, async (req, res) => {
  const id = ensureQueryParam(req.query.id);

  if (!id) {
    return res.status(400).json({
      error: {
        message: 'Missing id query param',
      },
    } as ApiResponseError);
  }

  switch (req.method as keyof typeof schemaMap) {
    case 'DELETE':
      const deletedCollection = await prisma.collection.delete({
        where: {
          id,
        },
      });

      return res
        .status(200)
        .json({ data: deletedCollection } as ApiResponseData<Collection>);
    case 'PATCH':
      // fix the type. but this does not break anything so dont yell at me :(
      const patchData = req.body as any;

      const updatedCollection = await prisma.collection.update({
        where: {
          id,
        },
        data: {
          ...patchData,
          id: undefined,
        },
      });

      return res
        .status(200)
        .json({ data: updatedCollection } as ApiResponseData<Collection>);
  }
});
