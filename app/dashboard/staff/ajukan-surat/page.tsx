"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FileText, Upload, Send } from "lucide-react"

export default function AjukanSuratPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulasi pengiriman form
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Pengajuan berhasil dikirim",
        description: "Pengajuan surat Anda telah berhasil dikirim dan sedang diproses.",
      })
    }, 1500)
  }

  return (
    <DashboardLayout role="staff">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ajukan Surat</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Form Pengajuan Surat</CardTitle>
          <CardDescription>Isi form berikut untuk mengajukan surat baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="surat-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="jenis-surat">Jenis Surat</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis surat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kerjasama">Surat Kerjasama</SelectItem>
                  <SelectItem value="permohonan">Surat Permohonan</SelectItem>
                  <SelectItem value="undangan">Surat Undangan</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="judul">Judul Surat</Label>
              <Input id="judul" placeholder="Masukkan judul surat" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tujuan">Tujuan</Label>
              <Input id="tujuan" placeholder="Masukkan tujuan surat" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="perihal">Perihal</Label>
              <Input id="perihal" placeholder="Masukkan perihal surat" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isi">Isi Surat</Label>
              <Textarea id="isi" placeholder="Masukkan isi surat" className="min-h-[150px]" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lampiran">Lampiran (opsional)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Unggah Lampiran
                </Button>
              </div>
              <p className="text-xs text-gray-500">Format yang didukung: PDF, DOCX, JPG, PNG (Maks. 5MB)</p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Simpan Draft
          </Button>
          <Button type="submit" form="surat-form" disabled={loading}>
            {loading ? (
              <>Mengirim...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Pengajuan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </DashboardLayout>
  )
}
