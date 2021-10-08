import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { getInputCombination, getRequiredBitForStates } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { excitationInterface } from "./interfaces";

const ExcitaitonTable : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>,
    latchMap : {[key :string] : string},
    latchLabel : string,
    numberOfInputVars : number,
    excitations : excitationInterface[]
}> = (props)=>{


    let upperHeadRow : React.ReactNode[] = [];
    let lowerHeadRow : React.ReactNode[] = [];
    let stateBitCount = getRequiredBitForStates(props.stateNodes.length);
    let inpComb = getInputCombination(props.numberOfInputVars);
    
    for(let i = 0; i < stateBitCount; ++i){
        upperHeadRow.push(
            <th key = {i} colSpan = {Math.pow(2,props.numberOfInputVars)}>
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
                        props.stateNodes.map(stateNode =>{
                            let nextStateRows : React.ReactNode[] = [];
                            for(let i = 0; i < stateBitCount; ++i){
                                for(let j = 0; j < inpComb.length; ++j){
                                    nextStateRows.push(
                                        <td key = {'inp'+inpComb[j]+stateNode.label+'i'+i}>
                                            {props.excitations[i].map[props.binRep.get(stateNode.label)!][inpComb[j]]}
                                        </td>
                                    )
                                }
                            }
                            return(
                                <tr key = {stateNode.label}>
                                    <td>
                                        {props.binRep.get(stateNode.label)}
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