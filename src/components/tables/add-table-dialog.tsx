"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddTableDialogProps } from "@/types";

export default function AddTableDialog({
  open,
  onOpenChange,
  onAdd,
}: AddTableDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phValue, setPhValue] = useState<string>("");
  const [ppmValue, setPpmValue] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Convert pH and PPM to numbers if they exist
    const phNumber = phValue ? parseFloat(phValue) : null;
    const ppmNumber = ppmValue ? parseInt(ppmValue, 10) : null;

    // Validate pH is between 0 and 14
    if (phNumber !== null && (phNumber < 0 || phNumber > 14)) {
      alert("Nilai PH harus antara 0 dan 14");
      return;
    }

    // Validate PPM is a positive number
    if (ppmNumber !== null && ppmNumber < 0) {
      alert("Nilai PPM tidak boleh negatif");
      return;
    }

    onAdd({
      name,
      description,
      // Inisialisasi dengan nilai null untuk semua catatan panen dan ganti air
      lastHarvest1: null, // Panen terdahulu
      lastHarvest2: null, // Panen terbaru
      lastWaterChange1: null, // Ganti air terdahulu
      lastWaterChange2: null, // Ganti air terbaru
      phValue: phNumber,
      ppmValue: ppmNumber,
    });

    // Reset form
    setName("");
    setDescription("");
    setPhValue("");
    setPpmValue("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Meja Baru</DialogTitle>
          <DialogDescription>
            Tambahkan informasi meja hidroponik baru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Meja</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Meja Selada"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="contoh: Jenis tanaman, lokasi, dll"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ph">Nilai PH</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={phValue}
                  onChange={(e) => setPhValue(e.target.value)}
                  placeholder="contoh: 6.5"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ppm">Nilai PPM</Label>
                <Input
                  id="ppm"
                  type="number"
                  min="0"
                  value={ppmValue}
                  onChange={(e) => setPpmValue(e.target.value)}
                  placeholder="contoh: 800"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
