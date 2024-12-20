/// import * as Autodesk from "@types/forge-viewer";
import './extensions/LoggerExtension.js';
import './extensions/SummaryExtension.js';
import './extensions/DataGridExtension.js';
import './extensions/PhasePlanExtension.js';
import './extensions/BoqExtension.js';
import './extensions/DataExportExtension.js';

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);        
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
            Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, function () {
            const config = {
                extensions: ['Autodesk.DocumentBrowser','LoggerExtension','SummaryExtension','DataGridExtension','PhasePlanExtension','BoqExtension','DataExportExtension']
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}


export function loadModel(viewer, urn) {
    function onDocumentLoadSuccess(doc) {
        viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
        viewer.loadExtension('Autodesk.VisualClusters', {attribName: 'Assembly Name'});
    }
    function onDocumentLoadFailure(code, message) {
        alert('Could not load model. See console for more details.');
        console.error(message);
    }
    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
}