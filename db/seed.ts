import * as bcrypt from "bcrypt";
import { db, permissions, rolePermissions, roles, surats, userRoles, users, mitras } from "./index";
import { eq } from "drizzle-orm";

// Deklarasikan tipe data untuk role, permission, dan user
interface Role {
  id: string;
  name: string;
  description: string | null; 
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
}

async function main() {
  try {
    console.log("Starting database seeding...");

    // Bersihkan database
    await db.delete(rolePermissions);
    await db.delete(userRoles);
    await db.delete(permissions);
    await db.delete(roles);
    await db.delete(users);
    await db.delete(mitras);
    await db.delete(surats);

    console.log("Database dibersihkan");

    // Buat roles
    const rolesData = [
      { name: "admin", description: "Administrator dengan akses penuh" },
      { name: "staff", description: "Staff dengan akses terbatas" },
      { name: "guest", description: "Tamu dengan akses hanya melihat" },
    ];

    await db.insert(roles).values(rolesData).execute();

    const createdRoles = await db.select().from(roles);
    console.log("Created Roles:", createdRoles);

    // Pastikan roles dibuat dengan benar
    if (!createdRoles || createdRoles.length === 0) {
      throw new Error("Roles tidak berhasil dibuat");
    }

    // Cek keberadaan roles
    const adminRole = createdRoles.find((role) => role.name === "admin");
    const staffRole = createdRoles.find((role) => role.name === "staff");
    const guestRole = createdRoles.find((role) => role.name === "guest");

    if (!adminRole || !staffRole || !guestRole) {
      console.error("Roles tidak ditemukan:");
      if (!adminRole) console.error("Admin role tidak ditemukan");
      if (!staffRole) console.error("Staff role tidak ditemukan");
      if (!guestRole) console.error("Guest role tidak ditemukan");
      throw new Error("Role tidak ditemukan");
    }

    console.log("Roles dibuat");

    // Buat permissions
    const permissionValues = [
      { name: "kelola_data_central", description: "Mengelola data central" },
      { name: "kelola_mitra", description: "Mengelola data mitra" },
      { name: "kelola_hak_akses", description: "Mengelola hak akses pengguna" },
      { name: "kelola_dashboard_statistik", description: "Mengelola dashboard statistik" },
      { name: "ajukan_surat", description: "Mengajukan surat" },
      { name: "kelola_data_mitra_tertentu", description: "Mengelola data mitra tertentu" },
      { name: "lihat_dashboard_statistik", description: "Melihat dashboard statistik" },
      { name: "lihat_data_kerjasama", description: "Melihat data kerjasama" },
    ];

    // Insert permissions dan ambil data yang baru dimasukkan
    await db.insert(permissions).values(permissionValues).execute();

    const createdPermissions = await db.select().from(permissions);
    console.log("Created Permissions:", createdPermissions);

    // Verifikasi bahwa permissions valid
    if (!createdPermissions || createdPermissions.length === 0) {
      throw new Error("Permissions tidak berhasil dibuat atau kosong");
    }

    // Filter permissions untuk role
    const rolePermissionsData = [
      {
        role: adminRole,
        permissions: createdPermissions,
      },
      {
        role: staffRole,
        permissions: createdPermissions.filter((p) => p.name && ["ajukan_surat", "kelola_data_mitra_tertentu", "lihat_dashboard_statistik", "lihat_data_kerjasama"].includes(p.name)),
      },
      {
        role: guestRole,
        permissions: createdPermissions.filter((p) => p.name && ["lihat_dashboard_statistik", "lihat_data_kerjasama"].includes(p.name)),
      },
    ];

    // Log untuk memeriksa rolePermissionsData
    console.log("rolePermissionsData:", rolePermissionsData);

    // Loop untuk menambahkan permissions ke roles
    for (const { role, permissions } of rolePermissionsData) {
      if (!role) {
        console.error("Role tidak ditemukan saat menambahkan permissions:", role);
        continue;
      }

      if (!permissions || permissions.length === 0) {
        console.error(`Permissions tidak ditemukan untuk role ${role.name}`);
        continue;
      }

      permissions.forEach((permission) => {
        if (!permission || !permission.id) {
          console.error("Permission tidak valid:", permission);
        }
      });

      for (const permission of permissions) {
        if (!permission || !permission.id) {
          console.error("Permission tidak valid:", permission);
          continue;
        }
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: permission.id });
      }
    }

    console.log("Role permissions dibuat");

    // Buat users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Buat admin user
    await db.insert(users).values({
      name: "Administrator",
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword
    }).execute();

    // Buat staff user
    await db.insert(users).values({
      name: "Staff User",
      email: "staff@example.com",
      username: "staff",
      password: hashedPassword
    }).execute();

    // Buat guest user
    await db.insert(users).values({
      name: "Guest User",
      email: "guest@example.com",
      username: "guest",
      password: hashedPassword
    }).execute();

    // Ambil semua users untuk digunakan dalam userRoles dan surats
    const allUsers = await db.select().from(users);
    console.log("Created Users:", allUsers);

    // Buat user roles
    const adminUser = allUsers.find(u => u.username === "admin");
    const staffUser = allUsers.find(u => u.username === "staff");
    const guestUser = allUsers.find(u => u.username === "guest");

    if (adminUser && adminRole) {
      await db.insert(userRoles).values({ userId: adminUser.id, roleId: adminRole.id });
    }
    
    if (staffUser && staffRole) {
      await db.insert(userRoles).values({ userId: staffUser.id, roleId: staffRole.id });
    }
    
    if (guestUser && guestRole) {
      await db.insert(userRoles).values({ userId: guestUser.id, roleId: guestRole.id });
    }

    console.log("Users dibuat dan peran ditambahkan");

    // Buat data mitra contoh
    const mitraValues = [
      { nama: "Universitas Indonesia", kategori: "Pendidikan", tanggalMulai: new Date("2023-01-01"), tanggalAkhir: new Date("2023-12-31"), status: "Aktif", alamat: "Depok, Jawa Barat", kontak: "021-1234567", email: "info@ui.ac.id", website: "www.ui.ac.id", deskripsi: "Universitas terkemuka di Indonesia" },
      { nama: "PT Teknologi Maju", kategori: "Teknologi", tanggalMulai: new Date("2023-02-15"), tanggalAkhir: new Date("2024-02-15"), status: "Aktif", alamat: "Jakarta Selatan", kontak: "021-7654321", email: "info@tekno.com", website: "www.tekno.com", deskripsi: "Perusahaan teknologi terkemuka" },
      { nama: "Rumah Sakit Medika", kategori: "Kesehatan", tanggalMulai: new Date("2023-03-10"), tanggalAkhir: new Date("2024-03-10"), status: "Aktif", alamat: "Jakarta Pusat", kontak: "021-9876543", email: "info@medika.com", website: "www.medika.com", deskripsi: "Rumah sakit dengan pelayanan terbaik" },
    ];

    await db.insert(mitras).values(mitraValues);
    console.log("Data mitra dibuat");

    // Buat data surat contoh
    if (staffUser && adminUser) {
      const suratValues = [
        { jenisSurat: "Kerjasama", judul: "Kerjasama Penelitian", tujuan: "Universitas Indonesia", perihal: "Pengajuan Kerjasama Penelitian", isi: "Dengan hormat, kami mengajukan permohonan kerjasama penelitian...", status: "Menunggu", userId: staffUser.id },
        { jenisSurat: "Permohonan", judul: "Permohonan Magang", tujuan: "PT Teknologi Maju", perihal: "Pengajuan Magang Mahasiswa", isi: "Dengan hormat, kami mengajukan permohonan magang untuk mahasiswa...", status: "Disetujui", userId: staffUser.id },
        { jenisSurat: "Undangan", judul: "Undangan Seminar", tujuan: "Rumah Sakit Medika", perihal: "Undangan Seminar Kesehatan", isi: "Dengan hormat, kami mengundang Bapak/Ibu untuk hadir dalam seminar...", status: "Ditolak", userId: adminUser.id },
      ];

      await db.insert(surats).values(suratValues);
      console.log("Data surat dibuat");
    } else {
      console.warn("Tidak dapat membuat data surat karena user tidak ditemukan");
    }

    console.log("Seeding selesai!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();