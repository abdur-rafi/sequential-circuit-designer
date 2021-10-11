import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { getInputCombination, nextStateMapFromStateTalbeInput } from '../synthesis/helperFunctions'
import styles from '../../styles/design.module.scss'
import { FromNextStateMap } from '../synthesis/results'
import { nextStateMap, stringToStringMap } from '../synthesis/interfaces'

interface lastSelected{
    i : number,
    j : number,
    type : 'state' | 'entry' | 'output'
}

interface Error{
    i : number,
    j : number,
    type : 'state' | 'output' | 'entry', 
    message? : string
}

const TableHeader : React.FC<{
    numberOfInputVars :number
}> = (props)=>{
    const inpCombs = getInputCombination(props.numberOfInputVars);
    return (
        <thead>
            <tr>
                <th rowSpan = {2} >Previous States</th>
                <th colSpan = {inpCombs.length}> Next States </th>
            </tr>
            <tr>
                {
                    inpCombs.map(comb=>{
                        return(
                            <th key = {comb}>
                                {comb}
                            </th>
                        )
                    })
                }
            </tr>
        </thead>
    )
}

const chekcValidLetters = (tVal : string)=>{
    let n = tVal.length;
    for(let i = 0; i < n; ++i){
        if((tVal[i] >= 'a' && tVal <= 'z') || (tVal[i] >= 'A' && tVal <= 'Z') || Number.isInteger(parseInt(tVal[i])) ){
            ;
        }
        else{
            return false;
        }
    }
    return true;
}

const checkOutput = (val : string, numberOfOutputVar : number)=>{
    if(val.length > numberOfOutputVar) return false;
    let n = val.length;
    for(let i = 0 ; i <  n; ++i){
        if(val[i] ==='d' || val[i] === '0' || val[i] === '1'){

        }
        else return false;
    }
    return true;
}

const ErrorText : React.FC<{
    message : string
}> = (props) =>{
    return(
        <div className = {styles.errorMessageContainer}>
            {props.message}
        </div>
    )
}

const StateEntry : React.FC<{   
    val : string,
    index : number,
    changeState : (i : number, val : string,index : number) => void,
    lastSelected : lastSelected,
    error : boolean,
    errorMessage? : string
}> = (props)=>{
    const ref = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        if(props.lastSelected.type ==='state' && props.lastSelected.i === props.index){
            ref.current?.focus();
        }
    })

    return(
        <td className = {styles.stateEntryTd + (props.error ? ` ${styles.errorTd}` : '') }>
            <input type = 'text' className = {(props.error ? ` ${styles.errorInput}` : '')} onChange = {e=>{
                let tVal = e.target.value;
                if(tVal === 'd') return;
                // console.log(tVal);
                if(chekcValidLetters(tVal)){
                    props.changeState(props.index, tVal,props.index);
                }
                console.log(ref.current);
                // ref.current?.focus();
            }} value = {props.val} ref ={ref} />
            {
                props.errorMessage && <ErrorText message = {props.errorMessage} />

            }
        </td>
    )
}

const Entry : React.FC<{
    numberOfOutputVars : number,
    val : string,
    i : number,
    j : number,
    changeEntry : (i : number, j : number, val : string) => void,
    changeOutput : (i : number, j : number, val : string) => void
    lastSelected : lastSelected,
    output : string,
    entryError : boolean,
    outputError : boolean,
    errorMessage? : string
    
}> = (props)=>{
    const entryRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        if(props.lastSelected.type === 'entry'){
            if(props.i === props.lastSelected.i && props.j === props.lastSelected.j){
                entryRef.current?.focus();
            }
            
        }
        else if(props.lastSelected.type === 'output'){
            if(props.i === props.lastSelected.i && props.j === props.lastSelected.j){
                outputRef.current?.focus();
            }
        }
    })

    return(
        <td className = {styles.entryTd + ((props.entryError|| props.outputError) ? ` ${styles.errorTd}` : '')}>
            <input type='text' className = {styles.nextStateInput + (props.entryError ? ` ${styles.errorInput}` : '')} onChange={(e)=>{
                if(chekcValidLetters(e.target.value)){
                    props.changeEntry(props.i, props.j, e.target.value);
                }
            }} value = {props.val} ref={entryRef} />
            /
            <input type='text' className = {styles.outputEntryInput + (props.outputError ? ` ${styles.errorInput}` : '')} onChange = {(e)=>{
                if(checkOutput(e.target.value, props.numberOfOutputVars)){
                    props.changeOutput(props.i,props.j, e.target.value);
                }
            }} value = {props.output} ref={outputRef} />
            {
                props.errorMessage && <ErrorText message = {props.errorMessage} />
            }
        </td>
    )
}

const StateTableInput : React.FC<{

}> = (props)=>{

    const [numberOfStates, setNumberOfStates] = useState<number>(5);
    const [numberOfInputVars, setNumberOfInputVars] = useState<number>(1);
    const [numberOfOutputVars, setNumberOfOutputVars] = useState<number>(1);

    let temp : string[][] = [];
    let tempOut : string[][] = [];
    let tempStates : string[] = [];
    for(let i = 0; i < numberOfStates; ++i){
        temp.push([]);
        tempOut.push([]);
        tempStates.push('');
        for(let j = 0; j < (1<<numberOfInputVars); ++j){
            temp[i].push('');
            tempOut[i].push('');
        }
    }

    const [states, setStates] = useState<string[]>(tempStates);
    const [entries, setEntries] = useState<string[][]>(temp);
    const [output, setOutput] = useState<string[][]>(tempOut);
    const [lastSelected , setLastSelected] = useState<lastSelected>({
        i : -1,
        j : -1,
        type : 'state'
    });
    const [error, setError] = useState<Error | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [nextStateMap, setNextStateMap] = useState<nextStateMap | null>(null);
    const [internalLabels, setInternalLabels] = useState<string[]>([]);
    const [internalToOriginalMap, setInternalToOriginalMap] = useState<stringToStringMap>({});
    const chekcValidity = ()=>{
        for(let i = 0; i < numberOfStates; ++i){
            if(states[i].length === 0){
                setError({
                    i : i,
                    j : -1,
                    type : 'state',
                    message : 'Empty state label'
                })
                return false;
            }
        }
        let set = new Set<string>();
        for(let i = 0 - 1; i < numberOfStates; ++i){
            if(set.has(states[i])){
                setError({
                    i : i,
                    j : -1,
                    type : 'state',
                    message : 'duplicate Entry'
                })
                return false;
            }
            set.add(states[i]);
        }
        
        for(let i = 0; i < numberOfStates; ++i){
            for(let j = 0; j < (1 << (numberOfInputVars )); ++j){
                if(output[i][j].length !== numberOfOutputVars){
                    setError({
                        i : i,
                        j : j,
                        type : 'output',
                        message : 'invalid output length'
                    })
                    return false;
                }
                console.log(entries[i][j]);
                if(entries[i][j] === 'd'){
                    continue;
                }
                else if(!set.has(entries[i][j])){
                    setError({
                        i : i,
                        j : j,
                        type : 'entry',
                        message : 'unknown state'
                    })
                    return false;
                }
            }
        }

        return true;
    }

    const changeEntry = (i : number, j : number, val : string)=>{
        // entries[i][j] = val;
        if(error?.type === 'entry' && i === error.i && j === error.j){
            setError(null);
        }
        let temp = entries.map(e => e.map(t => t))
        temp[i][j] = val;
        setEntries(temp);
        setLastSelected({
            i : i,
            j : j,
            type : 'entry'
        })
    }

    const chnageStates = (i : number, val : string, index : number )=>{
        if(error?.type === 'state' && i === error.i){
            setError(null);
        }
        let temp = [...states];
        temp[i] = val;
        setLastSelected({
            i : i,
            j : -1,
            type : 'state'
        })
        setStates(temp);
    }

    const changeOutput = (i : number ,j : number, val : string)=>{
        if(error?.type === 'output' && i === error.i && j === error.j){
            setError(null);
        }
        let temp = output.map(o => o.map(t => t))
        temp[i][j] = val;
        setLastSelected({
            i : i,
            j : j,
            type : 'output'
        });
        setOutput(temp);
    }


    const inpCombs = getInputCombination(numberOfInputVars);

    const onStateChange = (numberOfStates : number)=>{
        let statesTemp : string[] = [];
        for(let i = 0; i < numberOfStates; ++i){
            if(i < states.length){
                statesTemp[i] = states[i];
            }
            else{
                statesTemp.push('');
            }
        }
        let tempEntries : string[][] = [];
        let tempOut : string[][] = [];
        for(let i = 0; i < numberOfStates; ++i){
            if(i < entries.length){
                tempEntries[i] = entries[i];
                tempOut[i] = output[i];
            }
            else{
                tempEntries.push([])
                tempOut.push([]);
                for(let j = 0; j < (1 << numberOfInputVars);++j){
                    tempEntries[i].push('');
                    tempOut[i].push('');
                }
            }
        }
        setEntries(tempEntries);
        setStates(statesTemp);
        setOutput(tempOut);
        setNumberOfStates(numberOfStates);
    }

    const onInputVarChange = (numberOfInputVars : number)=>{
        let tempEntries : string[][] = [];
        for(let i = 0; i < numberOfStates; ++i){
            tempEntries.push([]);
            for(let j = 0; j < (1 << numberOfInputVars); ++j){
                if(j < entries[i].length){
                    tempEntries[i].push(entries[i][j]);
                }
                else{
                    tempEntries[i].push('');
                }
            }
        }
        setEntries(tempEntries);
        setNumberOfInputVars(numberOfInputVars);
    }

    const onOutputChange = (numberOfOutputVars : number)=>{
        let temp : string[][] = [];
        for(let i = 0; i < numberOfStates; ++i){
            temp.push([]);
            for(let j = 0; j < (1 << (numberOfInputVars)); ++j){
                temp[i].push('');
            }
        }
        setOutput(temp);
        setNumberOfOutputVars(numberOfOutputVars);
    }

    let Row : React.FC<{
        index : number,
        stateVal : string,
        entries : string[],
        outputs : string[]
    }> = ({index, stateVal, entries, outputs})=>{
        let stateError = false;
        if(error?.type === 'state' && error.i === index){
            stateError = true;
        }
        return(
            <tr>
                <StateEntry error = {stateError} errorMessage = {stateError ? error?.message : ''} lastSelected = {lastSelected} val = {stateVal} changeState = {chnageStates} index = {index} /> 
                {
                    
                    inpCombs.map((comb, j)=> {
                        let entryError = false, outputError = false;
                        if(error?.type === 'entry' && error.i === index && error.j === j){
                            entryError = true;
                        }
                        else if(error?.type === 'output' && error.i === index && error.j === j){
                            outputError = true;
                        }

                        return(
                            <Entry entryError = {entryError} output = {outputs[j]} 
                            changeOutput = {changeOutput} lastSelected = {lastSelected} changeEntry = {changeEntry}
                            numberOfOutputVars = {numberOfOutputVars} 
                            key={comb} i = {index} j = {j} val = {entries[j]} 
                            outputError = {outputError}
                            errorMessage = {(entryError || outputError) ? error?.message : ''}
                            />
                        )
                    })
                }
            </tr>
        )
    }

    let TableBody : React.FC<{}> = ()=>{
        let t : React.ReactNode[] = [];
        for(let i = 0; i < numberOfStates; ++i){
            t. push(<Row index = {i} entries = {entries[i]} stateVal = {states[i]} key = {i} outputs={output[i]} />)
        }
        return(
            <tbody>
                {t}
            </tbody>
        )
    }

    return(
        <div>
            { !showResults &&
                <div>
                    <div>
                        #inputs <input type = 'number' onChange = {e => {
                            let n = parseInt(e.target.value);
                            if(n >0 && n < 5){
                                onInputVarChange(n);
                            }
                        }} value = {numberOfInputVars}></input>
                        #outputs <input type = 'number' onChange = {e => {
                            let n = parseInt(e.target.value);
                            if(n >0){
                                onOutputChange(n);
                            }
                        }}
                        value = {numberOfOutputVars}
                        ></input>
                        #states <input type = 'number' onChange = {e => {
                            let n = parseInt(e.target.value);
                            if(n >0){
                                onStateChange(n);
                            }
                        }} value = {numberOfStates} ></input>
                    </div>
                    <div className = {styles.stateTableInputContainer}>
                        <table>
                            <TableHeader numberOfInputVars = {numberOfInputVars} />
                            <TableBody />
                        </table>
                    </div>
                    <div>
                        <button onClick = {async ()=>{
                            if(chekcValidity()){
                                let r = await nextStateMapFromStateTalbeInput(states,entries,output);
                                console.log(r);
                                setNextStateMap(r.nextStateMap);
                                setInternalLabels(r.internalLabels);
                                setInternalToOriginalMap(r.internalToOriginalMap);
                                setShowResults(true);
                            }
                        }}> Analyze</button>
                    </div>
                </div>
            }
            {showResults && nextStateMap && <FromNextStateMap labelMap = {internalToOriginalMap} nextStateMap = {nextStateMap} labels = {internalLabels} changeSynthesis = {(b)=>setShowResults(b)} />}
        </div>
    )
}


export default StateTableInput;