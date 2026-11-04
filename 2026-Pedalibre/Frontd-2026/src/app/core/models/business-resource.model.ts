export type BusinessFieldType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

export interface BusinessField {
  key: string;
  label: string;
  type: BusinessFieldType;
  required?: boolean;
  minimum?: number;
  defaultValue?: string | number | boolean | null;
  create?: boolean;
  update?: boolean;
}

export interface BusinessResource {
  title: string;
  description: string;
  endpoint: string;
  fields: BusinessField[];
  createEnvelope?: string;
  updateEnvelope?: string;
  listEnvelope?: string;
  detailEnvelope?: string;
  updateMethod?: 'PATCH' | 'PUT';
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  deleteLabel?: string;
}

export type BusinessRecord = Record<string, unknown> & { id: number };
