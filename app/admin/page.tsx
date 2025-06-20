"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MitraTab } from "@/components/tabs/mitra-tab";
import { KerjasamaTab } from "@/components/tabs/kerjasama-tab";
import { PersonelTab } from "@/components/tabs/personel-tab";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export default function DataCentralPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYearFrom, setFilterYearFrom] = useState("all");
  const [filterYearTo, setFilterYearTo] = useState("all");

  const getYearRangeDescription = () => {
    if (filterYearFrom === "all" && filterYearTo === "all") {
      return "Semua periode kerjasama";
    } else if (filterYearFrom !== "all" && filterYearTo === "all") {
      return `Kerjasama yang berlangsung dari tahun ${filterYearFrom} ke atas`;
    } else if (filterYearFrom === "all" && filterYearTo !== "all") {
      return `Kerjasama yang berlangsung sampai tahun ${filterYearTo}`;
    } else if (filterYearFrom === filterYearTo) {
      return `Kerjasama yang berlangsung pada tahun ${filterYearFrom}`;
    } else {
      return `Kerjasama yang berlangsung antara tahun ${filterYearFrom} - ${filterYearTo}`;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Data</h1>
      </div>

      {(filterYearFrom !== "all" || filterYearTo !== "all") && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            <strong>Filter Aktif:</strong> {getYearRangeDescription()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterYearFrom("all");
              setFilterYearTo("all");
            }}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            Reset Filter
          </Button>
        </div>
      )}

      <Tabs defaultValue="mitra">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
          <TabsTrigger value="kerjasama">Data Kerjasama</TabsTrigger>
          <TabsTrigger value="personel">Data Personel</TabsTrigger>
        </TabsList>
        <TabsContent value="mitra" className="mt-4">
          <MitraTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterYearFrom={filterYearFrom}
            filterYearTo={filterYearTo}
            toast={toast}
          />
        </TabsContent>
        <TabsContent value="kerjasama" className="mt-4">
          <KerjasamaTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterYearFrom={filterYearFrom}
            filterYearTo={filterYearTo}
            toast={toast}
          />
        </TabsContent>
        <TabsContent value="personel" className="mt-4">
          <PersonelTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterYearFrom={filterYearFrom}
            filterYearTo={filterYearTo}
            toast={toast}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}