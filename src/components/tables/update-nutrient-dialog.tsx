// src/components/tables/update-nutrient-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HydroponicTable } from "@/types";
// Tidak perlu import fungsi Supabase di sini lagi

interface UpdateNutrientDialogProps {
  table: HydroponicTable; // Meja yang akan diupdate nutrisi
  // Prop ini akan menjadi fungsi handleAddNutrientToTable dari DashboardPage
  onSaveNutrient: (
    tableId: string,
    amount: number
  ) => Promise<HydroponicTable | null>;
  children: React.ReactNode; // Untuk tombol trigger
}

export function UpdateNutrientDialog({
  table,
  onSaveNutrient,
  children,
}: UpdateNutrientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nutrientAmount, setNutrientAmount] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const amount = Number(nutrientAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Jumlah nutrisi harus angka positif.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      console.log("Attempting to add nutrient:", { tableId: table.id, amount }); // Debug log
      // Panggil handler yang dioper dari DashboardPage
      const updatedTable = await onSaveNutrient(table.id, amount);
      console.log("Nutrient update result:", updatedTable); // Debug log
      if (updatedTable) {
        console.log("Nutrient added successfully"); // Debug log
        setIsOpen(false); // Tutup dialog jika berhasil
        setNutrientAmount(""); // Reset input
      } else {
        console.error("Failed to add nutrient - no updated table returned"); // Debug log
        setError("Gagal menambahkan nutrisi. Periksa konsol atau coba lagi.");
      }
    } catch (e) {
      console.error("Error in handleSave nutrient dialog:", e);
      setError("Terjadi kesalahan pada dialog. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setNutrientAmount(""); // Reset input saat dialog ditutup
      setError(null); // Reset error saat dialog ditutup
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Nutrisi untuk Meja {table.name}</DialogTitle>
          <DialogDescription>
            Nilai nutrisi saat ini: {table.nutrient_ml ?? 0} ml. Masukkan jumlah
            nutrisi (ml) yang ingin ditambahkan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={`nutrient-${table.id}`} className="text-right">
              Jumlah (ml)
            </Label>
            <Input
              id={`nutrient-${table.id}`} // ID unik per dialog
              type="number"
              value={nutrientAmount}
              onChange={(e) => setNutrientAmount(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: 100"
              min="1" // Validasi dasar HTML
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 col-span-4 text-center">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
