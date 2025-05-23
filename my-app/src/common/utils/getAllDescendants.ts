/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Model } from 'sequelize-typescript';

export interface WithHierarchyKeys {
  id?: number;
  parentId?: number;
}

export async function getAllDescendants<T extends Model & WithHierarchyKeys>(
  model: { findAll: (options: any) => Promise<T[]> },
  parentId: number,
  result: T[] = [],
): Promise<T[]> {
  const children = await model.findAll({
    where: { parentId },
  });

  for (const child of children) {
    result.push(child);
    if (child.id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await getAllDescendants(model, child.dataValues.id, result);
    }
  }

  return result;
}

export async function isAncestor<T extends Model>(
  model: { findByPk: (id: number) => Promise<T | null> },
  ancestorId: number,
  descendantId: number,
): Promise<boolean> {
  let currentId = descendantId;

  while (currentId) {
    if (currentId === ancestorId) {
      return true;
    }

    const currentRecord = await model.findByPk(currentId);
    if (!currentRecord || currentRecord.get('parentId') == null) {
      break;
    }

    currentId = currentRecord.get('parentId') as number;
  }

  return false;
}
