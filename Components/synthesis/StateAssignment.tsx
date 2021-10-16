import { StateNode } from "../state-diagram/state-diagram-interfaces"
import styles from '../../styles/design.module.scss'
import { Error, lastSelected, stringToStringMap } from "./interfaces"
import { getRequiredBitForStates, useLabelMap } from "./helperFunctions"
import React, { useEffect, useRef, useState } from "react"
import { ErrorText } from "../state-table/StateTableInput"



const  BinEntry : React.FC<{   
    val : string,
    index : number,
    changeState : (i : number, val : string) => void,
    lastSelected : lastSelected,
    error : boolean,
    errorMessage? : string,
    disabled ? : boolean,
    mxLen : number
}> = (props)=>{
    const ref = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        if(props.lastSelected.type ==='state' && props.lastSelected.i === props.index){
            ref.current?.focus();
        }
    })

    return(
        <td className = {styles.stateEntryTd + (props.error ? ` ${styles.errorTd}` : '') }>
            <input disabled = {props.disabled} type = 'text' className = {(props.error ? ` ${styles.errorInput}` : '')} onChange = {e=>{
                let tVal = e.target.value;
                if(tVal.length > props.mxLen) return;
                console.log('here');
                for(let i = 0; i < tVal.length; ++i){
                    if(!(tVal[i] === '0' || tVal[i] === '1')) return;
                }
                props.changeState(props.index, e.target.value);
            }} value = {props.val} ref ={ref} />
            {
                props.errorMessage && <ErrorText message = {props.errorMessage} />

            }
        </td>
    )
}

const StateAssignment : React.FC<{
    stateLabels : string[],
    binRep : stringToStringMap,
    labelMap? : stringToStringMap,
    changeBinRep : (b : stringToStringMap) => void
}> = (props)=>{

    let numberOfStateBits = getRequiredBitForStates(props.stateLabels.length);
    const [binInputs, setBinInputs] = useState<string[]>(props.stateLabels.map(s => props.binRep[s]));
    const [lastSelected, setLastSelected] = useState<lastSelected>({i : -1, j : -1, type : 'state'})
    const [error, setError] = useState<Error | null>(null);
    const [edit ,setEdit] = useState<boolean>(false);


    const changeInputVal =  (i : number, val : string) =>{
        console.log('here');
        if(i === error?.i){
            setError(null);
        }
        setLastSelected({
            ...lastSelected, 
            i : i
        })
        let temp = [...binInputs];
        temp[i] = val;
        setBinInputs(temp);
    }

    const confirm = ()=>{
        let st = new Set<string>();
        let newBinRep : stringToStringMap = {};
        for(let i = 0; i < binInputs.length; ++i){
            newBinRep[props.stateLabels[i]] = binInputs[i];
            if(binInputs[i].length !== numberOfStateBits){
                setError({
                    i : i,
                    j : -1,
                    type : 'state',
                    message : `lenght should be ${numberOfStateBits}`
                })
                return;
            }
            if(st.has(binInputs[i])){
                setError({
                    i : i,
                    j : -1,
                    type : 'state',
                    message : 'duplicate entry'
                })
                return;
            }
            st.add(binInputs[i]);
        }
        props.changeBinRep(newBinRep);
        setEdit(false);
    }

    const reset = ()=>{

    }

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
                        props.stateLabels.map((label, index)=>{
                            let lb = props.labelMap ? props.labelMap[label] : label;
                            let err = error?.i === index;
                            return(
                                <tr key={label}>
                                    <td>{lb}</td>
                                    <BinEntry val={binInputs[index]} index={index}
                                    changeState={changeInputVal} lastSelected={lastSelected} error={err} mxLen={numberOfStateBits}
                                    disabled = {!edit} errorMessage = {err ? error?.message : ''}  />
                                    {/* <td>{useLabelMap(label, props.binRep)}</td> */}
                                </tr>
                            )
                        })
                    }
                </tbody>
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

export default StateAssignment;