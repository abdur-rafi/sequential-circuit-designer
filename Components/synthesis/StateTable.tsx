import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { nextStateMap } from "./interfaces";
import { getInputCombination } from "./helperFunctions";
import styles from '../../styles/design.module.scss'


const StateTable : React.FC<{
    stateLabels : string[],
    nextStateMap : nextStateMap,
    binRep? : Map<string, string> 
}> = (props)=>{

    let inpComb = getInputCombination(props.nextStateMap.numberOfInputVar);

    if(props.stateLabels.length == 0) 
        return(
            <div>
            </div>
        )
    
    return (
        <div className = {styles.stateTableContainer}>
            <table className = {styles.stateTable}>
                <thead >
                    <tr>
                        <th rowSpan={2}>previous state</th>
                        <th colSpan={Math.pow(2,props.nextStateMap.numberOfInputVar)} > next state </th>
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
                            let text = props.nextStateMap.nextStateMap[s][comb].state;
                            if(props.binRep) text = props.binRep.get(text)!;
                            return (
                                <td key = {'s' + s + 'i' +  comb}>
                                    {text + ( '/' + props.nextStateMap.nextStateMap[s][comb].output)}
                                </td>
                            )
                        })
                        return(
                            <tr key={s}>
                                <td> {props.binRep ? props.binRep.get(s) :  s} </td>
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