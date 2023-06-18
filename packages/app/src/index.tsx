import React from 'react';
import ReactDOM from 'react-dom/client';
import * as core from 'sa-core';
import './index.css';
import { registerAllMod } from './utils/registerMods';
import { dataProvider } from './utils/saDataProvider';

const container = document.getElementById('sa-app')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    const sac = window.sac;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).sac = { ...core, ...sac };

    core.HelperLoader();
    await dataProvider.init();

    const { default: SaMain } = await import('./App');

    root.render(
        <React.StrictMode>
            <SaMain />
        </React.StrictMode>
    );

    await registerAllMod();
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
        import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw'
    );
}

const wwwroot = `/seerh5.61.com/`;

fetch(`${wwwroot}app.js?t=${Date.now()}`)
    .then((r) => r.text())
    .then((appJs) => {
        (window as unknown as { wwwroot: string }).wwwroot = wwwroot;
        const script = document.createElement('script');
        while (appJs.startsWith('eval')) {
            appJs = eval(appJs.match(/eval([^)].*)/)![1]);
        }
        script.innerHTML = appJs;
        document.body.appendChild(script);
    });

window.addEventListener('seerh5_assistant_ready', renderApp);

core.CoreLoader();
