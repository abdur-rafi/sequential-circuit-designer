import { StateNode } from "../state-diagram/state-diagram-interfaces"
import styles from '../../styles/design.module.scss'

const StateAssignment : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>
}> = (props)=>{
    
    
    return(
        <div className = {styles.stateAssignmentContainer}>
            <table className = {styles.stateAssignmentTable}>
                <thead>
                    <tr>
                        <th>State</th>
                        <th>Binary Representation</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateNodes.map(s=>{
                            return(
                                <tr key={s.label}>
                                    <td>{s.label}</td>
                                    <td>{props.binRep.get(s.label)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>

    )
}

export default StateAssignment;