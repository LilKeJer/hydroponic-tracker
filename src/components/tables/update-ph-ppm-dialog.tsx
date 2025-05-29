"use client";

import { useState, useEffect, FormEvent } from "react";
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
import { Activity, BarChart } from "lucide-react";

interface UpdatePhPpmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPH: number | null;
  currentPPM: number | null;
  onUpdate: (ph: number | null, ppm: number | null) => void;
}

export default function UpdatePhPpmDialog({
  open,
  onOpenChange,
  currentPH,
  currentPPM,
  onUpdate,
}: UpdatePhPpmDialogProps) {
  const [phValue, setPhValue] = useState<string>(
    currentPH != null ? currentPH.toString() : ""
  );
  const [ppmValue, setPpmValue] = useState<string>(
    currentPPM != null ? currentPPM.toString() : ""
  );

  // Reset values when dialog opens
  useEffect(() => {
    if (open) {
      setPhValue(currentPH != null ? currentPH.toString() : "");
      setPpmValue(currentPPM != null ? currentPPM.toString() : "");
    }
  }, [open, currentPH, currentPPM]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

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

    onUpdate(phNumber, ppmNumber);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-yellow-600" />
            Update PH dan PPM
          </DialogTitle>
          <DialogDescription>
            Perbarui nilai pengukuran PH dan PPM terbaru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ph" className="flex items-center">
                <span className="text-xl font-bold text-red-500 mr-2">pH</span>
                Nilai PH
              </Label>
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
              <p className="text-xs text-gray-500">
                Skala PH: 0-14 (7 adalah netral)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ppm" className="flex items-center">
                <BarChart className="h-4 w-4 mr-1 text-blue-600" />
                Nilai PPM (Parts Per Million)
              </Label>
              <Input
                id="ppm"
                type="number"
                min="0"
                value={ppmValue}
                onChange={(e) => setPpmValue(e.target.value)}
                placeholder="contoh: 800"
              />
              <p className="text-xs text-gray-500">
                PPM mengukur konsentrasi nutrisi dalam air
              </p>
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
