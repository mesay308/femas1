'use client';

import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';

export default function EditCategoryPage() {
    const params = useParams();
    const id = params?.id as string;

    return <CategoryForm id={id} />;
}
