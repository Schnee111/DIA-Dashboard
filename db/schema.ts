import { relations } from "drizzle-orm"
import { boolean, datetime, index, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core"
import { createId } from "@paralleldrive/cuid2"

// User model
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    profilePicture: varchar("profile_picture", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
      usernameIdx: uniqueIndex("username_idx").on(table.username),
    }
  },
)

// Role model
export const roles = mysqlTable(
  "roles",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex("name_idx").on(table.name),
    }
  },
)

// Permission model
export const permissions = mysqlTable(
  "permissions",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex("name_idx").on(table.name),
    }
  },
)

// UserRole model (junction table)
export const userRoles = mysqlTable(
  "user_roles",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    roleId: varchar("role_id", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      userRoleIdx: uniqueIndex("user_role_idx").on(table.userId, table.roleId),
      userIdIdx: index("user_id_idx").on(table.userId),
      roleIdIdx: index("role_id_idx").on(table.roleId),
    }
  },
)

// RolePermission model (junction table)
export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    roleId: varchar("role_id", { length: 128 }).notNull(),
    permissionId: varchar("permission_id", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      rolePermissionIdx: uniqueIndex("role_permission_idx").on(table.roleId, table.permissionId),
      roleIdIdx: index("role_id_idx").on(table.roleId),
      permissionIdIdx: index("permission_id_idx").on(table.permissionId),
    }
  },
)

// Mitra model
export const mitras = mysqlTable("mitras", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  nama: varchar("nama", { length: 255 }).notNull(),
  kategori: varchar("kategori", { length: 255 }).notNull(),
  tanggalMulai: datetime("tanggal_mulai").notNull(),
  tanggalAkhir: datetime("tanggal_akhir").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  alamat: varchar("alamat", { length: 255 }),
  kontak: varchar("kontak", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  deskripsi: text("deskripsi"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Surat model
export const surats = mysqlTable("surats", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  jenisSurat: varchar("jenis_surat", { length: 100 }).notNull(),
  judul: varchar("judul", { length: 255 }).notNull(),
  tujuan: varchar("tujuan", { length: 255 }).notNull(),
  perihal: varchar("perihal", { length: 255 }).notNull(),
  isi: text("isi").notNull(),
  lampiran: varchar("lampiran", { length: 255 }),
  status: varchar("status", { length: 50 }).default("Menunggu").notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}))

export const suratsRelations = relations(surats, ({ one }) => ({
  user: one(users, {
    fields: [surats.userId],
    references: [users.id],
  }),
}))
