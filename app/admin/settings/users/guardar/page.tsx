import { redirect } from 'next/navigation';

export default function GuardarUserPage() {
  redirect('/admin/settings/users');
}
