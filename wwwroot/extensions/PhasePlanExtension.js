import { BaseExtension } from './BaseExtension.js';
import { PhasePlanPanel } from './PhasePlanPanel.js';



class PhasePlanExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    async load() {
        super.load();
        console.log('PhasePlanExtension loaded.');
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
        console.log('PhasePlanExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new PhasePlanPanel(this, 'Phase Planning-panel', 'Phase Planing', { x: 10, y: 10 });
        this._button = this.createToolbarButton('Phase Planning-button', 'https://img.icons8.com/time', 'Show Phase Planning');   
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
        this._panel.update(this.viewer,this.viewer.model);
        
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('PhasePlanExtension', PhasePlanExtension);