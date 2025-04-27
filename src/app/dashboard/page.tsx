"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import TableCardList from "@/components/tables/table-card-list";
import AddTableDialog from "@/components/tables/add-table-dialog";
import { HydroponicTable } from "@/types";
import {
  getTables,
  addTable,
  updateHarvest,
  updateWaterChange,
  deleteTable,
  updatePhPpm,
} from "@/lib/supabase/tables";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [tables, setTables] = useState<HydroponicTable[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fungsi untuk memuat data dari Supabase
  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state sebelum mengambil data

      const data = await getTables();

      if (Array.isArray(data)) {
        setTables(data);
      } else {
        console.error("Data yang diterima bukan array:", data);
        setTables([]);
        setError("Format data tidak valid");
      }
    } catch (err) {
      console.error("Error loading tables:", err);
      setTables([]); // Set tables ke array kosong jika terjadi error

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memuat data meja");
      }

      // Jika error karena autentikasi, redirect ke login
      if (err instanceof Error && err.message.includes("terautentikasi")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Memuat data saat pertama kali komponen di-render
  useEffect(() => {
    loadTables();
  }, []);

  // Fungsi untuk menambah meja baru
  const handleAddTable = async (newTable: Omit<HydroponicTable, "id">) => {
    try {
      const addedTable = await addTable(newTable);
      setTables([addedTable, ...tables]);
      setIsAddDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal menambahkan meja");
      }
    }
  };

  // Fungsi untuk menghapus meja
  const handleDeleteTable = async (id: string) => {
    try {
      await deleteTable(id);
      setTables(tables.filter((table) => table.id !== id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal menghapus meja");
      }
    }
  };

  // Fungsi untuk update waktu panen
  const handleHarvest = async (id: string) => {
    try {
      await updateHarvest(id);

      // Update state dengan menggeser panen 2 ke panen 1 dan menambahkan panen baru ke panen 2
      setTables(
        tables.map((table) => {
          if (table.id === id) {
            return {
              ...table,
              lastHarvest1: table.lastHarvest2, // geser panen 2 ke panen 1
              lastHarvest2: new Date(), // panen 2 menjadi tanggal baru
            };
          }
          return table;
        })
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal update panen");
      }
    }
  };

  // Fungsi untuk update waktu ganti air
  const handleWaterChange = async (id: string) => {
    try {
      await updateWaterChange(id);

      // Update state dengan menggeser ganti air 2 ke ganti air 1 dan menambahkan ganti air baru ke ganti air 2
      setTables(
        tables.map((table) => {
          if (table.id === id) {
            return {
              ...table,
              lastWaterChange1: table.lastWaterChange2, // geser ganti air 2 ke ganti air 1
              lastWaterChange2: new Date(), // ganti air 2 menjadi tanggal baru
            };
          }
          return table;
        })
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal update ganti air");
      }
    }
  };
  // Fungsi untuk update nilai PH dan PPM
  const handleUpdatePhPpm = async (
    id: string,
    ph: number | null,
    ppm: number | null
  ) => {
    try {
      await updatePhPpm(id, ph, ppm);

      // Update state dengan nilai PH dan PPM baru
      setTables(
        tables.map((table) => {
          if (table.id === id) {
            return {
              ...table,
              phValue: ph,
              ppmValue: ppm,
            };
          }
          return table;
        })
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal update nilai PH dan PPM");
      }
    }
  };
  // Fungsi untuk logout
  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">
            Hydroponic Tracker
          </h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-600"
          >
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Meja Hidroponik
          </h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Meja
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            <p className="font-medium mb-2">Terjadi kesalahan:</p>
            <p>{error}</p>
            <Button
              onClick={loadTables}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-md mb-6 text-center">
            <p className="font-medium mb-2">Terjadi kesalahan:</p>
            <p>{error}</p>
            <Button
              onClick={loadTables}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Coba Lagi
            </Button>
          </div>
        ) : tables && tables.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Belum ada meja hidroponik.</p>
            <p className="text-gray-500 mt-2">
              Klik tombol Tambah Meja untuk mulai.
            </p>
          </div>
        ) : (
          <TableCardList
            tables={tables}
            onHarvest={handleHarvest}
            onWaterChange={handleWaterChange}
            onDelete={handleDeleteTable}
            onUpdatePhPpm={handleUpdatePhPpm}
          />
        )}
      </main>

      <AddTableDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTable}
      />
    </div>
  );
}
