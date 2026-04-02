import { Subscription } from './subscription.model';

export interface Client {
  id: number;
  createdById: number;
  nombre: string;
  empresa?: string;
  rucDni?: string;
  whatsapp?: string;
  email?: string;
  notas?: string;
  createdAt?: string;
  subscriptions?: Subscription[];
}
