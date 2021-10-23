import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { getInputCombination, nextStateMapFromStateTalbeInput } from '../synthesis/helperFunctions'
import styles from '../../styles/statetableinput.module.scss'
import minimizeFunctionStyles from '../../styles/minimizefunction.module.scss'
import { FromNextStateMap } from '../synthesis/results'
import { circuitMode, lastSelected, nextStateMap, stringToStringMap , Error} from '../synthesis/interfaces'
import Link from 'next/link'


const TableHeader : React.FC<{
    numberOfInputVars :number,
    circuitMode : circuitMode,
    numberOfOutputVars : number
}> = (props)=>{
    const inpCombs = getInputCombination(props.numberOfInputVars, props.circuitMode);
    return (
        <thead>
            <tr>
                <th rowSpan = {2} >Previous States</th>
                <th colSpan = {inpCombs.length}> {'Next State' + (props.numberOfOutputVars !== 0 ? '/output' : '')}</th>
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
        if(/\s/.test(tVal[i])) return false;
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

 const  StateEntry : React.FC<{   
    val : string,
    index : number,
    changeState : (i : number, val : string) => void,
    lastSelected : lastSelected,
    error : boolean,
    errorMessage? : string,
    disabled ? : boolean
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
                if(tVal === 'd') return;
                // console.log(tVal);
                if(chekcValidLetters(tVal)){
                    props.changeState(props.index, tVal);
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
            { props.numberOfOutputVars !== 0 && '/'}
            {
                props.numberOfOutputVars !== 0 &&
                <input type='text' className = {styles.outputEntryInput + (props.outputError ? ` ${styles.errorInput}` : '')} onChange = {(e)=>{
                    if(checkOutput(e.target.value, props.numberOfOutputVars)){
                        props.changeOutput(props.i,props.j, e.target.value);
                    }
                }} value = {props.output} ref={outputRef} />
            }
            {
                props.errorMessage && <ErrorText message = {props.errorMessage} />
            }
        </td>
    )
}
interface Props {

}
class StateTableInput extends React.Component<Props, {
    numberOfStates : number,
    numberOfInputVars : number,
    numberOfOutputVars : number,
    states : string[],
    entries : string[][],
    outputs : string[][],
    lastSelected : lastSelected,
    error : Error | null,
    showResults : boolean,
    nextStateMap : nextStateMap | null,
    internalLabels : string[],
    internalToOriginalMap : stringToStringMap,
    circuiMode : circuitMode
    
}>{


    constructor(props : Props){
        super(props);

        let numberOfStates = 5;
        let numberOfInputVars = 1;
        let circuitMode : circuitMode = 'pulse';


        let temp : string[][] = [];
        let tempOut : string[][] = [];
        let tempStates : string[] = [];
        for(let i = 0; i < numberOfStates; ++i){
            temp.push([]);
            tempOut.push([]);
            tempStates.push('');
            let m = numberOfInputVars;
            // if(circuitMode === 'synch'){
            //     m = 1 << this.state.numberOfInputVars;
            // }
            for(let j = 0; j < m; ++j){
                temp[i].push('');
                tempOut[i].push('');
            }
        }

        this.state = {
            numberOfStates : numberOfStates,
            numberOfInputVars : numberOfInputVars,
            numberOfOutputVars : 1,
            states : tempStates,
            entries : temp,
            outputs :tempOut,
            lastSelected : {
                i : -1,
                j : -1,
                type : 'state'
            },
            error : null,
            showResults : false,
            internalLabels : [],
            internalToOriginalMap : {},
            nextStateMap : null,
            circuiMode : "pulse"
        }
        this.chekcValidity = this.chekcValidity.bind(this);
        this.changeEntry = this.changeEntry.bind(this);
        this.changeOutput = this.changeOutput.bind(this);
        this.chnageStates = this.chnageStates.bind(this);
        this.onInputVarChange = this.onInputVarChange.bind(this);
        this.onOutputChange = this.onOutputChange.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.changeShowResult = this.changeShowResult.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
    }

    chekcValidity(){
        for(let i = 0; i < this.state.numberOfStates; ++i){
            if(this.state.states[i].length === 0){
                this.setState({
                    error :{
                        i : i,
                        j : -1,
                        type : 'state',
                        message : 'Empty state label'
                }})
                return false;
            }
        }
        let set = new Set<string>();
        for(let i = 0 - 1; i < this.state.numberOfStates; ++i){
            if(set.has(this.state.states[i])){
                this.setState({ 
                    error : {
                        i : i,
                        j : -1,
                        type : 'state',
                        message : 'duplicate Entry'
                    }}
                )
                return false;
            }
            set.add(this.state.states[i]);
        }
        
        for(let i = 0; i < this.state.numberOfStates; ++i){
            let m = this.state.numberOfInputVars;
            if(this.state.circuiMode === 'synch'){
                m = 1 << this.state.numberOfInputVars;
            }
            for(let j = 0; j < m; ++j){
                if(this.state.outputs[i][j].length !== this.state.numberOfOutputVars){
                    this.setState({
                        error :{
                            i : i,
                            j : j,
                            type : 'output',
                            message : 'invalid output length'
                    }})
                    return false;
                }
                if(this.state.entries[i][j] === 'd'){
                    continue;
                }
                else if(!set.has(this.state.entries[i][j])){
                    this.setState({
                        error :{
                            i : i,
                            j : j,
                            type : 'entry',
                            message : 'unknown state'
                    }})
                    return false;
                }
            }
        }

        return true;
    }

    changeEntry(i : number, j : number, val : string){
        // entries[i][j] = val;
        let error = this.state.error;
        if(this.state.error?.type === 'entry' && i === this.state.error.i && j === this.state.error.j){
            error = null;
        }
        let temp = this.state.entries.map(e => e.map(t => t))
        temp[i][j] = val;
        this.setState({
            entries : temp,
            lastSelected : {
                i : i,
                j : j,
                type : 'entry'
            },
            error : error
        })
    }

    chnageStates(i : number, val : string){
        let error = this.state.error;
        if(this.state.error?.type === 'state' && i === this.state.error.i){
            error = null;
        }
        let temp = [...this.state.states];
        temp[i] = val;
        this.setState({
            lastSelected : {
                i : i,
                j : -1,
                type : 'state'
            },
            states : temp,
            error : error
        })
    }

    changeOutput(i : number ,j : number, val : string){
        let error = this.state.error;
        if(error?.type === 'output' && i === error.i && j === error.j){
            error = null;
        }
        let temp = this.state.outputs.map(o => o.map(t => t))
        temp[i][j] = val;
        this.setState({
            lastSelected : {
                i : i,
                j : j, 
                type : 'output'
            },
            outputs : temp,
            error : null
        })
    }



    onStateChange(numberOfStates : number){

        let statesTemp : string[] = [];
        for(let i = 0; i < numberOfStates; ++i){
            if(i < this.state.states.length){
                statesTemp[i] = this.state.states[i];
            }
            else{
                statesTemp.push('');
            }
        }
        let tempEntries : string[][] = [];
        let tempOut : string[][] = [];
        for(let i = 0; i < numberOfStates; ++i){
            if(i < this.state.entries.length){
                tempEntries[i] = this.state.entries[i];
                tempOut[i] = this.state.outputs[i];
            }
            else{
                tempEntries.push([])
                tempOut.push([]);
                let m = this.state.numberOfInputVars;
                if(this.state.circuiMode === 'synch'){
                    m = 1 << this.state.numberOfInputVars;
                }
                for(let j = 0; j < m;++j){
                    tempEntries[i].push('');
                    tempOut[i].push('');
                }
            }
        }
        this.setState({
            entries : tempEntries,
            states : statesTemp,
            outputs : tempOut,
            numberOfStates : numberOfStates
        })
    }

    onInputVarChange(numberOfInputVars : number){
        let tempEntries : string[][] = [];
        let tempOut : string[][] = [];
        for(let i = 0; i < this.state.numberOfStates; ++i){
            tempEntries.push([]);
            tempOut.push([]);
            let m = numberOfInputVars;
            if(this.state.circuiMode === 'synch'){
                m = 1 << numberOfInputVars;
            }
            for(let j = 0; j < m; ++j){
                if(j < this.state.entries[i].length){
                    tempEntries[i].push(this.state.entries[i][j]);
                    tempOut[i].push(this.state.outputs[i][j])
                }
                else{
                    tempOut[i].push('');
                    tempEntries[i].push('');
                }
            }
        }
        this.setState({
            entries : tempEntries,
            numberOfInputVars : numberOfInputVars,
            outputs : tempOut
        })
    }

    onOutputChange(numberOfOutputVars : number){
        let temp : string[][] = [];
        for(let i = 0; i < this.state.numberOfStates; ++i){
            temp.push([]);
            let m = this.state.numberOfInputVars;
            if(this.state.circuiMode === 'synch'){
                m = 1 << this.state.numberOfInputVars;
            }
            for(let j = 0; j < m; ++j){
                temp[i].push('');
            }
        }

        this.setState({
            outputs : temp,
            numberOfOutputVars : numberOfOutputVars
        })

    }

    onModeChange(mode : circuitMode){
        if(this.state.circuiMode === mode) return;
        this.setState({
            circuiMode : mode
        }, ()=>{
            this.onInputVarChange(this.state.numberOfInputVars);
        })
    }

    changeShowResult(b : boolean){
        this.setState({showResults : b})
    }

    

    

    render(){
        return(
            <div className = {styles.root}>
                { 
                    !this.state.showResults &&
                    <div>

                        <div className = {minimizeFunctionStyles.introContainer} >
                            <h1>
                                Synthesize Sequential Circuit From State Table 
                            </h1>
                            <div>
                                Alternatively, synthesize circuit directly from state diagram using the {' '}
                                <Link  href = '/statediagram'>
                                    <a>
                                        state diagram drawer
                                    </a>
                                </Link>
                            </div>
                        </div>

                        <div className = {minimizeFunctionStyles.inputsContainer} >
                            <div className = {minimizeFunctionStyles.inputContainer}>
                                <div>
                                    <label> inputs </label>
                                    <input type = 'number' onChange = {e => {
                                        let n = parseInt(e.target.value);
                                        if(this.state.circuiMode === 'pulse' && n <= 0) return;
                                        if(n >= 0 && n < 5){
                                            this.onInputVarChange(n);
                                        }
                                    }} value = {this.state.numberOfInputVars}></input>
                                </div>
                                <div>
                                    Specify number of input bits({this.state.circuiMode === 'synch'? '0' : '1'} to 4)
                                </div>
                                
                            </div>
                            <div className = {minimizeFunctionStyles.outputsContainer}>
                                <div>
                                    <label> outputs </label>
                                    <input type = 'number' onChange = {e => {
                                        let n = parseInt(e.target.value);
                                        if(n >= 0){
                                            this.onOutputChange(n);
                                        }
                                    }}
                                    value = {this.state.numberOfOutputVars} 
                                    ></input>
                                </div>
                                <div>
                                    Specify number of output bits(0 to 4)
                                </div>
                               
                            </div>
                            <div className = {minimizeFunctionStyles.statesContainer}>
                                <div>
                                    <label> states </label>
                                    <input type = 'number' onChange = {e => {
                                        let n = parseInt(e.target.value);
                                        if(n >= 0){
                                            this.onStateChange(n);
                                        }
                                    }} value = {this.state.numberOfStates} ></input>
                                </div>
                                <div>
                                    Specify number of states
                                </div>
                                
                            </div>
                            <div className = {minimizeFunctionStyles.modeContainer}>
                                <div>
                                    <label>Mode</label>
                                    <select onChange = {(e)=>{
                                        if(e.target.value === 'synch' || e.target.value === 'pulse'){
                                            this.onModeChange(e.target.value);
                                        }
                                    }} value = {this.state.circuiMode}>
                                        <option>synch</option>
                                        <option>pulse</option>
                                    </select>
                                </div>
                                <div>
                                    synchronous or asynchronous pulse mode
                                </div>

                                
                            </div>
                        </div>
                        <div className = {styles.stateTableInputContainer}>
                            <table>
                                <TableHeader numberOfOutputVars = {this.state.numberOfOutputVars} circuitMode = {this.state.circuiMode} numberOfInputVars = {this.state.numberOfInputVars} />
                                <TableBody circuitMode = {this.state.circuiMode} changeEntry = {this.changeEntry} changeOutput = {this.changeOutput} states = {this.state.states} outputs = {this.state.outputs}
                                numberOfStates = {this.state.numberOfStates} numberOfOutputVars = {this.state.numberOfOutputVars} numberOfInputVars = {this.state.numberOfInputVars} 
                                lastSelected = {this.state.lastSelected} error = {this.state.error} entries = {this.state.entries} changeStates = {this.chnageStates} />
                            </table>
                        </div>
                        <div className = {styles.buttonContainer}>
                            <button onClick = {async ()=>{
                                if(this.state.states.length === 0) return;
                                if(this.chekcValidity()){
                                    let r = await nextStateMapFromStateTalbeInput(this.state.states,this.state.entries,this.state.outputs, this.state.circuiMode, this.state.numberOfInputVars, this.state.numberOfOutputVars);
                                    console.log(r);
                                    this.setState({
                                        nextStateMap : r.nextStateMap,
                                        internalToOriginalMap : r.internalToOriginalMap,
                                        internalLabels : r.internalLabels,
                                        showResults : true
                                    })
                                }
                            }}> Analyze</button>
                        </div>
                    </div>
                }
                { this.state.showResults && <FromNextStateMap circuitMode = {this.state.circuiMode} labelMap = {this.state.internalToOriginalMap} nextStateMap = {this.state.nextStateMap} labels = {this.state.internalLabels} changeSynthesis = {this.changeShowResult} />}
            </div>
        )
    }
}

const Row : React.FC<{
    index : number,
    stateVal : string,
    entries : string[],
    outputs : string[],
    error : Error | null,
    numberOfInputVars : number,
    numberOfOutputVars : number,
    lastSelected : lastSelected,
    changeStates : (i : number, val : string) => void,
    changeOutput : (i : number, j : number, val : string) => void,
    changeEntry : (i : number, j : number, val : string) => void,
    circuitMode : circuitMode
}> = (props)=>{
    let stateError = false;
    if(props.error?.type === 'state' && props.error.i === props.index){
        stateError = true;
    }
    const inpCombs = getInputCombination(props.numberOfInputVars, props.circuitMode);
    return(
        <tr>
            <StateEntry error = {stateError} errorMessage = {stateError ? props.error?.message : ''} lastSelected = {props.lastSelected} 
            val = {props.stateVal} changeState = {props.changeStates} index = {props.index} /> 
            {
                
                inpCombs.map((comb, j)=> {
                    let entryError = false, outputError = false;
                    if(props.error?.type === 'entry' && props.error.i === props.index && props.error.j === j){
                        entryError = true;
                    }
                    else if(props.error?.type === 'output' && props.error.i === props.index && props.error.j === j){
                        outputError = true;
                    }

                    return(
                        <Entry entryError = {entryError} output = {props.outputs[j]} 
                        changeOutput = {props.changeOutput} lastSelected = {props.lastSelected} changeEntry = {props.changeEntry}
                        numberOfOutputVars = {props.numberOfOutputVars} 
                        key={comb} i = {props.index} j = {j} val = {props.entries[j]} 
                        outputError = {outputError}
                        errorMessage = {(entryError || outputError) ? props.error?.message : ''}
                        />
                    )
                })
            }
        </tr>
    )
}


const TableBody : React.FC<{
    entries : string[][],
    outputs : string[][],
    error : Error | null,
    states : string[],
    numberOfInputVars : number,
    numberOfOutputVars : number,
    numberOfStates : number,
    lastSelected : lastSelected,
    changeStates : (i : number, val : string) => void,
    changeOutput : (i : number, j : number, val : string) => void,
    changeEntry : (i : number, j : number, val : string) => void,
    circuitMode : circuitMode

}> = (props)=>{
    let t : React.ReactNode[] = [];
    for(let i = 0; i < props.numberOfStates; ++i){
        t. push(<Row {...props} index = {i} entries = {props.entries[i]} stateVal = {props.states[i]} key = {i} outputs={props.outputs[i]} />)
    }
    return(
        <tbody>
            {t}
        </tbody>
    )
}

export default StateTableInput;

export {StateEntry, chekcValidLetters, ErrorText};