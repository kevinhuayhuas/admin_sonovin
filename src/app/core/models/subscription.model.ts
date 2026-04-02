import { Client } from './client.model';
import { ServiceItem } from './service.model';

export interface Subscription {
  id: number;
  clientId: number;
  serviceId: number;
  dominio?: string;
  proveedorDominio?: string;
  gestionadoPorMi: boolean;
  costoAnual: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO' | 'CANCELADO';
  createdAt?: string;
  client?: Client;
  service?: ServiceItem;
}
