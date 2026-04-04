import { Head } from "@inertiajs/react";

interface MetadataProps {
    title: string;
}

export default function Metadata({ title }: MetadataProps) {
    return (
        <Head title={title} />
    );
}
