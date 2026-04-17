import api from "./api";

export interface SheetResult {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

export interface UploadResult {
  categories: SheetResult;
  stages: SheetResult;
  defects: SheetResult;
  parts: SheetResult;
}

export const uploadMasterData = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/master-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};
