export class BoqPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(extension, id, title) {
        super(extension.viewer.container, id, title);
        this.extension = extension;
    }

    async update(model, dbids, propNames) {
        this.removeAllProperties();
        for (const propName of propNames) {
            
            const initialValue = { sum: 0, count: 0, min: Infinity, max: -Infinity };
            const aggregateFunc = (aggregate, value, property) => {
                return {
                    count: aggregate.count + 1,
                    sum: aggregate.sum + value,
                    min: Math.min(aggregate.min, value),
                    max: Math.max(aggregate.max, value),
                    units: property.units,
                    precision: property.precision
                };
            };
            const { sum, count, min, max, units, precision } = await this.aggregatePropertyValues(model, dbids, propName, aggregateFunc, initialValue);
            if (count > 0) {
                const category = propName;
                this.addProperty('Count', count, category);
                this.addProperty('Sum', this.toDisplayUnits(sum, units, precision), category);
                this.addProperty('Avg', this.toDisplayUnits((sum / count), units, precision), category);
                this.addProperty('Min', this.toDisplayUnits(min, units, precision), category);
                this.addProperty('Max', this.toDisplayUnits(max, units, precision), category);
            }
        }
    }

    async updateGroupedByUnit2(model, dbids, propNames) {
        this.removeAllProperties();
        for (const propName of propNames) {
            const initialValue = {}; // Initialize an empty object for grouping by units
            const aggregateFunc = (aggregatedValues, value, property, unit, boqCode) => {
                if (!aggregatedValues[unit]) {
                    aggregatedValues[unit] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
                }
                const aggregate = aggregatedValues[unit];
                return {
                    ...aggregatedValues,
                    [unit]: {
                        count: aggregate.count + 1,
                        sum: aggregate.sum + value,
                        min: Math.min(aggregate.min, value),
                        max: Math.max(aggregate.max, value),
                        units: property.units,
                        precision: property.precision,
                        boqCode: boqCode
                    }
                };
            };
            const groupedValues = await this.aggregatePropertyValues(model, dbids, propName, aggregateFunc, initialValue);
    
            // Add properties for each group
            for (const unit in groupedValues) {
                const group = groupedValues[unit];
                const boqCode = group.boqCode;
                //const category = `${propName} (${unit})  - BoQ ${boqCode}`;
                const category = `${propName}: ${boqCode} (${unit})`;
                this.addProperty(`Count (${unit})`, group.count, category);
                this.addProperty(`Sum (${unit})`, this.toDisplayUnits(group.sum, group.units, group.precision), category);
                this.addProperty(`Avg (${unit})`, this.toDisplayUnits(group.sum / group.count, group.units, group.precision), category);
                this.addProperty(`Min (${unit})`, this.toDisplayUnits(group.min, group.units, group.precision), category);
                this.addProperty(`Max (${unit})`, this.toDisplayUnits(group.max, group.units, group.precision), category);
            }
        }
    }

    async updateGroupedByUnit(model, dbids, propNames) {
        this.removeAllProperties();
        for (const propName of propNames) {
            const initialValue = {}; // Initialize an empty object for grouping by units and BoQ codes
            const aggregateFunc = (aggregatedValues, value, property, unit, boqCode, progress) => {
                if (!aggregatedValues[unit]) {
                    aggregatedValues[unit] = {};
                }
                if (!aggregatedValues[unit][boqCode]) {
                    aggregatedValues[unit][boqCode] = { sum: 0, count: 0, min: Infinity, max: -Infinity, prog: 0};
                }
                const aggregate = aggregatedValues[unit][boqCode];
                return {
                    ...aggregatedValues,
                    [unit]: {
                        ...aggregatedValues[unit],
                        [boqCode]: {
                            count: aggregate.count + 1,
                            sum: aggregate.sum + value,
                            min: Math.min(aggregate.min, value),
                            max: Math.max(aggregate.max, value),
                            units: property.units,
                            precision: property.precision,
                            prog: aggregate.prog + progress
                        }
                    }
                };
            };
            const groupedValues = await this.aggregatePropertyValues(model, dbids, propName, aggregateFunc, initialValue);
    
            // Add properties for each group
            for (const unit in groupedValues) {
                for (const boqCode in groupedValues[unit]) {
                    const group = groupedValues[unit][boqCode];
                    const category = `${propName}: ${boqCode} (${unit})`;
                    this.addProperty(`Count (${unit})`, group.count, category);
                    this.addProperty(`Sum (${unit})`, this.toDisplayUnits(group.sum, group.units, group.precision), category);
                    this.addProperty(`%Prog (%)`, this.toDisplayUnits((group.prog/group.count), group.units, group.precision), category);
                    this.addProperty(`Progress (${unit})`, this.toDisplayUnits((group.prog/100)*group.sum, group.units, group.precision), category);
                    //this.addProperty(`Avg (${unit})`, this.toDisplayUnits(group.sum / group.count, group.units, group.precision), category);
                    //this.addProperty(`Min (${unit})`, this.toDisplayUnits(group.min, group.units, group.precision), category);
                    //this.addProperty(`Max (${unit})`, this.toDisplayUnits(group.max, group.units, group.precision), category);
                }
            }
        }
    }


    async aggregatePropertyValues(model, dbids, propertyName, aggregateFunc, initialValue = 0) {
        return new Promise(function (resolve, reject) {
            let aggregatedValue = initialValue;
            model.getBulkProperties(dbids, { propFilter: [propertyName,'ED_MeasureUnit','ED_QuantityMeasure','CN_ActivityProgress'] }, function (results) {
                for (const result of results) {
                    if (result.properties.length > 0) {
                        const edBoQCode = result.properties.find(p => p.attributeName === propertyName);
                        const prop = result.properties.find(p => p.attributeName === 'ED_QuantityMeasure');
                        const edMeasureUnit = result.properties.find(p => p.attributeName === 'ED_MeasureUnit');
                        const cnActivityProgress = result.properties.find(p => p.attributeName === 'CN_ActivityProgress');
                        //console.log('prop:', prop);
                        //console.log('edMeasureUnit:', edMeasureUnit);
                        const unit = edMeasureUnit ? edMeasureUnit.displayValue : 'DefaultUnit'; // Default unit if ED_MeasureUnit is not defined
                        const boqCode = edBoQCode ? edBoQCode.displayValue : 'DefaultBoQCode'; // Default BoQ code if ED_BoQCode is not defined
                        const progress = cnActivityProgress ? cnActivityProgress.displayValue : 0; // Default Progress code if CN_ActivityProgress is not defined
                        aggregatedValue = aggregateFunc(aggregatedValue, prop.displayValue, prop, unit, boqCode, progress);
                    }
                }
                resolve(aggregatedValue);
            }, reject);
        });
    }

    toDisplayUnits(value, units, precision) {
        return Autodesk.Viewing.Private.formatValueWithUnits(value, units, 3, precision);
    }
}