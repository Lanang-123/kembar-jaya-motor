import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';


createInertiaApp({
    title: (title) => `${title} - Kembar Jaya Motor`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ) as any,
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
