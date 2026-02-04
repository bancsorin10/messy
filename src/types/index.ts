export interface Cabinet {
  id: number;
  name: string;  
  description?: string;
  photo?: string;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  cabinet_id: number;
}

export interface APIResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
}

export type NavigationParamList = {
  CabinetsList: undefined;
  CabinetDetails: { cabinetId: number };
  AddCabinet: undefined;
  AddItem: { cabinetId?: number };
  BulkAddItems: { cabinetId: number };
  QRCodeDisplay: { type: 'cabinet' | 'item'; id: number; name: string };
  QRScanner: undefined;
  ItemDetails: { itemId?: number; item?: Item };
};