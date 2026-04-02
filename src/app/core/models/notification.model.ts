import { Subscription } from './subscription.model';

export interface Notification {
  id: number;
  subscriptionId: number;
  tipo: '30_DIAS' | '15_DIAS' | '7_DIAS' | 'VENCIDO';
  enviado: boolean;
  leido: boolean;
  clienteNotificado: boolean;
  fechaEnvio?: string;
  fechaLectura?: string;
  createdAt?: string;
  subscription?: Subscription;
}
