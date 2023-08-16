import { BaseExtension } from './BaseExtension.js';
import { BoqPanel } from './BoqPanel.js';

const BOQ_PROPS = ['ED_BoQCode'];

class BoqExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    load() {
        super.load();
        console.log('BoqExtension loaded.');
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
        console.log('BoqExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new BoqPanel(this, 'model-boq-panel', 'Boq Summary');
        this._button = this.createToolbarButton('boq-button', 'https://img.icons8.com/ios-filled/50/receipt.png', 'Show BoQ Summary');
        this._button.onClick = () => {
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._panel.isVisible()) {
                this.update();
            }
        };
    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        this.update();
    }

    onSelectionChanged(model, dbids) {
        super.onSelectionChanged(model, dbids);
        this.update();
    }

    onIsolationChanged(model, dbids) {
        super.onIsolationChanged(model, dbids);
        this.update();
    }

    async update() {
        if (this._panel) {
            const selectedIds = this.viewer.getSelection();
            const isolatedIds = this.viewer.getIsolatedNodes();
            if (selectedIds.length > 0) { // If any nodes are selected, compute the aggregates for them
                this._panel.updateGroupedByUnit(this.viewer.model, selectedIds, BOQ_PROPS);
            } else if (isolatedIds.length > 0) { // Or, if any nodes are isolated, compute the aggregates for those
                this._panel.updateGroupedByUnit(this.viewer.model, isolatedIds, BOQ_PROPS);
            } else { // Otherwise compute the aggregates for all nodes
                const dbids = await this.findLeafNodes(this.viewer.model);
                this._panel.updateGroupedByUnit(this.viewer.model, dbids, BOQ_PROPS);
            }
        }
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('BoqExtension', BoqExtension);