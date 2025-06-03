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
      await getAllDescendants(model, child.get('id'), result);
    }
  }

  return result;
}

/**
 * rtfrfr
 *
 * @param model
 * @param ancestorId --> user or role id
 * @param descendantId
 * @returns
 */
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

import { Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';

export async function isAncestorCTEWithSequelize(
  sequelize: Sequelize,
  tableName: 'users' | 'roles',
  ancestorId: number,
  descendantId: number,
): Promise<boolean> {
  // Basic whitelist check to prevent SQL injection via tableName
  if (!['users', 'roles'].includes(tableName)) {
    throw new Error('Invalid table name');
  }

  const query = `
    WITH RECURSIVE parent_chain AS (
      SELECT id, parent_id
      FROM ${tableName}
      WHERE id = :descendantId
      UNION ALL
      SELECT t.id, t.parent_id
      FROM ${tableName} t
      INNER JOIN parent_chain pc ON pc.parent_id = t.id
    )
    SELECT 1 FROM parent_chain WHERE id = :ancestorId LIMIT 1;
  `;

  const [results] = await sequelize.query(query, {
    replacements: { ancestorId, descendantId },
    type: QueryTypes.SELECT,
  });

  return Array.isArray(results) ? results.length > 0 : !!results;
}

export async function getAncestryPath(
  sequelize: Sequelize,
  tableName: 'users' | 'roles',
  userId: number,
) {
  // : Promise<
  //   {
  //     userId: number;
  //     name: string;
  //     parentId: number | null;
  //     path: string;
  //     depth: number;
  //   }[]
  // >
  let result;
  if (tableName == 'users') {
    result = await sequelize.query(
      `
        WITH RECURSIVE ancestry AS (
          SELECT id, user_name, parent_id, CAST(id AS CHAR) AS path, 0 AS depth
          FROM ${tableName}
          WHERE id = :startId
  
          UNION ALL
  
          SELECT u.id, u.user_name, u.parent_id, CONCAT(u.id, '/', a.path), a.depth + 1
          FROM ${tableName} u
          INNER JOIN ancestry a ON a.parent_id = u.id
        )
        SELECT * FROM ancestry ORDER BY depth;
        `,
      {
        replacements: { startId: userId },
        type: QueryTypes.SELECT,
      },
    );
  } else {
    result = await sequelize.query(
      `
        WITH RECURSIVE ancestry AS (
          SELECT id, name, parent_id, CAST(id AS CHAR) AS path, 0 AS depth
          FROM ${tableName}
          WHERE id = :startId
  
          UNION ALL
  
          SELECT u.id, u.name, u.parent_id, CONCAT(u.id, '/', a.path), a.depth + 1
          FROM ${tableName} u
          INNER JOIN ancestry a ON a.parent_id = u.id
        )
        SELECT * FROM ancestry ORDER BY depth;
        `,
      {
        replacements: { startId: userId },
        type: QueryTypes.SELECT,
      },
    );
  }

  // return result as {
  //   userId: number;
  //   name: string;
  //   parentId: number | null;
  //   path: string;
  //   depth: number;
  // }[];
  const input = (result[result.length - 1] as { path: string })?.path || '';
  const numberArray = input.split('/').map(Number);

  console.log(numberArray);
  return numberArray;
}
