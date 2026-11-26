import { CategoriesManager } from "@/app/admin/categories/_components/CategoriesManager";

export const metadata = {
  title: "Gestión de Categorías | Panel Admin",
  description: "Administra y organiza las categorías de productos de la tienda.",
};

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
