import React, { useEffect, useRef } from "react";
import { useState } from "react";
import styles from '../../styles/design.module.scss'
import { StateEntry } from "../state-table/StateTableInput";
import { useLabelMap } from "./helperFunctions";
import { lastSelected, stringToStringMap , Error} from "./interfaces";


const ReducedStates : React.FC<{
    compatibles : string[][],
    labels : string[],
    setReduceLabelMap : (m : stringToStringMap | undefined) => void,
    labelMap? : stringToStringMap
}> = (props)=>{



    const [states , setStates] = useState<string[]>(props.labels);
    // const [reducedStateLabels, setReducedStateLabels] = useState<{[key : string] : string}>({});
    const [lastSelected, setLastSelected] = useState<lastSelected>({i : -1, j : -1, type : 'state'})
    const [edit , setEdit] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const changeState = (index : number,val : string )=>{
        if(!edit) return;
        setError(null);
        let s = [...states];
        s[index] = val;
        let temp = {
            ...lastSelected,
            i : index
        }
        setLastSelected(temp);
        setStates(s);
    }

    const confirm = ()=>{
        let changed = false;
        let emptyIndex = -1;
        
        const reducedLabelMap : stringToStringMap = {

        }
        let st = new Set<string>();

        for(let i = 0; i < states.length; ++i){
            reducedLabelMap[props.labels[i]] = states[i];
            if(st.has(states[i])){
                setError({
                    i : i,
                    j : -1,
                    message : 'duplicate label',
                    type : 'state'
                })
                return;
            }
            st.add(states[i]);
            if(states[i] != props.labels[i]){
                changed = true;
            }
            if(states[i].length === 0){
                emptyIndex = i;
            }
        }
        if(!changed) return;
        if(emptyIndex != -1){
            setError({
                message : 'Empty label',
                i : emptyIndex,
                j : -1,
                type : 'state'

            })
            return;
        }
        props.setReduceLabelMap(reducedLabelMap);
        setEdit(false);
    }

    const reset = ()=>{
        setStates(props.labels);
        props.setReduceLabelMap(undefined);
    }
    

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
                        let showErr = error?.i === index;

                        return(
                            <tr key = {index}>
                                
                                    <StateEntry val={states[index]} index={index} disabled = {!edit}
                                    changeState={ changeState} lastSelected={lastSelected} error={showErr} errorMessage = {showErr ? error?.message : ''} /> 
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
            <div>
                {!edit && <button onClick = {()=>{
                    setEdit(true);
                }}>Edit</button>}
                {edit && <button onClick = {confirm}>Confirm</button>}
                <button onClick = {()=>reset()}>Reset</button>

            </div>
        </div>
    )
}

export default ReducedStates;