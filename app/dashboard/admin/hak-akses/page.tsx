"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash, UserPlus, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
}

interface Role {
  id: string
  name: string
  description: string
}

interface Permission {
  id: string
  name: string
  description: string
}

export default function HakAksesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])

  // Dummy data untuk contoh
  useEffect(() => {
    // Simulasi fetch data users
    setUsers([
      {
        id: "1",
        name: "Administrator",
        email: "admin@example.com",
        username: "admin",
        role: "admin",
      },
      {
        id: "2",
        name: "Staff User",
        email: "staff@example.com",
        username: "staff",
        role: "staff",
      },
      {
        id: "3",
        name: "Guest User",
        email: "guest@example.com",
        username: "guest",
        role: "guest",
      },
    ])

    // Simulasi fetch data roles
    setRoles([
      {
        id: "1",
        name: "admin",
        description: "Administrator dengan akses penuh",
      },
      {
        id: "2",
        name: "staff",
        description: "Staff dengan akses terbatas",
      },
      {
        id: "3",
        name: "guest",
        description: "Tamu dengan akses hanya melihat",
      },
    ])

    // Simulasi fetch data permissions
    setPermissions([
      {
        id: "1",
        name: "kelola_data_central",
        description: "Mengelola data central",
      },
      {
        id: "2",
        name: "kelola_mitra",
        description: "Mengelola data mitra",
      },
      {
        id: "3",
        name: "kelola_hak_akses",
        description: "Mengelola hak akses pengguna",
      },
      {
        id: "4",
        name: "kelola_dashboard_statistik",
        description: "Mengelola dashboard statistik",
      },
      {
        id: "5",
        name: "ajukan_surat",
        description: "Mengajukan surat",
      },
      {
        id: "6",
        name: "kelola_data_mitra_tertentu",
        description: "Mengelola data mitra tertentu",
      },
      {
        id: "7",
        name: "lihat_dashboard_statistik",
        description: "Melihat dashboard statistik",
      },
      {
        id: "8",
        name: "lihat_data_kerjasama",
        description: "Melihat data kerjasama",
      },
    ])
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    toast({
      title: "Pengguna berhasil ditambahkan",
      description: "Pengguna baru telah berhasil ditambahkan ke sistem",
    })
  }

  const handleAddRole = () => {
    toast({
      title: "Role berhasil ditambahkan",
      description: "Role baru telah berhasil ditambahkan ke sistem",
    })
  }

  const handleUpdatePermissions = () => {
    toast({
      title: "Hak akses berhasil diperbarui",
      description: "Hak akses untuk role telah berhasil diperbarui",
    })
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Hak Akses</h1>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="roles">Role</TabsTrigger>
          <TabsTrigger value="permissions">Hak Akses</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>Kelola pengguna dan role mereka</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tambah Pengguna
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                      <DialogDescription>Isi form berikut untuk menambahkan pengguna baru ke sistem</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" placeholder="Masukkan nama lengkap" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Masukkan email" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" placeholder="Masukkan username" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Masukkan password" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddUser}>Tambah Pengguna</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari pengguna..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "staff"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Tidak ada data yang ditemukan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Role</CardTitle>
                  <CardDescription>Kelola role dalam sistem</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Role Baru</DialogTitle>
                      <DialogDescription>Isi form berikut untuk menambahkan role baru ke sistem</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role-name">Nama Role</Label>
                        <Input id="role-name" placeholder="Masukkan nama role" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role-description">Deskripsi</Label>
                        <Input id="role-description" placeholder="Masukkan deskripsi role" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddRole}>Tambah Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Role</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-red-500">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kelola Hak Akses</CardTitle>
                  <CardDescription>Atur hak akses untuk setiap role</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label>Pilih Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Hak Akses</h3>
                  <div className="grid gap-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox id={`permission-${permission.id}`} />
                        <Label htmlFor={`permission-${permission.id}`} className="flex-1">
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-fit" onClick={handleUpdatePermissions}>
                  <Shield className="mr-2 h-4 w-4" />
                  Perbarui Hak Akses
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
