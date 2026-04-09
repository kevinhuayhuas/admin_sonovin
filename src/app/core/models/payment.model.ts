import { Subscription } from './subscription.model';
import { User } from './user.model';

export interface Payment {
  id: number;
  subscriptionId: number;
  monto: number;
  metodoPago: 'TRANSFERENCIA' | 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'OTRO';
  numeroComprobante?: string;
  nota?: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADO';
  fechaPago?: string;
  fechaVencimientoPago: string;
  renovacionAplicada: boolean;
  createdById: number;
  createdAt?: string;
  subscription?: Subscription;
  createdBy?: User;
}
