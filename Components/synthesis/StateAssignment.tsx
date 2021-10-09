import { StateNode } from "../state-diagram/state-diagram-interfaces"
import styles from '../../styles/design.module.scss'

const StateAssignment : React.FC<{
    stateLabels : string[],
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
                        props.stateLabels.map(label=>{
                            return(
                                <tr key={label}>
                                    <td>{label}</td>
                                    <td>{props.binRep.get(label)}</td>
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