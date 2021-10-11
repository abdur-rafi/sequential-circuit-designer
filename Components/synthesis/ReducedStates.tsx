import React from "react";
import styles from '../../styles/design.module.scss'
import { useLabelMap } from "./helperFunctions";
import { stringToStringMap } from "./interfaces";


const ReducedStates : React.FC<{
    compatibles : string[][],
    labels : string[],
    labelMap? : stringToStringMap
}> = (props)=>{
    let TableHeader : React.FC<{}> = (props)=>{
        return(
            <thead>
                <tr>
                    <th>New State</th>
                    <th>Previous States</th>
                </tr>
            </thead>
        )
    }
    let TableBody : React.FC<{}> = ()=>{
        return(
            <tbody>
                {
                    props.compatibles.map((comp, index) =>{
                        return(
                            <tr key = {index}>
                                <td> {props.labels[index]} </td>
                                <td>
                                    {
                                        comp.map(state => useLabelMap(state, props.labelMap) + ' ' )
                                    }
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        )
    }
    return (
        <div className = {styles.reducedStateContainer}>
            <table>
                <TableHeader />
                <TableBody />
            </table>
        </div>
    )
}

export default ReducedStates;