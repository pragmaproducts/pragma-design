import {DataSetConstants} from "./../../node_modules/pragma-views2/lib/dataset-constants.js";

export class ConverterBase {
        
    doConvert(value, target) {
        return (target == null) || (target.activityState !== DataSetConstants.gettingDirtyState);
    }    
}