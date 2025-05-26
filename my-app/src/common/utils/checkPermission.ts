import { Role } from '../../roles/models/role.model';
import { Permission } from '../../database/models/permission.model';

export async function hasPermission(
  roleId: number,
  permissionName: string,
): Promise<boolean> {
  const role = await Role.findOne({
    where: { id: roleId },
    include: [
      {
        model: Permission,
        where: { name: permissionName },
        required: false,
      },
    ],
  });

  // If role exists and at least one matching permission is found
  return !!(role && role.permissions && role.permissions.length > 0);
}
