const DATAGRID_CONFIG = {
    requiredProps: ['name', 'CN_ActivityProgress', 'CN_ActivityID','CN_ActivityName','ED_PlannedStartDate'], // Which properties should be requested for each object
    columns: [ 
        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, cellClick:function(e, cell)
        {
        cell.getRow().toggleSelect();
        }},// Definition of individual grid columns (see http://tabulator.info for more details)
        { title: 'ID', field: 'dbid' },
        { title: 'Name', field: 'name', width: 150 },
        { title: 'Activity Progress', field: 'activityprogress', hozAlign: 'left', formatter: 'progress' },
        { title: 'Activity Id', field: 'activityid'},
        { title: 'Activity Name', field: 'activityname'},
        { title: 'Planned Start Date', field: 'plannedstartdate'}
    ],
    //groupBy: 'activityid', // Optional column to group by
    selectable: true, // Enable multiple row selection
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const activityprogress = props.find(p => p.displayName === 'CN_ActivityProgress')?.displayValue;
        const activityid = props.find(p => p.displayName === 'CN_ActivityID')?.displayValue;
        const activityname = props.find(p => p.displayName === 'CN_ActivityName')?.displayValue;
        const plannedstartdate = props.find(p => p.displayName === 'ED_PlannedStartDate')?.displayValue;
        return { dbid, name, activityprogress, activityid, activityname, plannedstartdate };
    },

    onRowClick: (row, viewer) => {
    viewer.isolate([row.dbid]);
    viewer.fitToView([row.dbid]);

  }
    
};

export class DataGridPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 1000) + 'px';
        this.container.style.height = (options.height || 450) + 'px';
        this.container.style.resize = 'none';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);

        const filterdiv = document.createElement('div');
        filterdiv.style.height='30px';
        filterdiv.style.backgroundColor = 'white';
        
        const filterFieldSelect = document.createElement('select');
        filterFieldSelect.id = 'filter-field';

        const filterFieldOptions = ['', 'name', 'activityprogress', 'activityid', 'activityname', 'plannedstartdate'];
        for (const optionValue of filterFieldOptions) {
            const optionElement = document.createElement('option');
            optionElement.value = optionValue;
            optionElement.textContent = optionValue ? optionValue : '';
            filterFieldSelect.appendChild(optionElement);
        }

        // Create and configure the filter-type select element
        const filterTypeSelect = document.createElement('select');
        filterTypeSelect.id = 'filter-type';

        // Create and add options to the filter-type select element
        const filterTypeOptions = ['=', '<', '<=', '>', '>=', '!=', 'like'];
        for (const optionValue of filterTypeOptions) {
        const optionElement = document.createElement('option');
        optionElement.value = optionValue;
        optionElement.textContent = optionValue;
        filterTypeSelect.appendChild(optionElement);
        }

        // Create and configure the filter-value input element
        const filterValueInput = document.createElement('input');
        filterValueInput.id = 'filter-value';
        filterValueInput.type = 'text';
        filterValueInput.placeholder = 'value to filter';

        // Create the "Clear Filter" button element
        const filterClearButton = document.createElement('button');
        filterClearButton.id = 'filter-clear';
        filterClearButton.textContent = 'Clear Filter';

        // Append all elements to the div element
        filterdiv.appendChild(filterFieldSelect);
        filterdiv.appendChild(filterTypeSelect);
        filterdiv.appendChild(filterValueInput);
        filterdiv.appendChild(filterClearButton);

        this.container.appendChild(filterdiv);


        this.content = document.createElement('div');
        this.content.style.height = '400px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `<div class="datagrid-container" style="position: relative; height: 200px;"></div>`;
        this.container.appendChild(this.content);
        
        // Create a custom HTML button element
        const buttonContainer = document.createElement('div');
        buttonContainer.style.margin = '1px';

        const selectSelectedButton = document.createElement('button');
        selectSelectedButton.textContent = 'Select Checked';
        selectSelectedButton.style.margin = '4px';
        selectSelectedButton.style.padding = '5px 10px';
        selectSelectedButton.style.backgroundColor = '#007BFF';
        selectSelectedButton.style.color = 'white';
        selectSelectedButton.style.border = 'none';
        selectSelectedButton.style.borderRadius = '4px';

        const isolateSelectedButton = document.createElement('button');
        isolateSelectedButton.textContent = 'Isolate Checked';
        isolateSelectedButton.style.margin = '4px';
        isolateSelectedButton.style.padding = '5px 10px';
        isolateSelectedButton.style.backgroundColor = '#007BFF';
        isolateSelectedButton.style.color = 'white';
        isolateSelectedButton.style.border = 'none';
        isolateSelectedButton.style.borderRadius = '4px';

        const exportxlsxButton = document.createElement('button');
        exportxlsxButton.textContent = 'Export XLSX';
        exportxlsxButton.style.margin = '4px';
        exportxlsxButton.style.padding = '5px 10px';
        exportxlsxButton.style.backgroundColor = '#007BFF';
        exportxlsxButton.style.color = 'white';
        exportxlsxButton.style.border = 'none';
        exportxlsxButton.style.borderRadius = '4px';


        buttonContainer.appendChild(selectSelectedButton);
        buttonContainer.appendChild(isolateSelectedButton);
        buttonContainer.appendChild(exportxlsxButton);

        // Append the custom button to the panel's DOM element
        this.content.appendChild(buttonContainer);

        // See http://tabulator.info
        this.table = new Tabulator('.datagrid-container', {
            height: '310px',
            layout: 'fitColumns',
            columns: DATAGRID_CONFIG.columns,
            groupBy: DATAGRID_CONFIG.groupBy,

            rowClick: (e, row) => DATAGRID_CONFIG.onRowClick(row.getData(), this.extension.viewer)
            
        });

        selectSelectedButton.addEventListener('click', () => {
            const selectedRows = this.table.getSelectedRows();
            const selectedids = [];
    
            // Loop through the selected rows and access their data
            selectedRows.forEach((row) => {
            const rowDataid = row.getData().dbid;
            selectedids.push(rowDataid)
            });
            console.log('Selected row data ids:', selectedids);

            this.extension.viewer.select(selectedids);
            this.extension.viewer.fitToView(selectedids);
        });

        isolateSelectedButton.addEventListener('click', () => {
            const selectedRows = this.table.getSelectedRows();
            const selectedids = [];
    
            // Loop through the selected rows and access their data
            selectedRows.forEach((row) => {
            const rowDataid = row.getData().dbid;
            selectedids.push(rowDataid)
            });
            console.log('Selected row data ids:', selectedids);

            this.extension.viewer.isolate(selectedids);
            this.extension.viewer.fitToView(selectedids);
        });

        exportxlsxButton.addEventListener('click', () => {
            this.table.download("xlsx", "data.xlsx", {sheetName:"My Data"});
        });

    }


    update(model, dbids) {
        model.getBulkProperties(dbids, { propFilter: DATAGRID_CONFIG.requiredProps }, (results) => {
            this.table.replaceData(results.map((result) => DATAGRID_CONFIG.createRow(result.dbId, result.name, result.properties)));
        }, (err) => {
            console.error(err);
        });
        filterupd(this.table)
    }



}

function filterupd (table1){
    var fieldEl = document.getElementById("filter-field");
    var typeEl = document.getElementById("filter-type");
    var valueEl = document.getElementById("filter-value");

    //Custom filter example
    function customFilter(data){
        return data.car && data.rating < 3;
    }

    //Trigger setFilter function with correct parameters
    function updateFilter(){
    var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
    var typeVal = typeEl.options[typeEl.selectedIndex].value;

    var filter = filterVal == "function" ? customFilter : filterVal;

    if(filterVal == "function" ){
        typeEl.disabled = true;
        valueEl.disabled = true;
    }else{
        typeEl.disabled = false;
        valueEl.disabled = false;
    }

    if(filterVal){
        table1.setFilter(filter,typeVal, valueEl.value);
    }
    }

    //Update filters on value change
    document.getElementById("filter-field").addEventListener("change", updateFilter);
    document.getElementById("filter-type").addEventListener("change", updateFilter);
    document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    //Clear filters on "Clear Filters" button click
    document.getElementById("filter-clear").addEventListener("click", function(){
    fieldEl.value = "";
    typeEl.value = "=";
    valueEl.value = "";

    table1.clearFilter();
    });
}
