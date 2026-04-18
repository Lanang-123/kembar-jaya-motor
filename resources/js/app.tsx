import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import AppLayout from './layout/AppLayout';

createInertiaApp({
    title: (title) => `${title} - Kembar Jaya Motor`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'))
        .then((page: any) => {
            if (page.default.layout === undefined) {
                page.default.layout = (pageContent: React.ReactNode) => <AppLayout>{pageContent}</AppLayout>;
            }

            return page;
        }),

    setup({ el, App, props }) {
        if (typeof window === 'undefined') {
            return <App {...props} />;
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#FBBF24',
    },
});
