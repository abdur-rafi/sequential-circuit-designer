import React from "react";
import { getInputCombination } from "./helperFunctions";
import { nextStateMap } from "./interfaces";
import styles from '../../styles/design.module.scss'


const ClosureTable : React.FC<{
    maximalCompatibles : string[][],
    nextStateMap : nextStateMap
}> = (props)=>{

    const inpComb = getInputCombination(props.nextStateMap.numberOfInputVar);

    console.log(inpComb);

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
                {props.maximalCompatibles.map(comp =>{
                    return (
                        <Row comp = {comp}/>
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
                        comp.map(s => s)
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
                        s.forEach(s => temp += s);
                        return (
                            <td key = {inp}>
                                {s}
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