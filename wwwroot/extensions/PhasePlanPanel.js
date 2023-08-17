const ACTIVITY_PROPERTY = 'CN_ActivityID';
const PHASING_DATA_URL = './extensions/phasing.csv';

export class PhasePlanPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 600) + 'px';
        this.container.style.height = '600px';
        this.container.style.resize = 'none';
    }

    initialize() {// Create a new <div> element
        
        
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);

        //this.content = document.createElement('div');
        //this.content.style.height = '350px';
        //this.content.style.backgroundColor = 'white';
        //this.content.innerHTML = `<div class="datagrid-container" style="position: relative; height: 200px;"></div>`;
        //this.container.appendChild(this.content);


        const divElement = document.createElement('div');

        // Set the attributes for the <div> element
        divElement.id = 'timeline';
        divElement.className = 'position-absolute';
        divElement.style.width = '97%';
        divElement.style.height = '90%'
        divElement.style.right = '0';
        divElement.style.backgroundColor = 'white';
        divElement.style.overflowY = scroll;

        // Create a <label> element
        const labelElement = document.createElement('label');

        // Set the attributes for the <label> element
        labelElement.id = 'timeline-label';
        labelElement.htmlFor = 'timeline-input';
        labelElement.className = 'form-label';
        labelElement.textContent = 'Timeline';
        labelElement.style.width = '500px';

        // Create an <input> element
        const inputElement = document.createElement('input');

        // Set the attributes for the <input> element
        inputElement.type = 'range';
        inputElement.className = 'form-range';
        inputElement.style.width = '500px';
        inputElement.min = '0';
        inputElement.max = '100';
        inputElement.id = 'timeline-input';

        // Append the <label> and <input> elements to the <div> element
        divElement.appendChild(labelElement);
        divElement.appendChild(inputElement);

        // Append the <div> element to the document body or any desired parent element
        // For example, appending to the body:
        this.container.appendChild(divElement);
        
                
    }

    async update(viewer,model) {
        
            
        const activityMap = await getActivityMap(model, ACTIVITY_PROPERTY);
        const phasingData = await getPhasingData();
        setupTimelineInput(viewer, phasingData, activityMap);
        setupTimelineChart(viewer, phasingData, activityMap);
    
    }

    async deletesvg() {
        var timelineDiv = document.getElementById("timeline");
        var svgElement = timelineDiv.querySelectorAll('svg');
        timelineDiv.removeChild(svgElement[0]);
        
    }
}

    

async function getPhasingData() {
    const resp = await fetch(PHASING_DATA_URL);
    if (!resp.ok) {
        alert('Could not retrieve phasing data.');
        console.error(await resp.text());
        return;
    }
    const lines = (await resp.text()).split('\n');
    lines.shift(); // Remove the header row
    let result = {
        groups: {},
        startDate: null,
        endDate: null
    };
    for (const line of lines) {
        const tokens = line.trim().split(',');
        const groupName = tokens[0].trim();
        const startDate = new Date(tokens[1]);
        const endDate = new Date(tokens[3]);
        if (!result.startDate || startDate < result.startDate) {
            result.startDate = startDate;
        }
        if (!result.endDate || endDate > result.endDate) {
            result.endDate = endDate;
        }
        result.groups[groupName] = result.groups[groupName] || [];
        result.groups[groupName].push({
            startDate,
            endDate,
            type: tokens[4].trim(),
            description: tokens[5].trim()
        });
    }
    return result;
}

async function getActivityMap(model, propertyName) {
    function userFunction(pdb, attrName) {
        let map = new Map(); // mapping of activityID to list of dbIDs
        pdb.enumObjects(dbid => {
            const res = pdb.getObjectProperties(dbid, [attrName]);
            if (res && res.properties && res.properties.length > 0) {
                const activityId = res.properties[0].displayValue;
                const list = map.has(activityId) ? map.get(activityId) : [];
                list.push(dbid);
                map.set(activityId, list);
            }
        });
        return map;
    }
    return model.getPropertyDb().executeUserFunction(userFunction, propertyName);
}

function setupTimelineInput(viewer, phasingData, activityMap) {
    const days = Math.round((phasingData.endDate.getTime() - phasingData.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const input = document.getElementById('timeline-input');
    const label = document.getElementById('timeline-label');
    input.min = 0;
    input.max = days;
    input.oninput = () => {
        const currentDate = new Date(phasingData.startDate.getTime() + input.value * 24 * 60 * 60 * 1000);
        label.innerText = currentDate.toLocaleDateString();
        // Color, show, and hide objects based on custom rules
        viewer.model.clearThemingColors();
        viewer.showAll();
        const yellow = new THREE.Vector4(1.0, 1.0, 0.0, 0.5);
        const red = new THREE.Vector4(1.0, 0.0, 0.0, 0.5);
        const blue = new THREE.Vector4(0.0, 0.0, 1.0, 0.5);
        for (const [group, activities] of Object.entries(phasingData.groups)) {
            for (const activity of activities) {
                const dbids = activityMap.get(group) || [];
                if (activity.type === 'Construct') {
                    if (currentDate < activity.startDate) {
                        viewer.hide(dbids);
                        break;
                    } else if (currentDate <= activity.endDate) {
                        viewer.show(dbids);
                        for (const dbid of dbids) {
                            viewer.setThemingColor(dbid, yellow);
                        }
                        break;
                    } else {
                        viewer.show(dbids);
                    }
                } else if (activity.type === 'Demo') {
                    if (currentDate < activity.startDate) {
                        viewer.show(dbids);
                        break;
                    } else if (currentDate <= activity.endDate) {
                        viewer.show(dbids);
                        for (const dbid of dbids) {
                            viewer.setThemingColor(dbid, red);
                        }
                        break;
                    } else {
                        viewer.hide(dbids);
                    }
                } else if (activity.type === 'Temp') {
                    if (currentDate < activity.startDate) {
                        viewer.hide(dbids);
                        break;
                    } else if (currentDate <= activity.endDate) {
                        viewer.show(dbids);
                        for (const dbid of dbids) {
                            viewer.setThemingColor(dbid, blue);
                        }
                        break;
                    } else {
                        viewer.show(dbids);
                    }
                }
            }
        }
    };
}

function setupTimelineChart(viewer, phasingData, activityMap) {
    const timelineData = Object.keys(phasingData.groups).map(group => {
        return {
            label: group,
            times: phasingData.groups[group].map(activity => ({
                starting_time: activity.startDate.getTime(),
                ending_time: activity.endDate.getTime(),
                activity_type: activity.type
            }))
        };
    });
    const width = 500;
    const colors = d3.scale.ordinal().range(['#E6DB2C','#E63E6A','#73C9E6']).domain(['Construct','Demo','Temp']);
    const chart = d3.timeline()
        .colors(colors)
        .colorProperty('activity_type')
        .width(width)
        .stack()
        .margin({ left: 0, right: 0, top: 0, bottom: 0 })
        .tickFormat({
            tickTime: d3.time.months,
            tickInterval: 1,
            tickSize: 4
        })
        .click(function (d, i, datum) {
            viewer.clearThemingColors();
            viewer.isolate(activityMap.get(datum.label));
            viewer.select(activityMap.get(datum.label))
        });
    d3.select('#timeline').append('svg').attr('width', width).datum(timelineData).call(chart);
}






    
