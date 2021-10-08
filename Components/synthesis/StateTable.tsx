import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { nextStateMap } from "./interfaces";
import { getInputCombination } from "./helperFunctions";
import styles from '../../styles/design.module.scss'


const StateTable : React.FC<{
    stateNodes : StateNode[],
    numberOfInpVar : number,
    nextStateMap : nextStateMap,
    binRep? : Map<string, string> ,
    showOutput? : boolean
}> = (props)=>{

    let inpComb = getInputCombination(props.numberOfInpVar);

    if(props.stateNodes.length == 0) 
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
                        <th colSpan={Math.pow(2,props.numberOfInpVar)} > next state </th>
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
                    props.stateNodes.map(s=>{
                        let t : React.ReactNode[] = [];
                        t = inpComb.map(comb=>{
                            let text = props.nextStateMap[s.label][comb].state;
                            if(props.binRep) text = props.binRep.get(text)!;
                            return (
                                <td key = {'s' + s.label + 'i' +  comb}>
                                    {text + (props.showOutput ? ( '/' + props.nextStateMap[s.label][comb].output) : '')}
                                </td>
                            )
                        })
                        return(
                            <tr key={s.label}>
                                <td> {props.binRep ? props.binRep.get(s.label) :  s.label} </td>
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