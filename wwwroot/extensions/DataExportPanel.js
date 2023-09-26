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
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const activityprogress = props.find(p => p.displayName === 'CN_ActivityProgress')?.displayValue;
        const activityid = props.find(p => p.displayName === 'CN_ActivityID')?.displayValue;
        const activityname = props.find(p => p.displayName === 'CN_ActivityName')?.displayValue;
        const plannedstartdate = props.find(p => p.displayName === 'ED_PlannedStartDate')?.displayValue;
        return { dbid, name, activityprogress, activityid, activityname, plannedstartdate };
    },

};

const DATAGRID_CONFIG2 = {
    requiredProps: ['name', 'CN_ActivityID', 'CN_ActivityProgress','CN_ActivityName','ED_PlannedStartDate'], // Which properties should be requested for each object
    columns: [ 
        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, cellClick:function(e, cell)
        {
        cell.getRow().toggleSelect();
        }},// Definition of individual grid columns (see http://tabulator.info for more details)
        { title: 'ID', field: 'dbid' },
        { title: 'Name', field: 'name', width: 150 }, 
        { title: 'Activity Id', field: 'activityid'},
        { title: 'Activity Progress', field: 'activityprogress', hozAlign: 'left', formatter: 'progress' },
        { title: 'Activity Name', field: 'activityname'},
        { title: 'Planned Start Date', field: 'plannedstartdate'}
    ],
    //groupBy: 'activityid', // Optional column to group by
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const activityid = props.find(p => p.displayName === 'CN_ActivityID')?.displayValue;
        const activityprogress = props.find(p => p.displayName === 'CN_ActivityProgress')?.displayValue;
        const activityname = props.find(p => p.displayName === 'CN_ActivityName')?.displayValue;
        const plannedstartdate = props.find(p => p.displayName === 'ED_PlannedStartDate')?.displayValue;
        return { dbid, name, activityid, activityprogress, activityname, plannedstartdate };
    },
};

const DATAGRID_CONFIG3 = {
    requiredProps: ['name', 'CN_ActivityID', 'CN_ActivityProgress','CN_ActivityName','ED_PlannedStartDate','ED_PlannedEndDate','CN_ActivityStartDate','CN_ActivityEndDate'], // Which properties should be requested for each object
    columns: [ 
        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, cellClick:function(e, cell)
        {
        cell.getRow().toggleSelect();
        }},// Definition of individual grid columns (see http://tabulator.info for more details)
        { title: 'ID', field: 'dbid' },
        { title: 'Name', field: 'name', width: 150 }, 
        { title: 'Activity Id', field: 'activityid'},
        { title: 'Activity Progress', field: 'activityprogress', hozAlign: 'left', formatter: 'progress' },
        { title: 'Activity Name', field: 'activityname'},
        { title: 'Planned Start Date', field: 'plannedstartdate'},
        { title: 'Planned End Date', field: 'plannedenddate'},
        { title: 'Activity Start Date', field: 'activitystartdate'},
        { title: 'Activity End Date', field: 'activityenddate'}
    ],
    //groupBy: 'activityid', // Optional column to group by
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const activityid = props.find(p => p.displayName === 'CN_ActivityID')?.displayValue;
        const activityprogress = props.find(p => p.displayName === 'CN_ActivityProgress')?.displayValue;
        const activityname = props.find(p => p.displayName === 'CN_ActivityName')?.displayValue;
        const plannedstartdate = props.find(p => p.displayName === 'ED_PlannedStartDate')?.displayValue;
        const plannedenddate = props.find(p => p.displayName === 'ED_PlannedEndDate')?.displayValue;
        const activitystartdate = props.find(p => p.displayName === 'CN_ActivityStartDate')?.displayValue;
        const activityenddate = props.find(p => p.displayName === 'CN_ActivityEndDate')?.displayValue;
        return { dbid, name, activityid, activityprogress, activityname, plannedstartdate, plannedenddate, activitystartdate,activityenddate };
    },
};



export class DataExportPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 100) + 'px';
        this.container.style.resize = 'none';

        
    }


    initialize() {
        this.currentConfig = DATAGRID_CONFIG;
      

        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);

        this.content = document.createElement('div');
        this.content.style.height = '50px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `<div class="container-table" style="position: relative; height: 10px;"></div>`;
        this.container.appendChild(this.content);
        
        // Create a custom HTML button element
        const buttonContainer = document.createElement('div');
        buttonContainer.style.margin = '1px';

        const QAQCButton = document.createElement('button');
        QAQCButton.textContent = 'QAQC Export';
        QAQCButton.style.margin = '4px';
        QAQCButton.style.padding = '5px 10px';
        QAQCButton.style.backgroundColor = '#007BFF';
        QAQCButton.style.color = 'white';
        QAQCButton.style.border = 'none';
        QAQCButton.style.borderRadius = '4px';

        const export4DInfoButton = document.createElement('button');
        export4DInfoButton.textContent = '4D Info Export';
        export4DInfoButton.style.margin = '4px';
        export4DInfoButton.style.padding = '5px 10px';
        export4DInfoButton.style.backgroundColor = '#007BFF';
        export4DInfoButton.style.color = 'white';
        export4DInfoButton.style.border = 'none';
        export4DInfoButton.style.borderRadius = '4px';

        const exportQTOInfoButton = document.createElement('button');
        exportQTOInfoButton.textContent = 'QTO Export';
        exportQTOInfoButton.style.margin = '4px';
        exportQTOInfoButton.style.padding = '5px 10px';
        exportQTOInfoButton.style.backgroundColor = '#007BFF';
        exportQTOInfoButton.style.color = 'white';
        exportQTOInfoButton.style.border = 'none';
        exportQTOInfoButton.style.borderRadius = '4px';

        const exportMPDTInfoButton = document.createElement('button');
        exportMPDTInfoButton.textContent = 'MPDT Export';
        exportMPDTInfoButton.style.margin = '4px';
        exportMPDTInfoButton.style.padding = '5px 10px';
        exportMPDTInfoButton.style.backgroundColor = '#007BFF';
        exportMPDTInfoButton.style.color = 'white';
        exportMPDTInfoButton.style.border = 'none';
        exportMPDTInfoButton.style.borderRadius = '4px';


        buttonContainer.appendChild(QAQCButton);
        buttonContainer.appendChild(export4DInfoButton);
        buttonContainer.appendChild(exportQTOInfoButton);
        buttonContainer.appendChild(exportMPDTInfoButton);

        // Append the custom button to the panel's DOM element
        this.content.appendChild(buttonContainer);

        this.table = new Tabulator('.container-table',{
            height: '1px',
            layout: 'fitColumns',
            columns: this.currentConfig.columns,
        });


        QAQCButton.addEventListener('click', () => {

            
            this.currentConfig = DATAGRID_CONFIG2;
            
            this.table.download("xlsx", "QAQC_data.xlsx", {sheetName:"QAQC Data"});
        });

        export4DInfoButton.addEventListener('click', () => {

            this.currentConfig = DATAGRID_CONFIG3;
             
            this.table.download("xlsx", "4D_data.xlsx", {sheetName:"4D Data"});
        });

        exportQTOInfoButton.addEventListener('click', () => {
            

            this.table.download("xlsx", "QTO_data.xlsx", {sheetName:"QTO Data"});
        });

        exportMPDTInfoButton.addEventListener('click', () => {
            

            this.table.download("xlsx", "MPDT_data.xlsx", {sheetName:"MPDT Data"});
        });

    }



    update(model,dbids) {
        console.log(this.currentConfig);

        model.getBulkProperties(dbids, { propFilter: this.currentConfig.requiredProps }, (results) => {
            this.table.replaceData(results.map((result) => this.currentConfig.createRow(result.dbId, result.name, result.properties)));
        }, (err) => {
            console.error(err);
        });
        
    }




}

