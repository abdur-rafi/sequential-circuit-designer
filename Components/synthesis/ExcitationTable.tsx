import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { getInputCombination, getRequiredBitForStates, useLabelMap } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { circuitMode, excitationInterface, LatchType, stringToStringMap } from "./interfaces";

const ExcitaitonTable : React.FC<{
    stateLabels : string[],
    binRep : stringToStringMap,
    latchMap : {[key :string] : string},
    excitations : excitationInterface[],
    circuitMode : circuitMode,
    latch : LatchType,
    onLatchChange : (l : LatchType) => void
}> = (props)=>{

    if(props.excitations.length == 0){
        return(
            <div></div>
        )
    }

    let numberOfInputVars = props.excitations[0].dims.col;
    let upperHeadRow : React.ReactNode[] = [];
    let lowerHeadRow : React.ReactNode[] = [];
    let stateBitCount = getRequiredBitForStates(props.stateLabels.length);
    let inpComb = getInputCombination(numberOfInputVars, props.circuitMode);
    
    for(let i = 0; i < stateBitCount; ++i){
        upperHeadRow.push(
            <th key = {i} colSpan = { props.circuitMode === 'synch' ? Math.pow(2,numberOfInputVars) : numberOfInputVars}>
                {props.latch.length === 2 ? 
                (<span>{props.latch[0]}<sub>{i}</sub>{props.latch[1]}<sub>{i}</sub></span>  ) :
                (<span>{props.latch}<sub>{i}</sub></span>)
                }
            </th>
        )
        inpComb.forEach(inp =>{
            lowerHeadRow.push(
                <th key = {inp + i}>
                    {inp}
                </th>
            )
        })
    }
    

    return(
        <div className = {styles.transitionTableContainer}>
            <div>
                <label> Latch </label>
                <select value = {props.latch} onChange = {(e)=>{
                    if(e.target.value === props.latch) return;
                    if(e.target.value === 'JK' || e.target.value === 'SR'
                    || e.target.value === 'D' || e.target.value === 'T')
                    props.onLatchChange(e.target.value);
                }}>
                    <option>JK</option>
                    <option>SR</option>
                    <option>D</option>
                    <option>T</option>
                </select>
            </div>
            <table className = {styles.transitionTable}>
                <thead>
                    <tr>
                        <th rowSpan={2}> Previous State </th>
                        {upperHeadRow}
                    </tr>
                    <tr>
                        {lowerHeadRow}
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateLabels.map(label =>{
                            let nextStateRows : React.ReactNode[] = [];
                            for(let i = 0; i < stateBitCount; ++i){
                                for(let j = 0; j < inpComb.length; ++j){
                                    nextStateRows.push(
                                        <td key = {'inp'+inpComb[j]+label+'i'+i}>
                                            {props.excitations[i].map[useLabelMap(label,props.binRep)][inpComb[j]]}
                                        </td>
                                    )
                                }
                            }
                            return(
                                <tr key = {label}>
                                    <td>
                                        {useLabelMap(label, props.binRep)}
                                    </td>
                                    {nextStateRows}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>

        </div>
    )
}

export default ExcitaitonTable;