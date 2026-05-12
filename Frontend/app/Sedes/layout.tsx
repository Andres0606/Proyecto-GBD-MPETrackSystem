import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sedes | MPE SYSTEM',
  description: 'Encuentra nuestras sedes en Villavicencio, Restrepo, Acacias, Guamal, Granada y Puerto López. Estamos cerca de ti para facilitarte tus trámites de tránsito.',
};

export default function SedesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
