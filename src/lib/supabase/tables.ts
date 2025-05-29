import { supabase } from "./client";
import { HydroponicTable } from "@/types";
import { getCurrentUser } from "./auth";

// Definisikan interface untuk data pengukuran
interface MeasurementData {
  id: string;
  table_id: string;
  ph_value: number | null;
  ppm_value: number | null;
  measured_at: string;
  notes?: string;
}

// Tipe untuk data update
type TableUpdateData = Record<string, number | null | string>;

// Mengambil semua meja hidroponik milik user
export async function getTables(): Promise<HydroponicTable[]> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const { data, error } = await supabase
    .from("hydroponic_tables")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal mengambil data meja");
  }

  // Filter tables by user_id manually if needed
  const userTables = data
    ? data.filter((table) => table.user_id === user.id)
    : [];

  // Konversi string dates menjadi Date objects
  return userTables.map((table) => ({
    id: table.id,
    name: table.name,
    description: table.description,
    lastHarvest1: table.last_harvest_1 ? new Date(table.last_harvest_1) : null,
    lastHarvest2: table.last_harvest_2 ? new Date(table.last_harvest_2) : null,
    lastWaterChange1: table.last_water_change_1
      ? new Date(table.last_water_change_1)
      : null,
    lastWaterChange2: table.last_water_change_2
      ? new Date(table.last_water_change_2)
      : null,
    phValue: table.ph_value || null,
    ppmValue: table.ppm_value || null,
    lastMeasured: table.last_measured_at
      ? new Date(table.last_measured_at)
      : null,
    nutrient_ml: table.nutrient_ml || 0, // Ensure it's always a number
  })) as HydroponicTable[];
}

// Menambah meja hidroponik baru
export async function addTable(
  tableData: Omit<HydroponicTable, "id">
): Promise<HydroponicTable> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const newTableData = {
    name: tableData.name,
    description: tableData.description || null,
    user_id: user.id,
    last_harvest_1: tableData.lastHarvest1
      ? tableData.lastHarvest1.toISOString()
      : null,
    last_harvest_2: tableData.lastHarvest2
      ? tableData.lastHarvest2.toISOString()
      : null,
    last_water_change_1: tableData.lastWaterChange1
      ? tableData.lastWaterChange1.toISOString()
      : null,
    last_water_change_2: tableData.lastWaterChange2
      ? tableData.lastWaterChange2.toISOString()
      : null,
    ph_value: tableData.phValue || null,
    ppm_value: tableData.ppmValue || null,
    last_measured_at:
      tableData.phValue || tableData.ppmValue ? new Date().toISOString() : null,
    nutrient_ml: 0, // Inisialisasi nutrisi dengan 0
    // Tambahkan kolom nutrisi jika diperlukan
  };

  const { data, error } = await supabase
    .from("hydroponic_tables")
    .insert([newTableData])
    .select()
    .single();

  if (error) {
    throw new Error("Gagal menambahkan meja");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lastHarvest1: data.last_harvest_1 ? new Date(data.last_harvest_1) : null,
    lastHarvest2: data.last_harvest_2 ? new Date(data.last_harvest_2) : null,
    lastWaterChange1: data.last_water_change_1
      ? new Date(data.last_water_change_1)
      : null,
    lastWaterChange2: data.last_water_change_2
      ? new Date(data.last_water_change_2)
      : null,
    phValue: data.ph_value || null,
    ppmValue: data.ppm_value || null,
    lastMeasured: data.last_measured_at
      ? new Date(data.last_measured_at)
      : null,
    nutrient_ml: data.nutrient_ml || 0, // Add missing nutrient_ml
  };
}

// Update status panen (menggeser panen 2 ke panen 1, dan set panen 2 sebagai tanggal sekarang)
export async function updateHarvest(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  // Ambil data meja saat ini untuk mendapatkan nilai panen 2
  const { data: tableData, error: fetchError } = await supabase
    .from("hydroponic_tables")
    .select("last_harvest_2")
    .eq("id", tableId)
    .single();

  if (fetchError) {
    throw new Error("Gagal mendapatkan data meja");
  }

  const now = new Date().toISOString();

  // Update meja dengan menggeser panen 2 ke panen 1, dan set panen 2 sebagai now
  const { error: updateError } = await supabase
    .from("hydroponic_tables")
    .update({
      last_harvest_1: tableData.last_harvest_2 || null, // Panen 2 lama menjadi Panen 1
      last_harvest_2: now, // Panen 2 baru
    })
    .eq("id", tableId);

  if (updateError) {
    throw new Error("Gagal update status panen");
  }

  // Catat event
  const { error: eventError } = await supabase.from("events").insert([
    {
      table_id: tableId,
      event_type: "harvest",
      created_at: now,
    },
  ]);

  if (eventError) {
    // Silently handle event error
    console.warn("Catatan: Gagal mencatat riwayat panen di event log");
  }
}

// Update status ganti air (menggeser ganti air 2 ke ganti air 1, dan set ganti air 2 sebagai tanggal sekarang)
export async function updateWaterChange(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  // Ambil data meja saat ini untuk mendapatkan nilai ganti air 2
  const { data: tableData, error: fetchError } = await supabase
    .from("hydroponic_tables")
    .select("last_water_change_2")
    .eq("id", tableId)
    .single();

  if (fetchError) {
    throw new Error("Gagal mendapatkan data meja");
  }

  const now = new Date().toISOString();

  // Update meja dengan menggeser ganti air 2 ke ganti air 1, dan set ganti air 2 sebagai now
  const { error: updateError } = await supabase
    .from("hydroponic_tables")
    .update({
      last_water_change_1: tableData.last_water_change_2 || null, // Ganti air 2 lama menjadi Ganti air 1
      last_water_change_2: now, // Ganti air 2 baru
    })
    .eq("id", tableId);

  if (updateError) {
    throw new Error("Gagal update status ganti air");
  }

  // Catat event
  const { error: eventError } = await supabase.from("events").insert([
    {
      table_id: tableId,
      event_type: "water_change",
      created_at: now,
    },
  ]);

  if (eventError) {
    // Silently handle event error
    console.warn("Catatan: Gagal mencatat riwayat ganti air di event log");
  }
}

// Hapus meja
export async function deleteTable(tableId: string): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  const { error } = await supabase
    .from("hydroponic_tables")
    .delete()
    .eq("id", tableId);

  if (error) {
    throw new Error("Gagal menghapus meja");
  }
}

// Update nilai PH dan PPM
export async function updatePhPpm(
  tableId: string,
  phValue: number | null,
  ppmValue: number | null
): Promise<void> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  // Persiapkan data update
  const updateData: TableUpdateData = {};
  if (phValue !== undefined && phValue !== null) {
    updateData.ph_value = phValue;
  }
  if (ppmValue !== undefined && ppmValue !== null) {
    updateData.ppm_value = ppmValue;
  }

  // Jika tidak ada data yang diupdate, batal
  if (Object.keys(updateData).length === 0) {
    return;
  }

  // Tambahkan waktu pengukuran
  const now = new Date().toISOString();
  updateData.last_measured_at = now;

  // Update tabel
  const { error: updateError } = await supabase
    .from("hydroponic_tables")
    .update(updateData)
    .eq("id", tableId);

  if (updateError) {
    throw new Error(`Gagal update nilai PH/PPM: ${updateError.message}`);
  }

  try {
    const { error: historyError } = await supabase
      .from("measurement_history")
      .insert([
        {
          table_id: tableId,
          ph_value: phValue,
          ppm_value: ppmValue,
          measured_at: now,
        },
      ]);

    if (historyError) {
      console.error(
        "Gagal mencatat riwayat pengukuran:",
        JSON.stringify(historyError)
      );
    }
  } catch (insertError) {
    console.error("Error saat menyimpan riwayat:", insertError);
  }
}

// Mengambil riwayat pengukuran PH dan PPM
export async function getMeasurementHistory(
  tableId: string
): Promise<MeasurementData[]> {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User tidak terautentikasi");
  }

  // Verifikasi bahwa meja milik user ini
  const { data: tableData, error: tableError } = await supabase
    .from("hydroponic_tables")
    .select("id")
    .eq("id", tableId)
    .eq("user_id", user.id)
    .single();

  if (tableError || !tableData) {
    throw new Error("Meja tidak ditemukan atau Anda tidak memiliki akses");
  }

  // Untuk sementara, kembalikan array kosong karena tabel mungkin belum ada
  return [];

  /* 
  // Aktifkan kembali setelah tabel measurement_history dibuat
  // Ambil riwayat pengukuran
  const { data, error } = await supabase
    .from('measurement_history')
    .select('*')
    .eq('table_id', tableId)
    .order('measured_at', { ascending: false });
    
  if (error) {
    throw new Error('Gagal mengambil riwayat pengukuran');
  }
  
  return data || [];
  */
}

// Fungsi baru untuk menambah nutrisi
export async function addNutrientToTable(
  tableId: string,
  amountToAdd: number
): Promise<HydroponicTable | null> {
  const user = getCurrentUser();

  if (!user) {
    console.error("User tidak terautentikasi");
    return null;
  }

  // Pertama, ambil nilai nutrient_ml saat ini
  const { data: currentTable, error: fetchError } = await supabase
    .from("hydroponic_tables")
    .select("nutrient_ml")
    .eq("id", tableId)
    .eq("user_id", user.id) // Add user verification
    .single();

  if (fetchError || !currentTable) {
    console.error("Error fetching current nutrient level:", fetchError);
    return null;
  }

  const currentNutrientMl = currentTable.nutrient_ml || 0;
  const newNutrientMl = currentNutrientMl + amountToAdd;

  // Kemudian, update dengan nilai baru
  const { data, error: updateError } = await supabase
    .from("hydroponic_tables")
    .update({ nutrient_ml: newNutrientMl })
    .eq("id", tableId)
    .eq("user_id", user.id) // Add user verification
    .select("*") // Select all columns
    .single();

  if (updateError) {
    console.error("Error adding nutrient to table:", updateError);
    return null;
  }

  // Convert Supabase data to HydroponicTable format
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lastHarvest1: data.last_harvest_1 ? new Date(data.last_harvest_1) : null,
    lastHarvest2: data.last_harvest_2 ? new Date(data.last_harvest_2) : null,
    lastWaterChange1: data.last_water_change_1
      ? new Date(data.last_water_change_1)
      : null,
    lastWaterChange2: data.last_water_change_2
      ? new Date(data.last_water_change_2)
      : null,
    phValue: data.ph_value || null,
    ppmValue: data.ppm_value || null,
    lastMeasured: data.last_measured_at
      ? new Date(data.last_measured_at)
      : null,
    nutrient_ml: data.nutrient_ml || 0,
  };
}

// Fungsi baru untuk mereset nutrisi
export async function resetNutrientForTable(
  tableId: string
): Promise<HydroponicTable | null> {
  const user = getCurrentUser();

  if (!user) {
    console.error("User tidak terautentikasi");
    return null;
  }

  const { data, error } = await supabase
    .from("hydroponic_tables")
    .update({ nutrient_ml: 0 })
    .eq("id", tableId)
    .eq("user_id", user.id) // Add user verification
    .select("*") // Select all columns
    .single();

  if (error) {
    console.error("Error resetting nutrient for table:", error);
    return null;
  }

  // Convert Supabase data to HydroponicTable format
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    lastHarvest1: data.last_harvest_1 ? new Date(data.last_harvest_1) : null,
    lastHarvest2: data.last_harvest_2 ? new Date(data.last_harvest_2) : null,
    lastWaterChange1: data.last_water_change_1
      ? new Date(data.last_water_change_1)
      : null,
    lastWaterChange2: data.last_water_change_2
      ? new Date(data.last_water_change_2)
      : null,
    phValue: data.ph_value || null,
    ppmValue: data.ppm_value || null,
    lastMeasured: data.last_measured_at
      ? new Date(data.last_measured_at)
      : null,
    nutrient_ml: data.nutrient_ml || 0,
  };
}
