import React from "react";
import { getInputCombination, useLabelMap } from "./helperFunctions";
import { nextStateMap, stringToStringMap } from "./interfaces";
import styles from '../../styles/design.module.scss'


const ClosureTable : React.FC<{
    maximalCompatibles : string[][],
    nextStateMap : nextStateMap,
    labelMap? : stringToStringMap
}> = (props)=>{

    const inpComb = getInputCombination(props.nextStateMap.numberOfInputVar);

    // console.log(inpComb);

    const TableHeader = ()=>{
        return(
            <thead>
                <tr>
                    <th rowSpan={2}>
                        Maximal Compatible sets
                    </th>
                    <th colSpan = {1 << inpComb.length}>
                        Next State
                    </th>
                </tr>
                <tr>
                    {inpComb.map(comb =>{
                        return(
                            <th key = {comb}>
                                {comb}
                            </th>
                        )
                    })}
                </tr>
            </thead>
        )
    }

    const TableBody : React.FC<{}> = ()=>{
        return(
            <tbody>
                {props.maximalCompatibles.map((comp, index) =>{
                    return (
                        <Row key = {index} comp = {comp}/>
                    )
                })}
            </tbody>
        )
    }

    const Row : React.FC<{
        comp : string[]
    }> = ({comp}) =>{
        return(
            <tr>

                <td>
                    {
                        comp.map(s => useLabelMap(s, props.labelMap))
                    }
                </td>
                {
                    inpComb.map(inp =>{
                        let s = new Set<string>();
                        comp.forEach(state =>{
                            if(props.nextStateMap.nextStateMap[state][inp].state != 'd'){
                                s.add(props.nextStateMap.nextStateMap[state][inp].state);
                            }
                        })
                        let temp = '';
                        s.forEach(s => temp += useLabelMap(s, props.labelMap));
                        return (
                            <td key = {inp}>
                                {temp.length === 0 ? 'd' : temp}
                            </td>
                        )
                    })
                }
            </tr>
        )
    }

    return(
        <div className = {styles.closureTableContainer}>
            <table>
                <TableHeader />
                <TableBody />
            </table>
        </div>
    )

}

export default ClosureTable;