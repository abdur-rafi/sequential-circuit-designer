import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { getInputCombination, getRequiredBitForStates, useLabelMap } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { excitationInterface, stringToStringMap } from "./interfaces";

const ExcitaitonTable : React.FC<{
    stateLabels : string[],
    binRep : stringToStringMap,
    latchMap : {[key :string] : string},
    latchLabel : string,
    excitations : excitationInterface[]
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
    let inpComb = getInputCombination(numberOfInputVars);
    
    for(let i = 0; i < stateBitCount; ++i){
        upperHeadRow.push(
            <th key = {i} colSpan = {Math.pow(2,numberOfInputVars)}>
                {props.latchLabel.length === 2 ? 
                (<span>{props.latchLabel[0]}<sub>{i}</sub>{props.latchLabel[1]}<sub>{i}</sub></span>  ) :
                (<span>{props.latchLabel}<sub>{i}</sub></span>)
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