// Definisi tipe untuk meja hidroponik dengan terminologi terdahulu/terbaru
export interface HydroponicTable {
  id: string;
  name: string;
  description?: string;
  // Label yang lebih intuitif untuk catatan panen dan ganti air
  lastHarvest1: Date | null; // Panen terdahulu
  lastHarvest2: Date | null; // Panen terbaru
  lastWaterChange1: Date | null; // Ganti air terdahulu
  lastWaterChange2: Date | null; // Ganti air terbaru
  // Tambahan untuk PH dan PPM
  phValue: number | null; // Nilai PH terakhir diukur
  ppmValue: number | null; // Nilai PPM terakhir diukur
  lastMeasured: Date | null; // Waktu terakhir PH dan PPM diukur
  nutrient_ml: number; // Make required instead of optional
}

// Tipe untuk props konfirmasi dialog
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: "green" | "blue" | "red";
  onConfirm: () => void;
  icon?: React.ReactNode;
}

// Tipe untuk props add table dialog
export interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (table: Omit<HydroponicTable, "id">) => void;
}

// Tipe untuk props table card
export interface TableCardProps {
  table: HydroponicTable;
  onHarvest: () => void;
  onWaterChange: () => void;
  onDelete: () => void;
  onUpdatePhPpm?: (ph: number | null, ppm: number | null) => void;
  onAddNutrient?: (
    id: string,
    amount: number
  ) => Promise<HydroponicTable | null>; // Keep consistent
  onResetNutrient?: (id: string) => void;
}

// Tipe untuk props table card list
export interface TableCardListProps {
  tables: HydroponicTable[];
  onHarvest: (id: string) => void;
  onWaterChange: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePhPpm?: (id: string, ph: number | null, ppm: number | null) => void;
  onAddNutrient?: (
    id: string,
    amount: number
  ) => Promise<HydroponicTable | null>; // Keep consistent
  onResetNutrient?: (id: string) => void;
}
