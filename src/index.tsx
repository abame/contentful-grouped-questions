import ReactDOM from "react-dom/client";

import { FieldExtensionSDK, init, locations } from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

import Field from './components/Field';

init((sdk) => {
    const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

    const ComponentLocationSettings = [
        {
            location: locations.LOCATION_ENTRY_FIELD,
            component: <Field sdk={sdk as FieldExtensionSDK} />,
        },
    ];

    // Select a component depending on a location in which the app is rendered.
    ComponentLocationSettings.forEach((componentLocationSetting) => {
        if (sdk.location.is(componentLocationSetting.location)) {
            root.render(componentLocationSetting.component);
        }
    });
});
