import { User } from '../entities/users/entities.users'
import { IdentityProvider, IdentityProviderUser, UserIngressBindings } from './ingress.entities'

export interface ProcessNewUserEnrollment {
  (idpAccount: IdentityProviderUser, idp: IdentityProvider): Promise<{ mageAccount: User, ingressBindings: UserIngressBindings }>
}