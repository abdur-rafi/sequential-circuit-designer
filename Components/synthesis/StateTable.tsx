import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { circuitMode, nextStateMap, stringToStringMap } from "./interfaces";
import { getInputCombination, getRequiredBitForStates, useLabelMap } from "./helperFunctions";
import styles from '../../styles/design.module.scss'


const StateTable : React.FC<{
    stateLabels : string[],
    nextStateMap : nextStateMap,
    labelMap? : stringToStringMap,
    circuitMode : circuitMode,
    includeBinAtHeader? : boolean
}> = (props)=>{

    let inpComb = getInputCombination(props.nextStateMap.numberOfInputVar, props.circuitMode);

    let numberOfOutputVar = props.nextStateMap.numberOfOutputVar;

    

    if(props.stateLabels.length == 0) 
        return(
            <div>
            </div>
        )
    
    let stateBitCount = getRequiredBitForStates(props.stateLabels.length);

    let l : React.ReactNode[] = [];
    if(props.includeBinAtHeader){
        l.push('(');
        for(let i = 1; i <= stateBitCount; ++i){
            l.push('y');
            l.push(<sub key = {i} >{i}</sub>)
        }
        l.push(')');
    }
    
    return (
        <div className = {styles.stateTableContainer}>
            <table className = {styles.stateTable}>
                <thead >
                    <tr>
                        <th rowSpan={2}>previous state {
                            props.includeBinAtHeader && l
                        } </th>
                        <th colSpan={Math.pow(2,props.nextStateMap.numberOfInputVar)} > next state { numberOfOutputVar !== 0 ? '/output' : ''} </th>
                    </tr>
                    <tr>
                        {
                            inpComb.map(inp=>{
                                return(
                                    <th key = {inp}> {inp} </th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                {
                    props.stateLabels.map(s=>{
                        let t : React.ReactNode[] = [];
                        t = inpComb.map(comb=>{
                            let text = useLabelMap(props.nextStateMap.nextStateMap[s][comb].state, props.labelMap);
                            
                            return (
                                <td key = {'s' + s + 'i' +  comb}>
                                    {text + (numberOfOutputVar !== 0 ? ( '/' + props.nextStateMap.nextStateMap[s][comb].output) : '')}
                                </td>
                            )
                        })
                        return(
                            <tr key={s}>
                                <td> {useLabelMap(s, props.labelMap)} </td>
                                {t}
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        </div>
    )
}

export default StateTable;