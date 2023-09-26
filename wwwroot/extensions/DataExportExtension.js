import { BaseExtension } from './BaseExtension.js';
import { DataExportPanel } from './DataExportPanel.js';

class DataExportExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    async load() {
        super.load();
        await Promise.all([
            this.loadScript('https://unpkg.com/tabulator-tables@4.9.3/dist/js/tabulator.min.js', 'Tabulator'),
            this.loadStylesheet('https://unpkg.com/tabulator-tables@4.9.3/dist/css/tabulator_midnight.min.css')
        ]);
        console.log('DataExportExtension loaded.');
        return true;
    }

    unload() {
        super.unload();
        if (this._button) {
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('DataExportExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new DataExportPanel(this, 'dataexport-panel', 'Data Export', { x: 10, y: 10 });
        this._button = this.createToolbarButton('dataexport-button', 'https://img.icons8.com/ios-glyphs/30/down--v1.png', 'Show Data Export');   
        this._button.onClick = () => {
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._panel.isVisible() && this.viewer.model) {
                this.update();
            }
        };
    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._panel && this._panel.isVisible()) {
            this.update();
        }
    }

    async update() {
        const dbids = await this.findLeafNodes(this.viewer.model);
        this._panel.update(this.viewer.model, dbids);
    }

    async updatemodel(){
        this._panel.updatemodel(this.viewer.model)
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('DataExportExtension', DataExportExtension);